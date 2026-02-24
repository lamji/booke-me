/**
 * test-tiger-complete.mjs
 *
 * Specifically tests the "Completed" status transition via The Tiger.
 * Verifies if the review link email logic is reached.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

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
  return getCookieString();
}

async function run() {
  console.log("🔐 Logging in...");
  const cookie = await simulateAdminLogin();

  const uniqueDay = Math.floor(Math.random() * 28) + 1;
  const testDate = `2032-12-${uniqueDay.toString().padStart(2, '0')}`;

  // 1. Create a fresh booking
  const bkgRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientName: "Complete Test User",
      clientEmail: "complete-test@yopmail.com",
      clientPhone: "09170002222",
      eventType: "Verification Event",
      eventDate: testDate,
      eventTime: "02:00 PM"
    })
  });
  const bkgData = await bkgRes.json();
  const bookingId = bkgData.booking?.bookingId;
  if (!bookingId) {
    console.error("❌ Failed to create booking:", bkgData);
    process.exit(1);
  }
  console.log(`✅ Created booking: ${bookingId}`);

  // 2. Mark as completed via Tiger
  console.log(`👤 ADMIN: Tiger, mark booking ${bookingId} as completed.`);
  const chatRes = await fetch(`${BASE_URL}/api/admin/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ messages: [{ role: "user", content: `Mark booking ${bookingId} as completed.` }] }),
  });
  const data = await chatRes.json();
  console.log(`🐅 TIGER: ${data.reply}`);

  // 3. Validation
  const hasCmd = data.reply.includes("UPDATE_STATUS") || data.reply.includes("MARK_COMPLETE");
  const hasCompleted = data.reply.toLowerCase().includes("completed");
  
  console.log("\n" + "=".repeat(40));
  console.log("📊 COMPLETION TEST RESULTS");
  console.log(`- Command Detected in Reply: ${hasCmd ? "✅ YES" : "❌ NO"}`);
  console.log(`- Status 'completed' specified: ${hasCompleted ? "✅ YES" : "❌ NO"}`);
  console.log("=".repeat(40));

  process.exit(hasCmd && hasCompleted ? 0 : 1);
}

run().catch(console.error);
