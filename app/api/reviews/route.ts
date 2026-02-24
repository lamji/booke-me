import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";
import Booking from "@/lib/models/Booking";
import { z } from "zod";

const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(500),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const json = await req.json();
    const result = createReviewSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const { bookingId, rating, comment } = result.data;

    // Verify booking exists and is completed
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return NextResponse.json({ error: "Review failed: Booking not found." }, { status: 404 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Review failed: You can only review completed events." }, { status: 400 });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this event." }, { status: 409 });
    }

    const review = await Review.create({
      bookingId,
      clientName: booking.clientName,
      eventType: booking.eventType,
      rating,
      comment,
      status: "pending", // Moderation required
    });

    return NextResponse.json({ message: "Thank you! Your review has been submitted for moderation.", review }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";
    
    // Only admins can see pending/rejected reviews
    const filter: Record<string, unknown> = isAdmin ? {} : { status: "approved" };
    
    const isFeatured = searchParams.get("featured") === "true";
    if (isFeatured && !isAdmin) {
      filter.featured = true;
      let reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(3).lean();
      
      // Fallback: If no featured reviews, get latest 3 approved
      if (reviews.length === 0) {
        delete filter.featured;
        reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(3).lean();
      }
      return NextResponse.json(reviews);
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(20).lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("[API] GET /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
