import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Notification from "@/lib/models/Notification";
import { sendMail, EmailTemplates } from "@/lib/mail";
import { format, addDays, startOfDay, endOfDay } from "date-fns";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api/socketio",
  reconnection: false,
});

/**
 * GET /api/cron/reminders
 * 
 * Vercel Cron Job endpoint. Finds all approved bookings exactly 2 days
 * from today and dispatches reminder emails.
 */
export async function GET(request: Request) {
  try {
    // Basic security for cron (Vercel uses Authorization: Bearer CRON_SECRET)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();

    const targetDate = addDays(new Date(), 2);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    // Find bookings 2 days from now
    const upcomingBookings = await Booking.find({
      status: "approved",
      eventDate: {
        $gte: start,
        $lte: end,
      },
      // In a real app, you'd want a flag here `reminderSent: boolean` to avoid duplicate sends
      // if the cron runs twice. For the MVP, we assume the cron runs exactly once per day at 8 AM.
    });

    if (upcomingBookings.length === 0) {
      return NextResponse.json({ message: "No upcoming bookings require reminders today." });
    }

    let sentCount = 0;

    for (const booking of upcomingBookings) {
      const formattedDate = format(new Date(booking.eventDate), "PPP");
      
      // Notify User
      const userMail = await sendMail({
        to: booking.clientEmail,
        subject: "BOOK.ME - Upcoming Event Reminder",
        html: EmailTemplates.eventReminder(
          booking.clientName, 
          formattedDate, 
          booking.eventTime, 
          booking.eventType
        )
      });

      // Notify Admin
      const adminMail = await sendMail({
        to: process.env.ADMIN_EMAIL || "admin@bookme.test",
        subject: `REMINDER: Upcoming Event on ${formattedDate}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #2D3C59;">Upcoming Event Reminder</h2>
            <p><strong>Event:</strong> ${booking.eventType}</p>
            <p><strong>Client:</strong> ${booking.clientName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${booking.eventTime}</p>
            <hr />
            <p>Please ensure all staff and resources are coordinated for this booking.</p>
          </div>
        `
      });

      // Create App Notification for Admin
      const notification = await Notification.create({
        type: "reminder",
        message: `Event Reminder: ${booking.eventType} for ${booking.clientName} on ${formattedDate}`,
      });

      // Emit to Socket
      if (!socket.connected) {
        await new Promise((resolve) => {
          socket.once("connect", () => resolve(true));
          // Timeout after 2s to not block cron
          setTimeout(() => resolve(false), 2000);
        });
      }

      if (socket.connected) {
        socket.emit("new-notification", notification);
      }

      if (userMail && adminMail) sentCount++;
    }

    // Cleanup socket
    socket.disconnect();

    return NextResponse.json({ 
      message: `Cron executed successfully. Reminders sent: ${sentCount}/${upcomingBookings.length}` 
    });

  } catch (error) {
    console.error("[CRON] /api/cron/reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error during cron job." },
      { status: 500 }
    );
  }
}
