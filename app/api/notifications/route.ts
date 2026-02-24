import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Internal server error.";
}


/**
 * GET /api/notifications
 * List notifications for the admin
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(notifications);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Create a new notification (Internal use or system-triggered)
 */
export async function POST(req: Request) {
  try {
    // Note: In a production environment, you might want to protect this 
    // or only allow internal calls, but for MVP simple creation is fine.
    const body = await req.json();
    const { type, message, link } = body;

    if (!type || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const notification = await Notification.create({
      type,
      message,
      link,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
