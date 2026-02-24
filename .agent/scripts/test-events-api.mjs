// Native fetch used (Node 18+)

if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ ERROR: This script is disabled in production environments.");
  process.exit(1);
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

const log = {
  pass: (msg) => console.log(`  ${COLORS.green}PASS${COLORS.reset}  ${msg}`),
  fail: (msg, detail) => {
    console.log(`  ${COLORS.red}FAIL${COLORS.reset}  ${msg}`);
    if (detail) console.log(`        ${COLORS.dim}${detail}${COLORS.reset}`);
  },
  info: (msg) => console.log(`  ${COLORS.cyan}INFO${COLORS.reset}  ${msg}`),
  header: (msg) =>
    console.log(`\n${COLORS.bold}${COLORS.yellow}--- ${msg} ---${COLORS.reset}`),
};

let sessionCookie = "";

// Helper to simulate admin login
async function simulateAdminLogin() {
  const allCookies = new Map();

  function collectCookies(res) {
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get("set-cookie") || "").split(/,(?=[^ ])/);
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

  log.info("Simulating Admin Login...");

  // Step 1: CSRF
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  collectCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();

  // Step 2: Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: getCookieString(),
    },
    body: new URLSearchParams({
      username: "admin",
      password: "admin123",
      csrfToken,
      json: "true",
    }).toString(),
    redirect: "manual",
  });
  collectCookies(loginRes);

  // Step 3: Redirect
  const redirectUrl = loginRes.headers.get("location");
  if (redirectUrl) {
    const fullUrl = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    const redirectRes = await fetch(fullUrl, {
      headers: { Cookie: getCookieString() },
      redirect: "manual",
    });
    collectCookies(redirectRes);
  }

  sessionCookie = getCookieString();
  if (!sessionCookie.includes("next-auth.session-token")) {
    throw new Error("Failed to capture session token");
  }
  log.pass("Admin session captured.");
}

async function runTests() {
  log.header("Events API CRUD Test");

  try {
    await simulateAdminLogin();
  } catch (err) {
    log.fail("Auth Setup Failed", err.message);
    process.exit(1);
  }

  let testEventId = "";

  // 1. POST - Create Event
  const createRes = await fetch(`${BASE_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      name: `Test Event ${Date.now()}`,
      description: "Automated test event description",
      basePrice: 2500,
      duration: "4 hours",
    }),
  });

  if (createRes.status === 201) {
    const data = await createRes.json();
    testEventId = data._id;
    log.pass(`POST /api/events -> 201 (Created: ${testEventId})`);
  } else {
    log.fail(`POST /api/events -> Expected 201, got ${createRes.status}`, await createRes.text());
  }

  // 2. GET - List Events (Admin)
  const listRes = await fetch(`${BASE_URL}/api/events?admin=true`, {
    headers: { Cookie: sessionCookie },
  });
  if (listRes.status === 200) {
    const events = await listRes.json();
    if (events.some(e => e._id === testEventId)) {
      log.pass("GET /api/events?admin=true -> 200 (Event found in list)");
    } else {
      log.fail("GET /api/events?admin=true -> 200 (But test event missing!)");
    }
  } else {
    log.fail(`GET /api/events?admin=true -> Expected 200, got ${listRes.status}`);
  }

  // 3. PATCH - Update Event
  if (testEventId) {
    const patchRes = await fetch(`${BASE_URL}/api/events/${testEventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ basePrice: 3000 }),
    });
    if (patchRes.status === 200) {
      const updated = await patchRes.json();
      if (updated.basePrice === 3000) {
        log.pass("PATCH /api/events/[id] -> 200 (Price updated)");
      } else {
        log.fail("PATCH /api/events/[id] -> 200 (But price not updated!)");
      }
    } else {
      log.fail(`PATCH /api/events/[id] -> Expected 200, got ${patchRes.status}`);
    }
  }

  // 4. DELETE - Delete Event
  if (testEventId) {
    const deleteRes = await fetch(`${BASE_URL}/api/events/${testEventId}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });
    if (deleteRes.status === 200) {
      log.pass("DELETE /api/events/[id] -> 200 (Deleted successfully)");
    } else {
      log.fail(`DELETE /api/events/[id] -> Expected 200, got ${deleteRes.status}`);
    }
  }

  // 5. GET - Public List (Should be active)
  const publicRes = await fetch(`${BASE_URL}/api/events`);
  if (publicRes.status === 200) {
    log.pass("GET /api/events (Public) -> 200");
  } else {
    log.fail(`GET /api/events (Public) -> Expected 200, got ${publicRes.status}`);
  }

  log.header("Summary");
  console.log(`  Tests completed. Check logs above for results.`);
}

runTests();
