import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Client from "@/lib/models/Client";

/**
 * GET /api/admin/clients
 * 
 * Returns all clients with optional type filtering.
 * Protected: Admin only.
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "existing" | "potential"
    
    await connectDB();

    const query: { type?: string } = {};
    if (type) query.type = type;

    const clients = await Client.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("[API] GET /api/admin/clients error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
