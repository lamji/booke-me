/**
 * test-tiger-admin.mjs
 * 
 * Tests "The Tiger" (Admin Assistant) by simulating an admin session.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function simulateLogin() {
  console.log("🔐 Simulating Admin Login (Verified E2E Pattern)...");
  const allCookies = new Map();

  function collectCookies(res) {
    let setCookies = [];
    if (typeof res.headers.getSetCookie === 'function') {
      setCookies = res.headers.getSetCookie();
    } else {
      const raw = res.headers.get("set-cookie") || "";
      setCookies = raw.split(/,(?=[^ ])/);
    }
    
    // console.log(`  [DEBUG] Headers for ${res.url}:`, [...res.headers.keys()]);
    
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

  // 1. Get CSRF Token
  const res1 = await fetch(`${BASE_URL}/api/auth/csrf`);
  collectCookies(res1);
  const { csrfToken } = await res1.json();

  // 2. Submit Credentials (don't follow redirect)
  const res2 = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": getCookieString(),
    },
    body: new URLSearchParams({
      username: "admin",
      password: "admin123",
      csrfToken,
      json: "true",
    }).toString(),
    redirect: "manual",
  });
  collectCookies(res2);

  // 3. Follow Redirect to capture session cookie (Critical for NextAuth v4/v5)
  const redirectUrl = res2.headers.get("location");
  if (redirectUrl) {
    const fullUrl = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    const res3 = await fetch(fullUrl, {
      headers: { Cookie: getCookieString() },
      redirect: "manual",
    });
    collectCookies(res3);
  }

  const finalCookies = getCookieString();
  if (!finalCookies.includes("session-token")) {
    console.error("❌ Auth Failed: session-token not found in cookies.");
  }
  return finalCookies;
}

async function chatWithTiger(message, cookie) {
  const res = await fetch(`${BASE_URL}/api/admin/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookie,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: message }]
    }),
    redirect: "manual"
  });

  if (!res.ok) {
    if (res.status === 307 || res.status === 302) {
      return `[AUTH ERROR] Redirected to ${res.headers.get("location")}. Session likely invalid.`;
    }
    const text = await res.text();
    return `[SERVER ERROR ${res.status}] ${text.substring(0, 200)}`;
  }

  const data = await res.json();
  return data.reply;
}

async function run() {
  const cookie = await simulateLogin();
  console.log("✅ Authenticated Session established.");

  console.log("\n[TEST 1] Asking for stats...");
  const reply1 = await chatWithTiger("Give me a quick summary of our booking stats.", cookie);
  console.log(`\n🐅 TIGER: ${reply1}`);

  console.log("\n" + "─".repeat(40));
  console.log("[TEST 2] Searching for a client...");
  const reply2 = await chatWithTiger("Search for client Jick Lamji.", cookie);
  console.log(`\n🐅 TIGER: ${reply2}`);
}

run().catch(console.error);
