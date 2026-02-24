import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { startOfDay, endOfDay } from "date-fns";

/**
 * POST /api/bookings/availability — Check date/time availability
 *
 * Returns whether the requested slot is free or taken.
 */

import { checkAvailabilitySchema } from "@/lib/validation/booking";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const json = await req.json();
    const result = checkAvailabilitySchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { available: false, message: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { eventDate } = result.data;

    const target = new Date(eventDate);
    const conflict = await Booking.findOne({
      eventDate: {
        $gte: startOfDay(target),
        $lte: endOfDay(target),
      },
      status: { $ne: "canceled" },
    }).lean();

    if (conflict) {
      return NextResponse.json({
        available: false,
        message: "This date is already completely booked.",
      });
    }

    return NextResponse.json({
      available: true,
      message: "This date is available!",
    });
  } catch (error) {
    console.error("[API] POST /api/bookings/availability error:", error);
    return NextResponse.json(
      { available: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
