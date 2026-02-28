import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BookingSchema = new mongoose.Schema({}, { strict: false });
const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10).lean();
    console.log(JSON.stringify(bookings, null, 2));
    process.exit(0);
}

check();
