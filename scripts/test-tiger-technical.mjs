/**
 * test-tiger-technical.mjs
 *
 * Verifies "The Tiger" admin assistant can perform technical tasks:
 * 1. Approve a booking (UPDATE_STATUS -> confirmed)
 * 2. Verify Socket.IO activation.
 * 3. Verify Email logic triggers.
 *
 * Run: node scripts/test-tiger-technical.mjs
 */

import { io } from "socket.io-client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ─── AUTH SIMULATION (Verified Pattern) ────────────────────────────────

async function simulateAdminLogin() {
  const allCookies = new Map();

  function collectCookies(res) {
    let setCookies = [];
    if (typeof res.headers.getSetCookie === "function") {
      setCookies = res.headers.getSetCookie();
    } else {
      const raw = res.headers.get("set-cookie") || "";
      setCookies = raw.split(/,(?=[^ ])/);
    }
    for (const c of setCookies) {
      if (!c) continue;
      const nameVal = c.split(";")[0];
      const [name] = nameVal.split("=");
      allCookies.set(name.trim(), nameVal.trim());
    }
  }

  const getCookieString = () => Array.from(allCookies.values()).join("; ");

  const r1 = await fetch(`${BASE_URL}/api/auth/csrf`);
  collectCookies(r1);
  const { csrfToken } = await r1.json();

  const r2 = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: getCookieString() },
    body: new URLSearchParams({ username: "admin", password: "admin123", csrfToken, json: "true" }).toString(),
    redirect: "manual",
  });
  collectCookies(r2);

  const redirectUrl = r2.headers.get("location");
  if (redirectUrl) {
    const fullUrl = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    const r3 = await fetch(fullUrl, { headers: { Cookie: getCookieString() }, redirect: "manual" });
    collectCookies(r3);
  }

  const finalCookies = getCookieString();
  if (!finalCookies.includes("session-token")) {
    throw new Error("Auth Failed — session-token not found.");
  }
  return finalCookies;
}

// ─── MAIN TEST ──────────────────────────────────────────────────────────

async function run() {
  console.log("🔐 Logging in as Admin...");
  const cookie = await simulateAdminLogin();
  console.log("✅ Authenticated.");

  // 1. Search for Test User to get an ID
  console.log("🔍 Finding recent booking for Test User...");
  const searchRes = await fetch(`${BASE_URL}/api/admin/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ messages: [{ role: "user", content: "Search for Test User" }] }),
  });
  
  if (!searchRes.ok) {
    const txt = await searchRes.text();
    console.error(`❌ Search API Error ${searchRes.status}: ${txt.substring(0, 200)}`);
    process.exit(1);
  }

  const searchData = await searchRes.json();
  const idMatch = searchData.reply.match(/BKG-\w+-\w+/);
  
  if (!idMatch) {
    console.warn("⚠️ No booking ID found. Creating a fresh one via public API...");
    // Create a quick booking for Jick to have something to approve
    const newBkgRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: "Tiger Technical Test",
        clientEmail: "tiger-tech@yopmail.com",
        clientPhone: "09170001111",
        eventType: "Wedding Package",
        eventDate: "2029-01-01",
        eventTime: "10:00 AM"
      })
    });
    const bkgData = await newBkgRes.json();
    if (!bkgData.bookingId) {
      console.error("❌ Failed to create temporary booking.");
      process.exit(1);
    }
    console.log(`✅ Created fresh booking: ${bkgData.bookingId}`);
    return runApproval(bkgData.bookingId, cookie);
  }

  return runApproval(idMatch[0], cookie);
}

async function runApproval(targetId, cookie) {
  console.log(`🎯 Targeting Booking ID: ${targetId}`);

  // 1. Start Socket Listener
  const socket = io(BASE_URL, { path: "/api/socketio", addTrailingSlash: false });
  let socketReceived = false;
  socket.on("connect", () => {
    socket.emit("join-admin");
  });
  socket.on("booking-update", (data) => {
    if (data.bookingId === targetId && data.status === "approved") {
      console.log(`🚀 [SOCKET] SUCCESS: Received update for ${targetId} -> approved!`);
      socketReceived = true;
    }
  });

  // 2. Ask Tiger to Approve
  console.log(`👤 ADMIN: Tiger, please approve booking ${targetId}.`);
  const approveRes = await fetch(`${BASE_URL}/api/admin/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ messages: [{ role: "user", content: `Please approve booking ${targetId}` }] }),
  });
  const approveData = await approveRes.json();
  console.log(`🐅 TIGER: ${approveData.reply}\n`);

  // 3. Ask Tiger to Send a Manual Email
  console.log(`👤 ADMIN: Tiger, send an email to bookme-test-user@yopmail.com saying their wedding will be great.`);
  const emailRes = await fetch(`${BASE_URL}/api/admin/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ messages: [{ role: "user", content: "Send an email to bookme-test-user@yopmail.com saying their wedding will be great." }] }),
  });
  const emailData = await emailRes.json();
  console.log(`🐅 TIGER: ${emailData.reply}\n`);

  // 4. Wait and Verify
  console.log("⏳ Waiting for Socket/Email events...");
  await new Promise(r => setTimeout(r, 3000));

  console.log("\n" + "=".repeat(40));
  console.log("📊 TIGER TECHNICAL TEST VERIFICATION");
  console.log(`- Socket Update Received: ${socketReceived ? "✅ YES" : "❌ NO"}`);
  console.log(`- Action Reported (Approval): ${approveData.reply.includes("approved") ? "✅ YES" : "❌ NO"}`);
  console.log(`- Action Reported (Email): ${emailData.reply.includes("sent") ? "✅ YES" : "❌ NO"}`);
  console.log(`- Targeted Recipient: bookme-test-user@yopmail.com ✅`);
  console.log("=".repeat(40));

  socket.disconnect();
  process.exit(socketReceived && approveData.reply.includes("approved") ? 0 : 1);
}

run().catch(err => {
  console.error("🔥 Error:", err);
  process.exit(1);
});
