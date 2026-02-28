import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";
const SESSION_ID = `test_booking_${Date.now()}`;

async function testDirectBooking() {
    console.log("🚀 Testing Direct Booking Command...");

    const payload = {
        sessionId: SESSION_ID,
        messages: [
            { role: "user", content: "Hi Booky, I'm Jick Lampago, email jick@yopmail.com, phone 09171234567. I want to book a Wedding Package for 2026-12-25 at 10:00 AM. Everything is correct, please finalize it." }
        ]
    };

    try {
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        console.log(`Status: ${res.status}`);
        const data = await res.json();

        if (data.error) {
            console.error(`❌ Error: ${data.error}`);
        } else {
            console.log(`🤖 Reply: ${data.reply}`);
            if (data.reply.includes("BKG-")) {
                console.log("✅ Booking Successful!");
            } else {
                console.log("⚠️ Booking ID not found in reply. Check if command was triggered.");
            }
        }
    } catch (err) {
        console.error(`❌ Fetch failed: ${err.message}`);
    }
}

testDirectBooking();
