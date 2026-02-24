import { z } from "zod";

/**
 * Booking Validation Schemas
 * 
 * Enforces strict input validation before any processing/DB interaction.
 * satisfy PCI DSS Requirement 6 (Anti-injection/Malformed input).
 */

export const createBookingSchema = z.object({
  // eventType is now dynamic — pulled from the Events collection in MongoDB.
  // Hardcoded enum removed. Any non-empty string from the Events registry is valid.
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, {
    message: "Event date must be today or in the future",
  }),
  eventTime: z.string().min(1, "Time is required"),
  clientName: z.string().min(2, "Name must be at least 2 characters").max(100),
  clientEmail: z.string().email("Invalid email address"),
  clientPhone: z.string().min(7, "Phone number is too short").max(20),
  notes: z.string().max(1000).optional(),
  addOns: z.array(z.string()).optional(),
});

export const checkAvailabilitySchema = z.object({
  eventDate: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, {
    message: "Event date must be today or in the future",
  }),
  eventTime: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "approved", "canceled", "completed"]),
});
