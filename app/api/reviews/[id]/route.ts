import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Allowed fields to update
    const { status, featured } = body;
    const updateData: { status?: string; featured?: boolean } = {};
    if (status) updateData.status = status;
    if (typeof featured === "boolean") updateData.featured = featured;

    const review = await Review.findByIdAndUpdate(id, updateData, { new: true });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error("[API] PATCH /api/reviews/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
