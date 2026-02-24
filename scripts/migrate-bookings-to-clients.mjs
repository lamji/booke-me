/**
 * migrate-bookings-to-clients.mjs
 * 
 * One-time migration to ensure all current bookings are indexed in the Client model.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BookingSchema = new mongoose.Schema({
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  bookingId: String,
}, { strict: false });

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  type: String,
  lastBookingId: String,
}, { timestamps: true });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
  const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

  const bookings = await Booking.find().lean();
  console.log(`Found ${bookings.length} bookings.`);

  for (const b of bookings) {
    await Client.findOneAndUpdate(
      { email: b.clientEmail.toLowerCase() },
      {
        $set: {
          name: b.clientName,
          phone: b.clientPhone,
          type: "existing",
          lastBookingId: b.bookingId
        }
      },
      { upsert: true }
    );
    console.log(`Processed: ${b.clientEmail}`);
  }

  console.log("Migration complete.");
  process.exit(0);
}

run().catch(console.error);
