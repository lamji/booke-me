import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";

/**
 * GET /api/bookings/find
 * 
 * Find a booking by email OR exactly matching ID.
 * Returns the first matching booking found.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (!email && !id) {
      return NextResponse.json(
        { error: "Must provide either email or booking ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const query: Record<string, unknown> = {};
    if (id) {
       // Search by our professional ID or MongoDB ID as fallback
       query.$or = [
         { bookingId: id },
         { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }
       ].filter(item => item._id !== undefined || item.bookingId !== undefined);
    } else if (email) {
        query.clientEmail = new RegExp(`^${email}$`, "i"); // Case insensitive
    }


    const booking = await Booking.findOne(query).lean();

    if (!booking) {
      return NextResponse.json(
        { error: "No booking found with the provided details." },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "CastError") {
      // Trying to query Mongo ObjectId with an invalid string length
      return NextResponse.json(
        { error: "Invalid Booking ID format." },
        { status: 400 }
      );
    }
    console.error("[API] GET /api/bookings/find error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
