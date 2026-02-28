import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";
const DATE = "2026-11-11";

async function book(name, email, sessionId) {
    const payload = {
        sessionId,
        messages: [
            { role: "user", content: `I am ${name}, email ${email}, phone 123. I want to book the Wedding Package for ${DATE} at 10 AM. Yes, finalize it.` }
        ]
    };

    const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { reply: data.reply, status: res.status };
}

async function runRaceTest() {
    console.log("🚀 Testing Race Condition: Two users booking the same date simultaneously...");

    // Send both requests at the same time
    const [res1, res2] = await Promise.all([
        book("User A", "userA@example.com", "session_A"),
        book("User B", "userB@example.com", "session_B")
    ]);

    console.log(`\n👤 User A Status: ${res1.status}`);
    console.log(`🤖 User A Reply: ${res1.reply.includes("Success") ? "SUCCESS ✅" : "FAILED ❌"}`);
    console.log(res1.reply.slice(0, 100) + "...");

    console.log(`\n👤 User B Status: ${res2.status}`);
    console.log(`🤖 User B Reply: ${res2.reply.includes("Success") ? "SUCCESS ✅" : "FAILED ❌"}`);
    console.log(res2.reply.slice(0, 100) + "...");

    if (res1.reply.includes("Success") && res2.reply.includes("Success")) {
        console.error("\n❌ CRITICAL FAILURE: Both users booked the same date!");
        process.exit(1);
    } else {
        console.log("\n✅ Race condition handled correctly. Only one booking succeeded.");
        process.exit(0);
    }
}

runRaceTest().catch(console.error);
