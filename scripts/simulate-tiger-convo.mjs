/**
 * simulate-tiger-convo.mjs
 * 
 * 20+ turn simulation to stress test The Tiger's accuracy and dynamic context.
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function simulateLogin() {
  const allCookies = new Map();

  function collectCookies(res) {
    let setCookies = [];
    if (typeof res.headers.getSetCookie === 'function') {
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

  const res1 = await fetch(`${BASE_URL}/api/auth/csrf`);
  collectCookies(res1);
  const { csrfToken } = await res1.json();

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

  const redirectUrl = res2.headers.get("location");
  if (redirectUrl) {
    const fullUrl = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    const res3 = await fetch(fullUrl, {
      headers: { Cookie: getCookieString() },
      redirect: "manual",
    });
    collectCookies(res3);
  }

  return getCookieString();
}

const conversationHistory = [];

async function chat(message, cookie) {
  conversationHistory.push({ role: "user", content: message });
  
  const res = await fetch(`${BASE_URL}/api/admin/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookie,
    },
    body: JSON.stringify({
      messages: conversationHistory.slice(-15) // API only takes last 15
    }),
  });

  const data = await res.json();
  const reply = data.reply || "No response";
  conversationHistory.push({ role: "assistant", content: reply });
  return reply;
}

async function run() {
  console.log("🐅 INITIALIZING TIGER SIMULATION (20+ TURNS)...");
  const cookie = await simulateLogin();
  
  const prompts = [
    "Hello Tiger, who am I speaking with?",
    "Give me current booking stats please.",
    "Check events for May 2026.",
    "Is there a Jick in the system?",
    "Does Jick have any add-ons for his booking?",
    "Check events for today.",
    "What about tomorrow?",
    "Show me the most recent 5 bookings.",
    "Does the most recent one have any add-ons?",
    "Tiger, search for client with email 'jick@yopmail.com'.",
    "What is the total count of completed bookings?",
    "Can you give me a revenue report?",
    "Tiger, search for 'Wedding' events.",
    "Identify any booking marked as 'pending'.",
    "Does that pending booking have notes or add-ons?",
    "Check events for next week.",
    "What's our average rating?",
    "Tiger, can you list the top upcoming confirmed events?",
    "Do any of those have 'Photo Booth' as an add-on?",
    "Explain your administrative capabilities.",
    "Thanks Tiger, you're doing great. One last check: any events on May 26?",
    "I meant May 6, are there items there?"
  ];

  for (let i = 0; i < prompts.length; i++) {
    console.log(`\n[Turn ${i+1}] 👤: ${prompts[i]}`);
    const reply = await chat(prompts[i], cookie);
    console.log(`🐅: ${reply.substring(0, 300)}${reply.length > 300 ? '...' : ''}`);
  }

  console.log("\n✅ SIMULATION COMPLETE.");
}

run().catch(console.error);
