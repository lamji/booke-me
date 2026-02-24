import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import crypto from "crypto";

const ADMIN_SECRET = process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret";
const TOKEN_TTL_SECONDS = 3600; // 1 hour

/**
 * GET /api/admin/booking/[id]
 *
 * Admin-only endpoint. Requires a valid HMAC token in the query string.
 * Token is signed using NEXTAUTH_SECRET and bound to the booking ID + expiry.
 *
 * Usage: /api/admin/booking/[id]?token=<hmac>&exp=<unix_ts>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const expStr = searchParams.get("exp");

  if (!token || !expStr) {
    return NextResponse.json({ error: "Missing authentication token." }, { status: 401 });
  }

  const exp = parseInt(expStr, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (isNaN(exp) || nowSeconds > exp) {
    return NextResponse.json({ error: "Token has expired. Please re-open from the admin panel." }, { status: 401 });
  }

  // Verify HMAC signature: sign(id + ":" + exp)
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${id}:${exp}`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expectedSig, "hex"))) {
    return NextResponse.json({ error: "Invalid or tampered token." }, { status: 403 });
  }

  try {
    await connectDB();
    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * POST /api/admin/booking/[id]
 *
 * Issues a new short-lived HMAC token for the given booking ID.
 * The caller must be an authenticated admin (protected by next-auth middleware).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${id}:${exp}`)
    .digest("hex");

  return NextResponse.json({ token, exp });
}
