import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
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


    // Fire & Forget Email Notification
    const formattedDate = format(new Date(eventDate), "PPP");
    sendMail({
      to: clientEmail,
      subject: "BOOK.ME - Booking Received",
      html: EmailTemplates.bookingReceived(clientName, formattedDate, eventTime, booking.bookingId),

    }).catch(console.error);

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
