/**
 * test-booky-inquiry.mjs
 *
 * Simulates a real user inquiry with the Booky chatbot.
 * Acts as a potential wedding client going from cold inquiry → booking.
 *
 * Run: node scripts/test-booky-inquiry.mjs
 */

const BASE_URL = "http://localhost:3000";
const SESSION_ID = `test_session_${Date.now()}`;

// Conversation history maintained across all turns
const history = [];

// ─── Utility ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function printDivider() {
  console.log("\n" + "─".repeat(60) + "\n");
}

function printUser(text) {
  console.log(`👤 USER:  ${text}`);
}

function printBooky(text) {
  console.log(`🤖 BOOKY: ${text}`);
}

function printSystem(text) {
  console.log(`\n⚙️  [SYSTEM] ${text}\n`);
}

// ─── Core chat function ───────────────────────────────────────────────────────

async function chat(userMessage, { checkDate } = {}) {
  // Add user message to history
  history.push({ role: "user", content: userMessage });

  const payload = {
    sessionId: SESSION_ID,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    ...(checkDate ? { checkDate } : {}),
  };

  let reply;
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      reply = `[API ERROR ${res.status}]: ${err}`;
    } else {
      const data = await res.json();
      reply = data.reply || "[No reply field in response]";
    }
  } catch (err) {
    reply = `[NETWORK ERROR]: ${err.message}`;
  }

  // Add assistant reply to history
  history.push({ role: "assistant", content: reply });

  return reply;
}

// ─── Main Inquiry Simulation ──────────────────────────────────────────────────

async function runInquiry() {
  console.log("=".repeat(60));
  console.log("  🔍 BOOKY AUTOMATED INQUIRY TEST");
  console.log("  Simulating: Cold → Inquiry → Availability → Booking");
  console.log(`  Session ID: ${SESSION_ID}`);
  console.log("=".repeat(60));

  // ── Turn 1: Cold open, just saying hi ──
  await sleep(500);
  printDivider();
  let msg = "Hi there!";
  printUser(msg);
  let reply = await chat(msg);
  printBooky(reply);

  // ── Turn 2: Ask about events without name/email ──
  await sleep(1000);
  printDivider();
  msg = "What events do you offer?";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 3: Provide name ──
  await sleep(1000);
  printDivider();
  msg = "My name is Jick Lamji.";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 4: Provide email ──
  await sleep(1000);
  printDivider();
  msg = "My email is jick.lamji@gmail.com";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 5: Ask about wedding package ──
  await sleep(1000);
  printDivider();
  msg = "Great! Can you tell me more about the Wedding Package and how much it costs?";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 6: Ask about add-ons ──
  await sleep(1000);
  printDivider();
  msg = "What add-ons are available for the wedding? Is there a live band option?";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 7: Ask about availability for May 10 (no year — tests regex) ──
  await sleep(1000);
  printDivider();
  msg = "Is May 10 available for a wedding?";
  printSystem("Sending checkDate: 2026-05-10 along with this message");
  printUser(msg);
  reply = await chat(msg, { checkDate: "2026-05-10" });
  printBooky(reply);

  // ── Turn 8: Follow up - what if that date is taken? Ask about May 17 ──
  await sleep(1000);
  printDivider();
  msg = "What about May 17? Is that available?";
  printSystem("Sending checkDate: 2026-05-17 along with this message");
  printUser(msg);
  reply = await chat(msg, { checkDate: "2026-05-17" });
  printBooky(reply);

  // ── Turn 9: Express booking intent ──
  await sleep(1000);
  printDivider();
  msg = "Okay, I'd like to proceed and book the Wedding Package for May 17. The date looks good!";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 10: Provide phone ──
  await sleep(1000);
  printDivider();
  msg = "My phone number is 09171234567.";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 11: Provide time ──
  await sleep(1000);
  printDivider();
  msg = "I'd like it at 2:00 PM.";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Turn 12: Confirmation or further clarification ──
  await sleep(1000);
  printDivider();
  msg = "Yes, that all looks correct. Please proceed with the booking!";
  printUser(msg);
  reply = await chat(msg);
  printBooky(reply);

  // ── Final Summary ──
  printDivider();
  console.log("✅  INQUIRY TEST COMPLETE");
  console.log(`   Total turns: ${Math.floor(history.length / 2)}`);

  // Check for booking success
  const lastReply = history[history.length - 1].content;
  if (lastReply.includes("BKG-")) {
    const idMatch = lastReply.match(/BKG-\w+-\w+/);
    console.log(`   🎉 BOOKING REGISTERED! ID: ${idMatch ? idMatch[0] : "found in reply"}`);
  } else if (lastReply.includes("BOOK_CMD")) {
    console.log("   ⚠️  Booking command was produced but not processed (check server).");
  } else {
    console.log("   ℹ️  No booking registered in this flow (may need more steps or date conflict).");
  }
  console.log("=".repeat(60));
}

runInquiry().catch((err) => {
  console.error("\n🔥 FATAL ERROR in inquiry script:", err);
  process.exit(1);
});
