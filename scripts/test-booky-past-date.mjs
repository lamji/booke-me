/**
 * test-booky-past-date.mjs
 * 
 * Verifies that Booky correctly rejects bookings for past dates.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SESSION_ID = `test_past_${Date.now()}`;
const history = [];

async function chat(userMessage, { checkDate } = {}) {
  history.push({ role: "user", content: userMessage });
  const payload = {
    sessionId: SESSION_ID,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    ...(checkDate ? { checkDate } : {}),
  };

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  const reply = data.reply;
  history.push({ role: "assistant", content: reply });
  return reply;
}

async function run() {
  console.log("🧪 Testing Past Date Rejection...");
  
  // 1. Identify
  await chat("Hi, I'm Jick. My email is jick@example.com");
  
  // 2. Ask for past date
  console.log("\n[STEP 1] Asking for May 17, 2001 (Past Date)");
  const reply1 = await chat("Is May 17, 2001 available?", { checkDate: "2001-05-17" });
  console.log(`🤖 BOOKY: ${reply1}`);

  if (reply1.toLowerCase().includes("past") || reply1.toLowerCase().includes("accept future")) {
    console.log("✅ SUCCESS: Booky detected and rejected the past date.");
  } else {
    console.log("❌ FAILURE: Booky did not clearly reject the past date.");
  }

  // 3. Try to force book a past date
  console.log("\n[STEP 2] Attempting to book a past date (2020-01-01)");
  await chat("I want to book the Wedding Package for Jan 1, 2020");
  await chat("Phone is 0912345678");
  const finalReply = await chat("Time is 10:00 AM. Confirm booking.");
  
  console.log(`🤖 BOOKY (at confirmation): ${finalReply}`);
  
  if (finalReply.includes("BKG-")) {
    console.log("❌ FAILURE: Booky registered a booking in the past!");
  } else {
    console.log("✅ SUCCESS: Booky blocked the past date booking.");
  }
}

run().catch(console.error);
