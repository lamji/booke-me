/**
 * test-tiger-comprehensive.mjs
 *
 * Full multi-scenario test for The Tiger Admin Chatbot.
 * - Simulates real NextAuth admin login (no bypass)
 * - Tests 6 admin-role scenarios
 * - Retries each test up to 3x until Tiger answers correctly
 *
 * Run: node scripts/test-tiger-comprehensive.mjs
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const MAX_RETRIES = 3;
const SLEEP_MS = 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── AUTH SIMULATION (Verified E2E Pattern) ────────────────────────────────

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

  function getCookieString() {
    return Array.from(allCookies.values()).join("; ");
  }

  // Step 1: CSRF
  const r1 = await fetch(`${BASE_URL}/api/auth/csrf`);
  collectCookies(r1);
  const { csrfToken } = await r1.json();

  // Step 2: POST Credentials
  const r2 = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: getCookieString(),
    },
    body: new URLSearchParams({ username: "admin", password: "admin123", csrfToken, json: "true" }).toString(),
    redirect: "manual",
  });
  collectCookies(r2);

  // Step 3: Follow redirect to capture session token
  const redirectUrl = r2.headers.get("location");
  if (redirectUrl) {
    const fullUrl = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    const r3 = await fetch(fullUrl, { headers: { Cookie: getCookieString() }, redirect: "manual" });
    collectCookies(r3);
  }

  const finalCookies = getCookieString();
  if (!finalCookies.includes("session-token")) {
    throw new Error(`Auth Failed — session-token not found. Got: ${finalCookies.substring(0, 80)}`);
  }
  return finalCookies;
}

// ─── TIGER CHAT ────────────────────────────────────────────────────────────

async function askTiger(message, cookie) {
  const res = await fetch(`${BASE_URL}/api/admin/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
    redirect: "manual",
  });

  if (res.status === 307 || res.status === 302) {
    return { ok: false, reply: `[AUTH REDIRECT] Session expired or invalid.` };
  }
  if (!res.ok) {
    const txt = await res.text();
    return { ok: false, reply: `[HTTP ${res.status}] ${txt.substring(0, 150)}` };
  }

  const data = await res.json();
  return { ok: true, reply: data.reply || "[No reply]" };
}

// ─── TEST RUNNER ───────────────────────────────────────────────────────────

async function runTest(label, question, validateFn, cookie) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`🧪 TEST: ${label}`);
  console.log(`❓ Q: ${question}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { ok, reply } = await askTiger(question, cookie);
    console.log(`\n🐅 TIGER (Attempt ${attempt}/${MAX_RETRIES}):\n   ${reply.replace(/\n/g, "\n   ")}`);

    if (!ok) {
      console.log(`   ⚠️  Network/Auth error on attempt ${attempt}. Retrying...`);
      await sleep(SLEEP_MS);
      continue;
    }

    const passed = validateFn(reply);
    if (passed) {
      console.log(`\n   ✅ PASSED`);
      return true;
    } else {
      console.log(`   ❌ FAILED — Response does not meet criteria. Retrying...`);
      await sleep(SLEEP_MS);
    }
  }

  console.log(`\n   🔴 FINAL FAIL after ${MAX_RETRIES} attempts.`);
  return false;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function run() {
  console.log("=".repeat(60));
  console.log("  🐅 TIGER ADMIN CHATBOT — COMPREHENSIVE TEST SUITE");
  console.log("=".repeat(60));

  // Auth
  console.log("\n🔐 Simulating Admin Login...");
  let cookie;
  try {
    cookie = await simulateAdminLogin();
    console.log("✅ Authenticated. Session established.");
  } catch (e) {
    console.error(`🔥 AUTH FAILED: ${e.message}`);
    process.exit(1);
  }

  const results = [];

  // ── TEST 1: Booking Stats
  results.push(await runTest(
    "Booking Stats Overview",
    "How many bookings do we have? Give me a summary.",
    (r) => /booking|pending|confirmed|total|completed/i.test(r),
    cookie
  ));
  await sleep(SLEEP_MS);

  // ── TEST 2: Search Client
  results.push(await runTest(
    "Client Search by Name",
    "Search for client Test User.",
    (r) => /test user|found|no client|search result/i.test(r),
    cookie
  ));
  await sleep(SLEEP_MS);

  // ── TEST 3: Events This Week
  results.push(await runTest(
    "Events Scheduled This Week",
    "Show me all events scheduled for this week.",
    (r) => /week|event|scheduled|no event|found/i.test(r),
    cookie
  ));
  await sleep(SLEEP_MS);

  // ── TEST 4: Off-Topic Block (Guardrail Test)
  results.push(await runTest(
    "Off-Topic Block (Security Guardrail)",
    "Tell me a joke about cats.",
    (r) => /business|operation|admin|not here|only|platform|assist/i.test(r),
    cookie
  ));
  await sleep(SLEEP_MS);

  // ── TEST 5: Revenue Report
  results.push(await runTest(
    "Generate Revenue Report",
    "Generate a revenue report for all bookings.",
    (r) => /report|revenue|total|booking|completed/i.test(r),
    cookie
  ));
  await sleep(SLEEP_MS);

  // ── TEST 6: Specific Month Events
  results.push(await runTest(
    "Events for a Specific Month",
    "What events do we have in May 2026?",
    (r) => /may|2026|event|schedule|no event|booked/i.test(r),
    cookie
  ));
  await sleep(SLEEP_MS);

  // ── TEST 7: Mark Booking Complete (Action Test)
  results.push(await runTest(
    "Mark Booking as Complete",
    "Find the recent booking for Test User and mark it as completed.",
    (r) => /MARK_COMPLETE|completed|success|done/i.test(r),
    cookie
  ));

  // ── Summary ─────────────────────────────────────────────────────────────
  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 TIGER COMPREHENSIVE TEST RESULTS: ${passed}/${total} PASSED`);
  results.forEach((r, i) => console.log(`   Test ${i + 1}: ${r ? "✅ PASSED" : "❌ FAILED"}`));
  console.log("=".repeat(60));

  process.exit(passed === total ? 0 : 1);
}

run().catch((err) => {
  console.error("🔥 Script crashed:", err);
  process.exit(1);
});
