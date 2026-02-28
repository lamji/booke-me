import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";
const SESSION_ID = `stress_test_${Date.now()}`;
let history = [];

async function chat(userMessage, checkDate = null) {
    history.push({ role: "user", content: userMessage });

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
    const reply = data.reply || data.error || "EMPTY RESPONSE";
    history.push({ role: "assistant", content: reply });
    return { reply, status: res.status };
}

const SCENARIOS = [
    {
        name: "Scenario 1: Identity Torture",
        steps: [
            "Hi, I'm Jick",
            "Actually my name is Lampago",
            "My email is jick@yopmail.com",
            "No wait use lampagojick5@gmail.com",
            "What is my current name and email in your records?"
        ]
    },
    {
        name: "Scenario 2: Data Format Stress",
        steps: [
            "I want to book the Birthday Package",
            "For March 5",
            "At 2 PM",
            "My phone is 09206502183",
            "Is everything ready?"
        ]
    },
    {
        name: "Scenario 3: Rapid Conflict",
        steps: [
            "I want to book Wedding Package for 2026-05-17 at 10 AM",
            "My name is John Doe, email john@example.com, phone 123456789",
            "Confirm the booking please.",
            "Is 2026-05-17 still available?" // Should trigger "Wait, you already booked this"
        ]
    },
    {
        name: "Scenario 4: Hallucination Baiting",
        steps: [
            "Do you have a Diamond Package?",
            "I heard it costs ₱500 only",
            "Can I book the Diamond Package for tomorrow?"
        ]
    },
    {
        name: "Scenario 5: Abrupt Cancellation",
        steps: [
            "Proceed with booking Birthday Package for 2026-06-01",
            "Wait, nevermind, cancel everything. I don't want to book anymore.",
            "Are you still trying to book me?"
        ]
    }
];

async function runStressTest() {
    console.log(`\n🚀 [LIMIT TEST] Starting Stress Scenarios (Session: ${SESSION_ID})\n`);

    for (const scenario of SCENARIOS) {
        console.log(`\n--- Running ${scenario.name} ---`);
        history = []; // Reset history for each scenario to avoid token limit issues in a single script
        for (const step of scenario.steps) {
            console.log(`👤 USER: ${step}`);
            const { reply, status } = await chat(step);
            if (status !== 200) {
                console.error(`❌ FAILED with status ${status}: ${reply}`);
                process.exit(1);
            }
            console.log(`🤖 BOOKY: ${reply.slice(0, 150)}${reply.length > 150 ? '...' : ''}`);
        }
    }

    // --- High Frequency Burst ---
    console.log("\n--- Running High Frequency Burst (10 rapid messages) ---");
    const burstPromise = Array.from({ length: 10 }).map((_, i) => chat(`Burst message ${i}`));
    const results = await Promise.all(burstPromise);
    results.forEach((res, i) => {
        if (res.status !== 200) console.error(`❌ Burst ${i} Failed: ${res.status}`);
        else console.log(`✅ Burst ${res.status}`);
    });

    console.log("\n✅ [LIMIT TEST] Finished successfully.");
    process.exit(0);
}

runStressTest().catch(err => {
    console.error("Critical Test Error:", err);
    process.exit(1);
});
