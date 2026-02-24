import connectDB from "../lib/db/index.js";
import Booking from "../lib/models/Booking.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function debugBooking() {
  console.log("Checking DB connection...");
  await connectDB();
  console.log("DB Connected.");

  try {
    const testDoc = {
      eventType: "corporate",
      eventDate: new Date(),
      eventTime: "10:00 AM",
      clientName: "Test",
      clientEmail: "test@example.com",
      clientPhone: "123",
      status: "pending"
    };

    console.log("Attempting to create a booking document...");
    const booking = await Booking.create(testDoc);
    console.log("Success! Created ID:", booking._id);
    
    // Clean up
    await Booking.findByIdAndDelete(booking._id);
    console.log("Cleaned up.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to create document:", err);
    process.exit(1);
  }
}

debugBooking();
