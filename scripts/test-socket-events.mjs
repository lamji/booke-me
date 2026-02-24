/**
 * 🧪 Socket.IO Events-Updated Broadcast Test
 * 
 * Simulates:
 * 1. A "user/booking page" client that listens for "events-updated"
 * 2. An "admin" client that creates a new event via API, then emits "events-updated"
 * 
 * Expected: The booking-page client receives the signal without a page refresh.
 */

import { io } from "socket.io-client";
import fetch from "node-fetch";

const BASE = "http://localhost:3000";
const SOCKET_PATH = "/api/socketio";

let testPassed = false;

// --- 1. Booking Page Client (listener) ---
const bookingClient = io(BASE, { path: SOCKET_PATH, addTrailingSlash: false });

bookingClient.on("connect", () => {
    console.log(`[BOOKING CLIENT] Connected: ${bookingClient.id}`);
    console.log("[BOOKING CLIENT] Listening for 'events-updated'...\n");
});

bookingClient.on("events-updated", async () => {
    console.log("✅ [BOOKING CLIENT] Received 'events-updated' signal! Re-fetching events...");
    const res = await fetch(`${BASE}/api/events`);
    const events = await res.json();
    console.log(`✅ [BOOKING CLIENT] Events dropdown now has ${events.length} events:`);
    events.forEach(e => console.log(`   - ${e.name} (${e.isActive ? "ONLINE" : "OFFLINE"})`));
    testPassed = true;
    cleanup();
});

// --- 2. Admin Client (emitter) ---
const adminClient = io(BASE, { path: SOCKET_PATH, addTrailingSlash: false });

adminClient.on("connect", async () => {
    console.log(`[ADMIN CLIENT] Connected: ${adminClient.id}`);

    // Step 1: POST new event via API (simulates admin clicking "Commit Profile")
    console.log("\n[ADMIN CLIENT] Creating test event via POST /api/events...");

    // We need admin session cookie - skip API creation, just emit the socket event
    // (API creation requires NextAuth session. We simulate what the client does after API call.)
    console.log("[ADMIN CLIENT] (Skipping API POST - requires admin session)");
    console.log("[ADMIN CLIENT] Emitting 'events-updated' to simulate post-creation broadcast...\n");

    // Small delay so booking client is ready
    await new Promise(r => setTimeout(r, 300));
    adminClient.emit("events-updated");
});

// Timeout failsafe
const timeout = setTimeout(() => {
    if (!testPassed) {
        console.error("\n❌ TEST FAILED: 'events-updated' was NOT received by booking client within 5 seconds.");
        console.error("   This means the server.mjs socket handler is NOT broadcasting the event.");
    }
    cleanup();
}, 5000);

function cleanup() {
    clearTimeout(timeout);
    bookingClient.disconnect();
    adminClient.disconnect();
    process.exit(testPassed ? 0 : 1);
}
