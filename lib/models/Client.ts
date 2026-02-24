import mongoose, { Schema, Document } from "mongoose";

/**
 * Client Model
 * 
 * Unified model for both "Existing Clients" (those who have booked)
 * and "Potential Clients" (captured leads from chat).
 */

export interface IClientDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  type: "existing" | "potential";
  lastBookingId?: string;
  lastInterest?: string; // e.g. "Interested in Wedding Package"
  lastFollowedUpAt?: Date;
  chatSessions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClientDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["existing", "potential"],
      default: "potential",
      index: true,
    },
    lastBookingId: {
      type: String,
    },
    lastInterest: {
      type: String,
    },
    lastFollowedUpAt: {
      type: Date,
    },
    chatSessions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Client =
  mongoose.models.Client ||
  mongoose.model<IClientDocument>("Client", ClientSchema);

export default Client;
