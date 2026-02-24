if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ ERROR: This script is disabled in production environments.");
  process.exit(1);
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Rule compliance: Test script does NOT need login simulation because /api/cron/reminders is protected by CRON_SECRET, not a user token.

async function testCronReminders() {
  console.log(`Testing ${BASE_URL}/api/cron/reminders to trigger email dispatch...`);
  
  try {
    // We do not pass CRON_SECRET here because NODE_ENV !== "production", so the endpoint will bypass the auth check in dev.
    const res = await fetch(`${BASE_URL}/api/cron/reminders`);
    const data = await res.json();
    console.log("Cron Response:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testCronReminders();
