import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import cron from "node-cron";
import http from "node:http";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.IO directly on the HTTP server to bypass Next.js API Route limitations in Dev
  const io = new Server(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[Socket.IO] Client connected:", socket.id);

    socket.on("join-admin", () => {
      socket.join("admin-room");
      console.log("[Socket.IO] Admin joined:", socket.id);
    });

    socket.on("join-user", (userId) => {
      socket.join(`user-${userId}`);
      console.log("[Socket.IO] User joined:", socket.id, userId);
    });

    // Broadcast new bookings to all admins
    socket.on("new-booking", (bookingData) => {
      console.log("[Socket.IO] New booking received, broadcasting to admins");
      socket.to("admin-room").emit("new-booking", bookingData);
    });

    // Broadcast booking updates
    socket.on("booking-update", (updateData) => {
      console.log("[Socket.IO] Booking update received, broadcasting");
      socket.to("admin-room").emit("booking-update", updateData);
      io.emit("booking-update", updateData); // Broadcast to all for simplicity
    });

    // Broadcast notifications to admins
    socket.on("new-notification", (notificationData) => {
      console.log("[Socket.IO] New notification received, broadcasting to admins");
      socket.to("admin-room").emit("new-notification", notificationData);
    });

    // Broadcast event registry changes to ALL clients (public booking page)
    socket.on("events-updated", () => {
      console.log("[Socket.IO] Event registry updated, broadcasting to all clients");
      socket.broadcast.emit("events-updated");
    });

    socket.on("chat-updated", (chatData) => {
      console.log("[Socket.IO] Chat updated, broadcasting to admins");
      socket.to("admin-room").emit("chat-updated", chatData);
    });

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Client disconnected:", socket.id);
    });
  });

  // DAILY AUTOMATION: 9 AM Reminder Service
  // Schedule: 0 9 * * * (0 minutes, 9 hours, every day, every month, every day of week)
  cron.schedule("0 9 * * *", () => {
    console.log("[CRON] 9:00 AM reached. Triggering Event Reminders...");
    
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/cron/reminders",
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET || "internal-cron"}`
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        console.log(`[CRON] Reminders result: ${data}`);
      });
    });

    req.on("error", (error) => {
      console.error("[CRON] Failed to trigger reminders:", error.message);
    });

    req.end();
  });

  httpServer.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Custom Server + Socket.IO Ready on http://${hostname}:${port}`);
  });
});
