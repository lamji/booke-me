/**
 * USER END-TO-END FLOW (Backend Only)
 * 
 * Flow: 
 * 1. POST /api/bookings/availability -> Check if slot is free
 * 2. POST /api/bookings -> Submit a real booking
 * 3. GET  /api/bookings/find -> Verify booking retrievable by email
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

async function runUserFlow() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}🚀 Starting User E2E Backend Flow${COLORS.reset}`);
  console.log(`${COLORS.yellow}Target Email: ${TEST_EMAIL}${COLORS.reset}\n`);

  try {
    // 1. Check Availability
    console.log("Step 1: Checking availability for a future date...");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14); // 2 weeks from now
    
    const availRes = await fetch(`${BASE_URL}/api/bookings/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventDate: futureDate.toISOString(),
        eventTime: "06:00 PM"
      })
    });
    
    if (availRes.ok) {
        console.log(`  ✅ Slot is available.`);
    } else {
        console.warn(`  ⚠️ Slot check returned status ${availRes.status}. Proceeding anyway.`);
    }

    // 2. Submit Booking
    console.log("\nStep 2: Submitting booking request...");
    const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "corporate",
        eventDate: futureDate.toISOString(),
        eventTime: "06:00 PM",
        clientName: "E2E User Tester",
        clientEmail: TEST_EMAIL,
        clientPhone: "09170000000",
        notes: "Automated User E2E Flow Test",
        addOns: ["Catering", "Sound System"]
      })
    });

    const bookingData = await bookingRes.json();
    if (bookingRes.status !== 201) {
      throw new Error(`Booking failed: ${JSON.stringify(bookingData)}`);
    }
    const bookingId = bookingData.booking._id;
    console.log(`  ✅ Booking created! ID: ${bookingId}`);
    console.log(`  📨 Email 'Received' notification should be sent to ${TEST_EMAIL}`);

    // 3. Find Booking (Verification)
    console.log("\nStep 3: Verifying booking via public find endpoint...");
    const findRes = await fetch(`${BASE_URL}/api/bookings/find?email=${TEST_EMAIL}`);
    const findData = await findRes.json();

    if (findRes.ok && findData.booking) {
      console.log(`  ✅ Verification Success: Found booking for this email.`);
      if (findData.booking._id === bookingId) {
        console.log(`  ✅ Specific Booking ID ${bookingId} verified in database.`);
      }
    } else {
      throw new Error(`Verification failed: ${JSON.stringify(findData)}`);
    }

    console.log(`\n${COLORS.green}${COLORS.bold}✨ USER E2E FLOW COMPLETED SUCCESSFULLY${COLORS.reset}\n`);

  } catch (error) {
    console.error(`\n${COLORS.red}${COLORS.bold}❌ USER E2E FLOW FAILED${COLORS.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

runUserFlow();
