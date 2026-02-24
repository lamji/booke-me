import mongoose from "mongoose";

/**
 * MongoDB Connection Utility
 *
 * Singleton pattern to prevent duplicate connections in serverless
 * environments (Next.js API routes hot-reload).
 *
 * NOTE: We use a standard mongodb:// connection string (not +srv)
 * because Windows local DNS cannot resolve SRV records for Atlas.
 * Run `npm run diagnose:mongo` to auto-resolve SRV → standard URI.
 *
 * Usage: `await connectDB()` at the top of every API route.
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bookme";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[DB] Connecting to MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
