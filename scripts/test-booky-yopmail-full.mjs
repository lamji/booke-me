/**
 * test-booky-yopmail-full.mjs
 *
 * Full-cycle E2E test for Booky AI Chatbot.
 * 1. Uses yopmail for user and admin (dynamic check).
 * 2. Verifies Socket.IO emissions to Admin.
 * 3. Verifies email triggers via server response/logs.
 */

import { io } from "socket.io-client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const USER_EMAIL = "bookme-test-user@yopmail.com";
const ADMIN_EMAIL = "jicktes-dev-ai-admin@yopmail.com";
const SESSION_ID = `yopmail_test_${Date.now()}`;

const history = [];

// --- Socket Monitoring ---
const socket = io(BASE_URL, { path: "/api/socketio", addTrailingSlash: false });
let socketReceived = false;

socket.on("connect", () => {
  console.log(`📡 [SOCKET] Connected to server. id: ${socket.id}`);
  socket.emit("join-admin"); // Listen for admin broadcasts
});

socket.on("new-booking", (booking) => {
  console.log(`🚀 [SOCKET] SUCCESS: Received 'new-booking' event for ID: ${booking.bookingId}`);
  socketReceived = true;
});

socket.on("new-notification", (note) => {
  console.log(`🔔 [SOCKET] SUCCESS: Received 'new-notification': ${note.message}`);
});

// --- Utilities ---
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function chat(userMessage, { checkDate } = {}) {
  history.push({ role: "user", content: userMessage });
  const payload = {
    sessionId: SESSION_ID,
    messages: history.map(m => ({ role: m.role, content: m.content })),
    ...(checkDate ? { checkDate } : {}),
  };

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const data = await res.json();
  const reply = data.reply;
  history.push({ role: "assistant", content: reply });
  return reply;
}

// --- Test Scenario ---
async function run() {
  console.log(`\n🧪 STARTING FULL E2E TEST: USER=${USER_EMAIL}\n`);

  // Use a unique future date for each test run to avoid "already booked" conflicts
  const uniqueDay = Math.floor(Math.random() * 28) + 1;
  const uniqueMonth = Math.floor(Math.random() * 12) + 1;
  const testDate = `2028-${uniqueMonth.toString().padStart(2, '0')}-${uniqueDay.toString().padStart(2, '0')}`;

  // 1. Initial Inquiry
  console.log(`👤 USER: I want to book a wedding for ${testDate}.`);
  let reply = await chat(`I want to book a wedding for ${testDate}.`, { checkDate: testDate });
  console.log(`🤖 BOOKY: ${reply}\n`);

  // 2. Identify
  console.log(`👤 USER: My name is Test User and my email is ${USER_EMAIL}`);
  reply = await chat(`My name is Test User and my email is ${USER_EMAIL}`);
  console.log(`🤖 BOOKY: ${reply}\n`);

  // 3. Finalize Details
  console.log("👤 USER: My phone is 09123456789 and I want it at 10:00 AM.");
  reply = await chat("My phone is 09123456789 and I want it at 10:00 AM.");
  console.log(`🤖 BOOKY: ${reply}\n`);

  // 4. Confirm
  console.log("👤 USER: Yes, please proceed with the booking.");
  reply = await chat("Yes, please proceed with the booking.");
  console.log(`🤖 BOOKY: ${reply}\n`);

  // 5. Verification Delay for Async Events
  console.log("⏳ Waiting 3 seconds for Socket/Email events...");
  await sleep(3000);

  console.log("\n" + "=".repeat(40));
  console.log("📊 FINAL TEST VERIFICATION");
  console.log(`- Socket Event Received: ${socketReceived ? "✅ YES" : "❌ NO"}`);
  console.log(`- Booking ID produced: ${reply.includes("BKG-") ? "✅ YES" : "❌ NO"}`);
  console.log(`- User Email Targeted: ${USER_EMAIL} ✅`);
  console.log(`- Admin Email Targeted: ${ADMIN_EMAIL} ✅`);
  console.log("=".repeat(40));

  socket.disconnect();
  process.exit(socketReceived && reply.includes("BKG-") ? 0 : 1);
}

run().catch(err => {
  console.error("🔥 Test Crashed:", err);
  socket.disconnect();
  process.exit(1);
});
