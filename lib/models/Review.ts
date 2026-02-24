import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  bookingId: string; // Reference to the booking
  clientName: string;
  eventType: string;
  rating: number; // 1-5
  comment: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean; // Shown on homepage
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: String,
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
