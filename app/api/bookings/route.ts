import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Client from "@/lib/models/Client";
import { generateBookingId } from "@/lib/utils/id-generator";



/**
 * POST /api/bookings — Create a new booking
 * GET  /api/bookings — List all bookings (admin)
 *
 * Pagination enforced per scalability protocol.
 */

import { createBookingSchema } from "@/lib/validation/booking";
import { format, startOfDay, endOfDay } from "date-fns";
import { sendMail, EmailTemplates } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const json = await req.json();
    const result = createBookingSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const body = result.data;
    const { eventType, eventDate, eventTime, clientName, clientEmail, clientPhone } = body;

    // Check for date conflicts (prevent double booking)
    const conflict = await Booking.findOne({
      eventDate: {
        $gte: startOfDay(new Date(eventDate)),
        $lte: endOfDay(new Date(eventDate)),
      },
      status: { $ne: "canceled" },
    });

    if (conflict) {
      return NextResponse.json(
        { error: `This date (${format(new Date(eventDate), "PPP")}) is already fully booked.` },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      eventType,
      eventDate: new Date(eventDate),
      eventTime,
      clientName,
      clientEmail,
      clientPhone,
      notes: body.notes || "",
      addOns: body.addOns || [],
      status: "pending",
    });

    // --- Sync Client Data ---
    try {
      await Client.findOneAndUpdate(
        { email: clientEmail.toLowerCase() },
        { 
          $set: { 
            name: clientName,
            phone: clientPhone,
            type: "existing",
            lastBookingId: booking.bookingId
          }
        },
        { upsert: true }
      );
    } catch (cErr) {
      console.error("[Booking API] Failed to sync Client:", cErr);
    }

    // Create Notification record for Admin
    try {
      const Notification = (await import("@/lib/models/Notification")).default;
      await Notification.create({
        type: "new_booking",
        message: `New booking request from ${clientName} for ${eventType}`,
        link: `/admin/bookings/${String(booking._id)}`,
      });
    } catch (nErr) {
      console.error("[Booking API] Failed to create notification:", nErr);
    }


    // Fire & Forget Email Notification
    const formattedDate = format(new Date(eventDate), "PPP");
    
    // Client Email
    sendMail({
      to: clientEmail,
      subject: "BOOK.ME - Booking Received",
      html: EmailTemplates.bookingReceived(clientName, formattedDate, eventTime, booking.bookingId),
    }).catch(console.error);

    // Admin Email
    if (process.env.ADMIN_EMAIL) {
      sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: "🚨 [ADMIN] New Booking Alert",
        html: EmailTemplates.adminBookingReceived(clientName, formattedDate, eventTime, eventType, booking.bookingId),
      }).catch(console.error);
    }

    // Socket.IO Emission
    try {
      const { io } = await import("socket.io-client");
      const { getBaseUrl } = await import("@/lib/utils/base-url");
      const socket = io(getBaseUrl(), { path: "/api/socketio", addTrailingSlash: false });
      socket.on("connect", () => {
        socket.emit("new-booking", booking);
        socket.emit("new-notification", {
          type: "new_booking",
          message: `New booking request from ${clientName} for ${eventType}`,
        });
        setTimeout(() => socket.disconnect(), 1000);
      });
    } catch (sErr) {
      console.error("[Booking API] Failed to emit socket event:", sErr);
    }

    return NextResponse.json(
      { message: "Booking submitted successfully!", booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");
    const eventType = searchParams.get("eventType");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (eventType && eventType !== "all") filter.eventType = eventType;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ [sortBy]: sortOrder as 1 | -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
