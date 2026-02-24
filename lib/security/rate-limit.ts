import { NextResponse } from "next/server";

/**
 * Basic In-Memory Rate Limiter (PCI DSS Target)
 * 
 * Note: For production, use Redis. This implementation is for single-instance
 * development/MVP protection against brute force and DDoS.
 */

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export interface RateLimitConfig {
  limit: number;      // Max requests
  windowMs: number;   // Time window in ms
}

export function rateLimit(ip: string, config: RateLimitConfig) {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  // Reset window if expired
  if (now - userData.lastReset > config.windowMs) {
    userData.count = 0;
    userData.lastReset = now;
  }

  userData.count++;
  rateLimitMap.set(ip, userData);

  return {
    success: userData.count <= config.limit,
    current: userData.count,
    limit: config.limit,
    remaining: Math.max(0, config.limit - userData.count),
    reset: userData.lastReset + config.windowMs,
  };
}

export function rateLimitResponse(limitData: ReturnType<typeof rateLimit>) {
  return new NextResponse(
    JSON.stringify({ 
      error: "Too many requests", 
      message: "Please try again later to protect our services." 
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": limitData.limit.toString(),
        "X-RateLimit-Remaining": limitData.remaining.toString(),
        "X-RateLimit-Reset": limitData.reset.toString(),
      },
    }
  );
}
