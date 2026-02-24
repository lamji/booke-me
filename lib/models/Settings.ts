import mongoose, { Schema, Document } from "mongoose";

/**
 * Settings Mongoose Model
 * 
 * Stores global configuration for the application.
 */

export interface ISettingsDocument extends Document {
  contactEmail: string;
  contactPhone: string;
  address: string;
  policy: string;
  termsAndConditions: string;
  cancellationPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    policy: {
      type: String,
      default: "",
    },
    termsAndConditions: {
      type: String,
      default: "",
    },
    cancellationPolicy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettingsDocument>("Settings", SettingsSchema);

export default Settings;
