import fetch from "node-fetch";

async function testConflict() {
    const BASE_URL = "http://localhost:3000";
    const date = new Date();
    date.setDate(date.getDate() + 10);
    const dateStr = date.toISOString();

    const payload = {
        eventType: "corporate",
        eventDate: dateStr,
        eventTime: "02:00 PM",
        clientName: "Conflict Test User",
        clientEmail: "conflict@test.com",
        clientPhone: "1234567890",
    };

    console.log("Creating first booking...");
    const res1 = await fetch(`${BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    console.log("First Result:", await res1.json());

    console.log("Creating second booking with same date and time...");
    const res2 = await fetch(`${BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    console.log("Second Result (Should be 409):", res2.status, await res2.json());
}

testConflict();
