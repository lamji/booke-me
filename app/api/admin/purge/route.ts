import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Notification from "@/lib/models/Notification";
import Review from "@/lib/models/Review";
import { getToken } from "next-auth/jwt";

/**
 * POST /api/admin/purge
 * 
 * Purge all bookings, notifications, and reviews from the database.
 * Admin only.
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Purge collections
    await Promise.all([
      Booking.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
    ]);

    return NextResponse.json({ message: "Database purged successfully." });
  } catch (error) {
    console.error("[Purge API] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
