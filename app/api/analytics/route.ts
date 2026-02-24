import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import VisitorStats from "@/lib/models/VisitorStats";
import Conversation from "@/lib/models/Conversation";
import Booking from "@/lib/models/Booking";
import { startOfDay, subDays } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/analytics — Admin Analytics Data
 * 
 * Returns:
 * - Total visitors (last 30 days)
 * - Unique visitors (today)
 * - Chat session count
 * - Visit history (for charts)
 */

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);

    const [
      statsToday,
      totalBookings,
      totalConversations,
      history
    ] = await Promise.all([
      VisitorStats.findOne({ date: today }).lean(),
      Booking.countDocuments(),
      Conversation.countDocuments(),
      VisitorStats.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: 1 }).lean()
    ]);

    return NextResponse.json({
      today: {
        visits: statsToday?.count || 0,
        uniques: statsToday?.uniqueSessions?.length || 0,
      },
      totals: {
        bookings: totalBookings,
        chats: totalConversations,
      },
      history: history.map(h => ({
        date: h.date,
        visits: h.count,
        uniques: h.uniqueSessions.length
      }))
    });
  } catch (error) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
