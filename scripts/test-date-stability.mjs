import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";
const SESSION_ID = `date_test_${Date.now()}`;

async function chat(msg) {
    const payload = {
        sessionId: SESSION_ID,
        messages: [{ role: "user", content: msg }]
    };
    const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return await res.json();
}

async function runDateTest() {
    const dates = [
        "next year dec 25",
        "25-12-2026",
        "Christmas 2026",
        "12/25/26"
    ];

    console.log("🚀 Testing Date Input Handling...");

    for (const date of dates) {
        console.log(`\n👤 User: I want to book Wedding Package for ${date} at 10 AM. Finalize it.`);
        const data = await chat(`I am Jick, jick@yopmail.com, phone 123. I want to book Wedding Package for ${date} at 10 AM. Yes, finalize it.`);

        if (data.reply.includes("BKG-")) {
            const bkgId = data.reply.match(/BKG-\d+-\w+/)[0];
            console.log(`✅ Success: ${bkgId}`);
        } else {
            console.log(`⚠️ Failed/Clarified: ${data.reply.slice(0, 100)}...`);
        }
    }
}

runDateTest().catch(console.error);
