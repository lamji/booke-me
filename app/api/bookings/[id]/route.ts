import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";

/**
 * PATCH /api/bookings/[id] — Update booking status (approve/cancel)
 *
 * Used by admin panel to manage booking lifecycle.
 */

import Notification from "@/lib/models/Notification";
import { updateBookingStatusSchema } from "@/lib/validation/booking";
import { logAuditAction } from "@/lib/security/audit";
import { getToken } from "next-auth/jwt";
import { sendMail, EmailTemplates } from "@/lib/mail";
import { format } from "date-fns";

interface RouteParams {
  params: Promise<{ id: string }>;
}


export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const token = await getToken({ req });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const json = await req.json();
    const result = updateBookingStatusSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { status } = result.data;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    // AUDIT LOG: Record admin action
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    await logAuditAction({
      userId: token.sub || "unknown",
      action: "UPDATE_BOOKING_STATUS",
      targetId: id,
      details: { status }, 
      ip,
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    // 4. Trigger Notifications & Emails (Async)
    // Create Internal Notification
    try {
      await Notification.create({
        type: "status_change",
        message: `Booking for ${booking.clientName} on ${format(new Date(booking.eventDate), "PPP")} has been ${status}`,
        link: `/admin/bookings/${String(booking._id)}`,
      });
    } catch (nErr) {
      console.error("[Booking Status API] Failed to create notification:", nErr);
    }

    // Fire & Forget Email Notification
    if (status === "completed") {
      sendMail({
        to: booking.clientEmail,
        subject: `Thank you for choosing BOOK.ME! - ${booking.eventType}`,
        html: EmailTemplates.reviewRequest(booking.clientName, booking.bookingId, booking.eventType),
      }).catch(console.error);
    } else {
      sendMail({
        to: booking.clientEmail,
        subject: `BOOK.ME - Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: EmailTemplates.bookingStatusChange(booking.clientName, status, booking.bookingId),
      }).catch(console.error);
    }

    // Socket.IO Emission
    try {
      const { io } = await import("socket.io-client");
      const { getBaseUrl } = await import("@/lib/utils/base-url");
      const socket = io(getBaseUrl(), { path: "/api/socketio", addTrailingSlash: false });
      socket.on("connect", () => {
        socket.emit("booking-update", booking);
        setTimeout(() => socket.disconnect(), 1000);
      });
    } catch (sErr) {
      console.error("[Booking Status API] Failed to emit socket event:", sErr);
    }

    return NextResponse.json({
      message: `Booking ${status} successfully.`,
      booking,
    });
  } catch (error) {
    console.error("[API] PATCH /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
