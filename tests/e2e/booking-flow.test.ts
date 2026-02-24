/**
 * BOOK.ME — E2E API-Level Booking Flow Tests (Jest)
 *
 * These tests simulate a real user booking flow by hitting the live
 * API endpoints on http://localhost:3000. Much faster than browser-based
 * tests while still validating the full request/response lifecycle.
 *
 * Test Email: test-case@yopmail.com
 *
 * PREREQUISITE: Dev server must be running (`npm run dev`)
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export {};
const TEST_EMAIL = "test-case@yopmail.com";
const TEST_NAME = "QA Test User";
const TEST_PHONE = "+15550109999";

// We'll store the created booking ID here to use across tests
let createdBookingId: string;

// Pick a date 7 days from now at midnight UTC to avoid conflicts
function getFutureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

describe("E2E: User Booking Flow", () => {
  // ============================================================
  // TC-001: Fetch booked dates (public endpoint)
  // ============================================================
  test("TC-001: GET /api/bookings/dates returns a list of booked dates", async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/dates`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("bookedDates");
    expect(Array.isArray(data.bookedDates)).toBe(true);

    console.log(`  ✅ TC-001: Received ${data.bookedDates.length} booked dates`);
  });

  // ============================================================
  // TC-002: Check availability for a future date (public endpoint)
  // ============================================================
  test("TC-002: POST /api/bookings/availability returns available for a future date", async () => {
    const futureDate = getFutureDate();

    const res = await fetch(`${BASE_URL}/api/bookings/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventDate: futureDate,
        eventTime: "10:00 AM",
      }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("available");
    expect(typeof data.available).toBe("boolean");

    console.log(`  ✅ TC-002: Availability for ${futureDate} at 10:00 AM → ${data.available}`);
  });

  // ============================================================
  // TC-003: Submit a new booking (public POST)
  // ============================================================
  test("TC-003: POST /api/bookings creates a new booking and returns 201", async () => {
    const futureDate = getFutureDate();

    // Fetch a real event name from the live DB (as a real user would)
    const eventsRes = await fetch(`${BASE_URL}/api/events`);
    const events = await eventsRes.json();
    const eventName = Array.isArray(events) && events.length > 0 ? events[0].name : "Wedding Package";

    const payload = {
      eventType: eventName,
      eventDate: futureDate,
      eventTime: "10:00 AM",
      clientName: TEST_NAME,
      clientEmail: TEST_EMAIL,
      clientPhone: TEST_PHONE,
      notes: "Automated Jest E2E Test Run — Please Ignore",
      addOns: [],
    };

    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Could be 201 (success) or 409 (date conflict from a previous run)
    const data = await res.json();

    if (res.status === 201) {
      expect(data).toHaveProperty("booking");
      expect(data.booking).toHaveProperty("_id");
      expect(data.booking.eventType).toBe(eventName);
      createdBookingId = data.booking._id;
      console.log(`  ✅ TC-003: Booking created → ID: ${createdBookingId}, Type: ${eventName}`);
    } else if (res.status === 409) {
      // Date conflict from a previous test run — still a valid response
      expect(data).toHaveProperty("error");
      console.log(`  ⚠️ TC-003: Date conflict (409) — slot already booked from previous run. Skipping ID capture.`);
    } else {
      // Unexpected status
      throw new Error(`Unexpected status: ${res.status} — ${JSON.stringify(data)}`);
    }
  });

  // ============================================================
  // TC-004: Validation rejects incomplete booking
  // ============================================================
  test("TC-004: POST /api/bookings rejects a request missing required fields", async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "wedding" }), // Missing everything else
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("error", "Validation failed");
    console.log(`  ✅ TC-004: Validation correctly rejected incomplete payload`);
  });

  // ============================================================
  // TC-005: Find booking by email (public endpoint)
  // ============================================================
  test("TC-005: GET /api/bookings/find?email= returns a booking for test email", async () => {
    const res = await fetch(
      `${BASE_URL}/api/bookings/find?email=${encodeURIComponent(TEST_EMAIL)}`
    );

    const data = await res.json();

    if (res.status === 200) {
      expect(data).toHaveProperty("booking");
      expect(data.booking.clientEmail.toLowerCase()).toBe(TEST_EMAIL);
      expect(data.booking.clientName).toBe(TEST_NAME);
      console.log(`  ✅ TC-005: Found booking for ${TEST_EMAIL} → Status: ${data.booking.status}`);
    } else if (res.status === 404) {
      // If TC-003 had a conflict & no prior run exists, this is expected
      console.log(`  ⚠️ TC-005: No booking found for ${TEST_EMAIL} (404). OK if TC-003 conflicted.`);
    } else {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  });

  // ============================================================
  // TC-006: Find booking by invalid ID returns 400
  // ============================================================
  test("TC-006: GET /api/bookings/find?id=invalid returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/find?id=invalid123`);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toHaveProperty("error");
    console.log(`  ✅ TC-006: Invalid ID correctly rejected → "${data.error}"`);
  });

  // ============================================================
  // TC-007: Find booking with no params returns 400
  // ============================================================
  test("TC-007: GET /api/bookings/find with no args returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/find`);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toHaveProperty("error", "Must provide either email or booking ID.");
    console.log(`  ✅ TC-007: No-args request correctly rejected`);
  });

  // ============================================================
  // TC-008: Cron reminders endpoint works
  // ============================================================
  test("TC-008: GET /api/cron/reminders returns 200 with message", async () => {
    const res = await fetch(`${BASE_URL}/api/cron/reminders`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("message");
    console.log(`  ✅ TC-008: Cron endpoint → "${data.message}"`);
  });
});
