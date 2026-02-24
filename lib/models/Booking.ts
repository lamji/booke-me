import mongoose, { Schema, Document } from "mongoose";
import type { BookingStatus, EventType } from "@/types/booking";

/**
 * Booking Mongoose Model
 *
 * Schema with indexed fields for query performance.
 * (per scalability-protocol.md: DB Indexing is mandatory)
 */

export interface IBookingDocument extends Document {
  bookingId: string;
  eventType: EventType;
  eventDate: Date;
  eventTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  addOns: string[];
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true,
    },
    eventTime: {
      type: String,
      required: [true, "Event time is required"],
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, "Client email is required"],
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      required: [true, "Client phone is required"],
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    addOns: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "canceled", "completed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for availability checks
BookingSchema.index({ eventDate: 1, eventTime: 1, status: 1 });

const Booking =
  mongoose.models.Booking ||
  mongoose.model<IBookingDocument>("Booking", BookingSchema);

export default Booking;
