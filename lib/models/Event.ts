import mongoose, { Schema, Document } from "mongoose";

export interface IAddon {
  name: string;
  price: number;
}

export interface IEvent extends Document {
  name: string;
  description?: string;
  basePrice: number;
  duration?: string;
  process?: string;
  addons: IAddon[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddonSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const EventSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    basePrice: { type: Number, required: true, default: 0 },
    duration: { type: String },
    process: { type: String },
    addons: { type: [AddonSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);
