if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ ERROR: This script is disabled in production environments.");
  process.exit(1);
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Rule compliance: Test script does NOT need login simulation because /api/bookings/find is a public endpoint used by regular users to check their own status.

async function testFindBooking() {
  console.log(`Testing ${BASE_URL}/api/bookings/find with intentional failure (missing args)...`);
  
  try {
    const res1 = await fetch(`${BASE_URL}/api/bookings/find`);
    const data1 = await res1.json();
    console.log("No Args Response:", data1.error);
    
    console.log(`\nTesting ${BASE_URL}/api/bookings/find with bad ID...`);
    const res2 = await fetch(`${BASE_URL}/api/bookings/find?id=invalid123`);
    const data2 = await res2.json();
    console.log("Bad ID Response:", data2.error);

    console.log(`\nTesting ${BASE_URL}/api/bookings/find with fake email...`);
    const res3 = await fetch(`${BASE_URL}/api/bookings/find?email=fake@fake.com`);
    const data3 = await res3.json();
    console.log("Fake Email Response:", data3.error);

  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testFindBooking();
