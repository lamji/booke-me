import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

/**
 * Middleware Protection & Security Hooks
 *
 * 1. Protects /admin routes via NextAuth.
 * 2. Implements Rate Limiting for all /api routes.
 *
 * Target: PCI DSS & DDoS Protection
 */

export default withAuth(
  function proxy(req) {
    // Get IP from headers (behind proxy) or direct
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // 1. Apply Rate Limiting to ALL API routes (Public & Private)
    // Exception: Bypass rate limiting for local E2E testing
    if (
      req.nextUrl.pathname.startsWith("/api") &&
      ip !== "127.0.0.1" &&
      ip !== "::1"
    ) {
      const limitConfig = {
        limit: 100, // 100 requests
        windowMs: 15 * 60 * 1000, // per 15 mins
      };

      // Stricter limit for auth and creation
      if (
        req.nextUrl.pathname.includes("/auth") ||
        (req.nextUrl.pathname === "/api/bookings" && req.method === "POST")
      ) {
        limitConfig.limit = 20; // 20 attempts
      }

      const rl = rateLimit(ip, limitConfig);
      if (!rl.success) {
        return rateLimitResponse(rl);
      }
    }

    // 2. Auth Protection Logic
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const { pathname } = req.nextUrl;

    // Admin routes (Admin only)
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Publicly accessible paths (even for the matcher)
        if (
          (pathname === "/api/bookings" && req.method === "POST") ||
          pathname === "/api/bookings/availability" ||
          pathname === "/api/bookings/dates" ||
          pathname === "/api/bookings/find" ||
          pathname === "/api/events" ||
          pathname === "/api/chat" ||
          pathname.startsWith("/api/cron") ||
          pathname.startsWith("/api/auth") ||
          pathname === "/api/settings"
        ) {
          return true;
        }

        // Allow NextAuth client JSON fetches to return JSON instead of an HTML redirect.
        // Some NextAuth client requests expect JSON (e.g. `fetch('/api/auth/session')`) and will fail
        // with "Unexpected token '<'" if the middleware returns an HTML redirect page.
        const accept = req.headers.get("accept") || "";
        if (
          pathname.startsWith("/api/auth") &&
          accept.includes("application/json")
        ) {
          return true;
        }

        // Everything else in the matcher requires a token
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
