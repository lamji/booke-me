/**
 * Settings API Test Script
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function testSettings() {
  console.log("--- Testing Settings API ---");

  // 1. Test GET Settings (Public)
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const data = await res.json();
    if (res.ok) {
        console.log("✅ GET /api/settings passed");
        console.log("Data:", JSON.stringify(data, null, 2));
    } else {
        console.log("❌ GET /api/settings failed:", res.status, data);
    }
  } catch (err) {
    console.log("❌ GET /api/settings error:", err.message);
  }

  // 2. Test PUT Settings (Unauthorized)
  try {
    const res = await fetch(`${BASE_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contactEmail: "new@test.com",
            contactPhone: "1234567890",
            address: "New Address",
        }),
    });
    const data = await res.json();
    if (res.status === 401) {
        console.log("✅ PUT /api/settings (Unauthorized) passed -> 401");
    } else {
        console.log("❌ PUT /api/settings (Unauthorized) failed: expected 401, got", res.status, data);
    }
  } catch (err) {
    console.log("❌ PUT /api/settings error:", err.message);
  }
}

testSettings();
