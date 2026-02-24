import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";

/**
 * GET /api/bookings/dates — Get all fully booked dates
 *
 * This endpoint returns a list of dates that have no available
 * time slots left, or dates with existing active bookings if the MVP
 * limits 1 booking per day.
 * 
 * MVP Strategy: 1 Booking per day.
 */

export async function GET() {
  try {
    await connectDB();

    // Fetch all active bookings
    const bookings = await Booking.find({ status: { $ne: "canceled" } })
      .select("eventDate")
      .lean();

    // Extract unique ISO date strings (midnight normalized)
    const takenDates = [
      ...new Set(
        bookings.map((b) => {
          const d = new Date(b.eventDate);
          return d.toISOString();
        })
      ),
    ];

    return NextResponse.json({ bookedDates: takenDates });
  } catch (error) {
    console.error("[API] GET /api/bookings/dates error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
