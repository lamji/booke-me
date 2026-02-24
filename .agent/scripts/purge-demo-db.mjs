import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env from .env.local
dotenv.config({ path: '.env.local' });

async function purgeDatabase() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found in .env.local");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB for demo purge...");
        await mongoose.connect(process.env.MONGODB_URI);

        const Booking = mongoose.models.Booking || mongoose.model('Booking', new mongoose.Schema({
            clientName: String,
            eventDate: Date,
            eventTime: String,
            status: String
        }));

        const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({}));

        // 1. Remove exact duplicates (Same user, same date, same time)
        // Note: For a demo purge, we keep the oldest entry and delete others
        console.log("Searching for duplicate bookings...");
        const duplicates = await Booking.aggregate([
            {
                $group: {
                    _id: { 
                        name: "$clientName", 
                        date: "$eventDate", 
                        time: "$eventTime" 
                    },
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);

        let deletedCount = 0;
        for (const dup of duplicates) {
            // Keep the first ID, delete the rest
            const idsToDelete = dup.ids.slice(1);
            const result = await Booking.deleteMany({ _id: { $in: idsToDelete } });
            deletedCount += result.deletedCount;
            console.log(`  Removed ${result.deletedCount} duplicates for client: ${dup._id.name}`);
        }

        // 2. Remove all Notifications for a clean slate
        console.log("Clearing notification history...");
        const notifResult = await Notification.deleteMany({});
        
        console.log("\n--- PURGE SUMMARY ---");
        console.log(`Duplicate bookings removed: ${deletedCount}`);
        console.log(`Notifications cleared: ${notifResult.deletedCount}`);
        console.log("----------------------\n");

        process.exit(0);
    } catch (error) {
        console.error("Purge failed:", error);
        process.exit(1);
    }
}

purgeDatabase();
