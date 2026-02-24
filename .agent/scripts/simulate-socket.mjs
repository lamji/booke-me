if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ ERROR: This script is disabled in production environments.");
  process.exit(1);
}

import { io } from "socket.io-client";

// Simulation Script to test Socket.IO integration
console.log("-----------------------------------------");
console.log("🔧 Starting Socket.IO Simulation Script 🔧");
console.log("-----------------------------------------");

const SERVER_URL = "http://localhost:3000";

console.log(`Connecting Admin Socket...`);
const adminSocket = io(SERVER_URL, {
  path: "/api/socketio",
  transports: ["websocket"],
});

adminSocket.on("connect", () => {
  console.log(`✅ Admin Connected! ID: ${adminSocket.id}`);
  
  console.log("📡 Admin emitting 'join-admin'...");
  adminSocket.emit("join-admin");

  // Admin listens for new bookings
  adminSocket.on("new-booking", (data) => {
    console.log("\n📥 [ADMIN SUCCESS] Received 'new-booking' broadcast!");
    console.log("   Data:", JSON.stringify(data, null, 2));

    console.log("\n📡 Admin emitting 'booking-update'...");
    adminSocket.emit("booking-update", { id: data.id, status: "approved" });
  });
  
  adminSocket.on("booking-update", () => {
    // Admin receives its own broadcast? Wait, in server we used io.emit("booking-update") so EVERYONE gets it.
    console.log("\n📥 [ADMIN SUCCESS] Received 'booking-update' broadcast!");
    console.log("\n🏁 Simulation completed successfully.");
    adminSocket.disconnect();
    if (userSocket.connected) userSocket.disconnect();
    process.exit(0);
  });
});

let userSocket;

setTimeout(() => {
  console.log(`\nConnecting User Socket...`);
  userSocket = io(SERVER_URL, {
    path: "/api/socketio",
    transports: ["websocket"],
  });

  userSocket.on("connect", () => {
    console.log(`✅ User Connected! ID: ${userSocket.id}`);
    
    console.log("📡 User emitting 'new-booking'...");
    userSocket.emit("new-booking", {
      id: "sim_" + Date.now(),
      clientName: "Simulation User",
    });
  });
}, 500);

setTimeout(() => {
  console.error("❌ Timeout: Did not receive expected broadcasts within 8 seconds.");
  adminSocket.disconnect();
  if (userSocket) userSocket.disconnect();
  process.exit(1);
}, 8000);
