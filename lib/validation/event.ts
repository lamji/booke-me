import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Price cannot be negative"),
  duration: z.string().optional(),
  process: z.string().optional(),
  addons: z.array(z.object({
    name: z.string().min(1, "Addon name required"),
    price: z.number().min(0, "Price cannot be negative")
  })).default([]),
  isActive: z.boolean().default(true),
});

export const updateEventSchema = eventSchema.partial();
