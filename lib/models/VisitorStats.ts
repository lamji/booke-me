import mongoose, { Schema, Document } from "mongoose";

/**
 * VisitorStats Mongoose Model
 * Tracks daily visits and unique sessions for the dashboard analytics.
 */

export interface IVisitorStatsDocument extends Document {
  date: Date; // Truncated to YYYY-MM-DD
  count: number;
  uniqueSessions: string[]; // Array of session IDs for the day
}

const VisitorStatsSchema = new Schema<IVisitorStatsDocument>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    uniqueSessions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const VisitorStats =
  mongoose.models.VisitorStats ||
  mongoose.model<IVisitorStatsDocument>("VisitorStats", VisitorStatsSchema);

export default VisitorStats;
