import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const ReviewSchema = new mongoose.Schema({
  bookingId: String,
  clientName: String,
  eventType: String,
  rating: Number,
  comment: String,
  status: String,
  featured: Boolean,
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

async function simulate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const reviews = [
      {
        bookingId: 'SIM-001',
        clientName: 'Maria Santos',
        eventType: 'Wedding',
        rating: 5,
        comment: 'They made our dream wedding a reality. Every detail was perfect — from the floral arrangements to the seamless coordination.',
        status: 'approved',
        featured: true
      },
      {
        bookingId: 'SIM-002',
        clientName: 'James Rodriguez',
        eventType: 'Corporate Gala',
        rating: 5,
        comment: 'Booked their band for our corporate gala and the energy was incredible. Professional, punctual, and they read the room perfectly.',
        status: 'approved',
        featured: true
      },
      {
        bookingId: 'SIM-003',
        clientName: 'Sarah Chen',
        eventType: 'Birthday',
        rating: 5,
        comment: "My daughter's 18th birthday was absolutely magical. The decor, the entertainment, the food — everything exceeded our expectations.",
        status: 'approved',
        featured: true
      }
    ];

    console.log('Cleaning up existing simulation reviews...');
    await Review.deleteMany({ bookingId: { $regex: /^SIM-/ } });

    console.log('Inserting simulated reviews...');
    await Review.insertMany(reviews);

    console.log('Done! 3 reviews created and marked as featured.');
    process.exit(0);
  } catch (error) {
    console.error('Simulation failed:', error);
    process.exit(1);
  }
}

simulate();
