import mongoose, { Schema, Document } from "mongoose";

/**
 * Conversation Mongoose Model
 * Stores chatbot interactions per session.
 */

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface IConversationDocument extends Document {
  sessionId: string;
  clientInfo?: {
    name?: string;
    email?: string;
  };
  messages: IMessage[];
  lastMessageAt: Date;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientInfo: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant", "system"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for dashboard sorting
ConversationSchema.index({ lastMessageAt: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversationDocument>("Conversation", ConversationSchema);

export default Conversation;
