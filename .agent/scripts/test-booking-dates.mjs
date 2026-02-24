if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ ERROR: This script is disabled in production environments.");
  process.exit(1);
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function testBookingDates() {
  console.log(`Fetching booked dates from ${BASE_URL}/api/bookings/dates...`);
  try {
    const res = await fetch(`${BASE_URL}/api/bookings/dates`);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.bookedDates) {
      console.log("\nParsed local dates (as they would appear in the browser):");
      data.bookedDates.forEach(d => {
        const dateObj = new Date(d);
        console.log(`- UTC String: ${d} -> Local String: ${dateObj.toString()} -> toDateString(): ${dateObj.toDateString()}`);
      });
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testBookingDates();
