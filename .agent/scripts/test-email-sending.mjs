import { sendMail, EmailTemplates } from "../lib/mail.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const TEST_EMAIL = "jicktes-dev-ai@yopmail.com";

async function runEmailTests() {
  console.log("-----------------------------------------");
  console.log("📧 Starting Email Sending Test Suite 📧");
  console.log(`Target: ${TEST_EMAIL}`);
  console.log("-----------------------------------------");

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.error("❌ ERROR: GMAIL_USER or GMAIL_APP_PASS not found in .env.local");
    console.log("Simulation mode would trigger, but we need real credentials for this test.");
    process.exit(1);
  }

  const results = [];

  // 1. Booking Received
  console.log("\n1️⃣ Sending 'Booking Received'...");
  const receivedOk = await sendMail({
    to: TEST_EMAIL,
    subject: "BOOK.ME - Testing: Booking Received",
    html: EmailTemplates.bookingReceived("Dev Tester", "February 25, 2026", "10:00 AM", "TEST-RECV-123")
  });
  results.push({ name: "Booking Received", ok: receivedOk });

  // 2. Booking Approved
  console.log("2️⃣ Sending 'Booking Approved'...");
  const approvedOk = await sendMail({
    to: TEST_EMAIL,
    subject: "BOOK.ME - Testing: Booking Approved",
    html: EmailTemplates.bookingStatusChange("Dev Tester", "approved", "TEST-APPV-456")
  });
  results.push({ name: "Booking Approved", ok: approvedOk });

  // 3. Booking Canceled
  console.log("3️⃣ Sending 'Booking Canceled'...");
  const canceledOk = await sendMail({
    to: TEST_EMAIL,
    subject: "BOOK.ME - Testing: Booking Canceled",
    html: EmailTemplates.bookingStatusChange("Dev Tester", "canceled", "TEST-CNCL-789")
  });
  results.push({ name: "Booking Canceled", ok: canceledOk });

  // 4. Event Reminder (Upcoming)
  console.log("4️⃣ Sending 'Event Reminder'...");
  const reminderOk = await sendMail({
    to: TEST_EMAIL,
    subject: "BOOK.ME - Testing: Event Reminder",
    html: EmailTemplates.eventReminder("Dev Tester", "February 27, 2026", "02:00 PM", "Wedding Gala")
  });
  results.push({ name: "Event Reminder", ok: reminderOk });

  console.log("\n-----------------------------------------");
  console.log("📊 Email Test Summary 📊");
  results.forEach(r => {
    console.log(`${r.ok ? "✅" : "❌"} ${r.name}: ${r.ok ? "Sent" : "Failed"}`);
  });
  console.log("-----------------------------------------");

  if (results.every(r => r.ok)) {
    console.log("\n✨ ALL TESTS PASSED! Check your yopmail inbox.");
  } else {
    console.log("\n⚠️ Some tests failed. Check console errors.");
  }
}

runEmailTests().catch(console.error);
