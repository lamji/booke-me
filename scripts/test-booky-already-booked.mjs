import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";
const SESSION_ID = `test_confirm_${Date.now()}`;
const history = [];

async function chat(userMessage, checkDate = null) {
    history.push({ role: "user", content: userMessage });
    console.log(`\n👤 USER: ${userMessage}`);

    const payload = {
        sessionId: SESSION_ID,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        checkDate
    };

    const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    const reply = data.reply || data.error;
    history.push({ role: "assistant", content: reply });
    console.log(`🤖 BOOKY: ${reply}`);
    return reply;
}

async function runTest() {
    console.log("🚀 Testing 'Already Booked' Recognition...");

    await chat("I'm Jick Lampago, lampagojick@yopmail.com. I want to book a Birthday Package for 2026-12-24 at 10 AM. My phone is 09171234567. Yes, everything is correct, finalize it NOW.");

    const today = "2026-12-24";
    console.log(`\n--- Turning on checkDate for ${today} ---`);
    await chat("did my booking for 2026-12-24 go through?", today);

    console.log("\n✅ Test finished.");
    process.exit(0);
}

runTest().catch(err => {
    console.error(err);
    process.exit(1);
});
