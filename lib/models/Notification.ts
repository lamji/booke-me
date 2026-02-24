import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  type: "new_booking" | "status_change" | "reminder";
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ["new_booking", "status_change", "reminder"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
