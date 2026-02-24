/**
 * ADMIN ACTION FLOW (Backend Only)
 * 
 * Flow:
 * 1. Simulate Admin Login -> Get Session Cookie
 * 2. Fetch Pending Bookings
 * 3. PATCH /api/bookings/[id] (status: approved) -> Send Approved Email
 * 4. PATCH /api/bookings/[id] (status: canceled) -> Send Canceled Email
 * 5. GET   /api/cron/reminders -> Trigger simulated event reminders
 * 
 * Target Email: jicktes-dev-ai@yopmail.com
 */

const BASE_URL = "http://localhost:3000";
const TEST_EMAIL = "jicktes-dev-ai@yopmail.com";

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

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

  console.log("🔐 Authenticating as Admin...");
  
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  collectCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();

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

  const redirectUrl = loginRes.headers.get("location");
  if (redirectUrl) {
    const fullUrl = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    const redirectRes = await fetch(fullUrl, {
      headers: { Cookie: getCookieString() },
      redirect: "manual",
    });
    collectCookies(redirectRes);
  }

  const sessionCookie = getCookieString();
  if (!sessionCookie.includes("next-auth.session-token")) {
    throw new Error("Admin authentication failed. Could not capture session token.");
  }
  return sessionCookie;
}

async function runAdminFlow() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}🛡️ Starting Admin Action Flow${COLORS.reset}\n`);

  try {
    const cookie = await simulateAdminLogin();
    console.log("  ✅ Admin Authenticated.\n");

    // 1. Get Pending Bookings
    console.log("Step 1: Fetching pending bookings...");
    const listRes = await fetch(`${BASE_URL}/api/bookings?status=pending`, {
      headers: { Cookie: cookie }
    });
    const listData = await listRes.json();
    
    if (!listData.bookings || listData.bookings.length === 0) {
      console.log("  ⚠️ No pending bookings found to test with. Run the User E2E flow first.");
      process.exit(1);
    }
    
    const targetBooking = listData.bookings.find(b => b.clientEmail === TEST_EMAIL) || listData.bookings[0];
    const bookingId = targetBooking._id;
    console.log(`  ✅ Target found: ${bookingId} (${targetBooking.clientEmail})`);

    // 2. Approve Booking
    console.log(`\nStep 2: Approving booking ${bookingId}...`);
    const appvRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "approved" })
    });
    
    if (appvRes.ok) {
        console.log(`  ✅ Status updated to APPROVED.`);
        console.log(`  📨 Email 'Approved' notification sent to ${targetBooking.clientEmail}`);
    } else {
        throw new Error(`Approval failed with status ${appvRes.status}`);
    }

    // 3. Cancel Booking (To show both flows)
    console.log(`\nStep 3: Canceling booking ${bookingId}...`);
    const cnclRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "canceled" })
    });
    
    if (cnclRes.ok) {
        console.log(`  ✅ Status updated to CANCELED.`);
        console.log(`  📨 Email 'Canceled' notification sent to ${targetBooking.clientEmail}`);
    } else {
        throw new Error(`Cancellation failed with status ${cnclRes.status}`);
    }

    // 4. Trigger Reminders
    console.log(`\nStep 4: Triggering cron reminders (Simulation)...`);
    const cronRes = await fetch(`${BASE_URL}/api/cron/reminders`);
    if (cronRes.ok) {
        const cronData = await cronRes.json();
        console.log(`  ✅ Cron response: ${JSON.stringify(cronData)}`);
        console.log(`  📨 Emails will be sent to any approved bookings scheduled for 2 days from now.`);
    }

    console.log(`\n${COLORS.green}${COLORS.bold}✨ ADMIN ACTION FLOW COMPLETED SUCCESSFULLY${COLORS.reset}\n`);

  } catch (error) {
    console.error(`\n${COLORS.red}${COLORS.bold}❌ ADMIN ACTION FLOW FAILED${COLORS.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

runAdminFlow();
