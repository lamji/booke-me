/**
 * listen-socket-updates.mjs
 * 
 * Simple background listener for booking-update socket events.
 */
import { io } from "socket.io-client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const socket = io(BASE_URL, { path: "/api/socketio", addTrailingSlash: false });

socket.on("connect", () => {
  console.log(`[SOCKET] Listener connected: ${socket.id}`);
  socket.emit("join-admin");
});

socket.on("booking-update", (data) => {
  console.log(`📡 [SOCKET] RECEIVED booking-update: ID=${data.bookingId}, Status=${data.status}`);
});

socket.on("new-booking", (data) => {
  console.log(`🚀 [SOCKET] RECEIVED new-booking: ID=${data.bookingId}`);
});

console.log("Listening for socket events... (Ctrl+C to stop)");
