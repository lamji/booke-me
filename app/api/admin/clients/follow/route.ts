import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Client from "@/lib/models/Client";
import { sendMail } from "@/lib/mail";
import { logAuditAction } from "@/lib/security/audit";

/**
 * POST /api/admin/clients/follow
 * 
 * Sends a manual follow-up email to a lead/client.
 * Protected: Admin only.
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, subject, body, footer } = await req.json();

    if (!email || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const client = await Client.findOne({ email }).lean();
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Assemble the email HTML
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="margin-bottom: 20px;">
          ${body.replace(/\n/g, '<br/>')}
        </div>
        ${footer ? `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 13px;">
            ${footer.replace(/\n/g, '<br/>')}
          </div>
        ` : ''}
        <div style="margin-top: 30px; font-size: 12px; color: #999;">
          Sent from BOOK.ME Administration
        </div>
      </div>
    `;

    await sendMail({
      to: email,
      subject: subject,
      html: html,
    });

    // Update last followed up at
    await Client.updateOne(
      { email },
      { $set: { lastFollowedUpAt: new Date() } }
    );

    // Audit Log
    await logAuditAction({
      userId: session.user.email || "admin",
      action: "FOLLOW_UP_EMAIL",
      targetId: String(client._id),
      details: { subject },
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({ message: "Follow-up email sent successfully!" });
  } catch (error) {
    console.error("[API] POST /api/admin/clients/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
