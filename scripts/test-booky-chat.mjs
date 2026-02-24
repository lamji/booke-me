/**
 * 🧪 Booky Chat API — Standalone Verification Script
 *
 * Tests POST /api/chat with a real question about events.
 * Expected: Groq returns a Booky-persona response grounded in knowledge base.
 *
 * PREREQUISITE: Dev server must be running (npm run dev)
 */

const BASE = "http://localhost:3000";

async function testChat(label, payload, expectInResponse) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (res.status !== 200) {
    console.error(`❌ [${label}] Status ${res.status}:`, data);
    return false;
  }

  const reply = data.reply || "";
  const passed = expectInResponse
    ? reply.toLowerCase().includes(expectInResponse.toLowerCase())
    : reply.length > 10;

  console.log(`${passed ? "✅" : "⚠️ "} [${label}]`);
  console.log(`   Q: ${payload.messages[payload.messages.length - 1].content}`);
  console.log(`   A: ${reply.slice(0, 180)}...\n`);
  return passed;
}

(async () => {
  console.log("🤖 Booky Chat API — Verification Test\n");

  const results = await Promise.all([
    testChat(
      "Greeting",
      { messages: [{ role: "user", content: "Hi! What is Book.Me?" }] },
      "book"
    ),
    testChat(
      "Events List",
      { messages: [{ role: "user", content: "What events do you offer?" }] },
      "package"
    ),
    testChat(
      "Pricing",
      { messages: [{ role: "user", content: "What are the prices for your packages?" }] },
      null // Just check it returns something
    ),
    testChat(
      "Off-Topic Block",
      {
        messages: [
          { role: "user", content: "Can you write me a React component in TypeScript?" },
        ],
      },
      null // Should decline, just check it responds
    ),
    testChat(
      "Availability Check",
      {
        messages: [
          {
            role: "user",
            content: "Is 2026-12-25 available for booking?",
          },
        ],
        checkDate: "2026-12-25",
      },
      "availab"
    ),
  ]);

  const passed = results.filter(Boolean).length;
  console.log(`\n📊 Results: ${passed}/${results.length} tests passed`);
  process.exit(passed === results.length ? 0 : 1);
})();
