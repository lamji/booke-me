import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Settings from "@/lib/models/Settings";
import { getToken } from "next-auth/jwt";
import { updateSettingsSchema } from "@/lib/validation/settings";

/**
 * GET /api/settings — Retrieve global settings
 * PUT /api/settings — Update global settings (Admin only)
 */

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne().lean();

    if (!settings) {
      // Return default settings if none exist yet
      settings = {
        contactEmail: "info@bookme.events",
        contactPhone: "+1 (555) 000-0000",
        address: "123 Event St, Celebration City",
        policy: "Default Policy content...",
        termsAndConditions: "Default Terms and Conditions content...",
        cancellationPolicy: "Default Cancellation Policy content...",
      };
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[API] GET /api/settings error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const json = await req.json();
    const result = updateSettingsSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { contactEmail, contactPhone, address, policy, termsAndConditions, cancellationPolicy } = result.data;

    const settings = await Settings.findOneAndUpdate(
      {},
      { contactEmail, contactPhone, address, policy, termsAndConditions, cancellationPolicy },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("[API] PUT /api/settings error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
