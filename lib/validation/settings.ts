import { z } from "zod";

/**
 * Settings Validation Schemas
 * 
 * Enforces strict input validation for global settings.
 */

export const updateSettingsSchema = z.object({
  contactEmail: z.string().email("Invalid contact email address"),
  contactPhone: z.string().min(7, "Phone number is too short").max(20),
  address: z.string().min(5, "Address must be at least 5 characters"),
  policy: z.string().optional(),
  termsAndConditions: z.string().optional(),
  cancellationPolicy: z.string().optional(),
});
