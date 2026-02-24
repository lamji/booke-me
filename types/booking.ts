/**
 * Booking Domain Types
 *
 * Shared interfaces used across Models, ViewModels, and API routes.
 * Location: types/booking.ts (per scalability-protocol.md)
 */

export type BookingStatus = "pending" | "approved" | "canceled" | "completed";

// EventType is now dynamic — event names come from the MongoDB Events registry.
// The old hardcoded enum is replaced with a plain string to support user-defined event types.
export type EventType = string;

export interface IBooking {
  _id: string;
  bookingId: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  addOns: string[];
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  type: "new_booking" | "status_change";
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  bookingId: string;
  clientName: string;
  eventType: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  addOns?: string[];
}

export interface CheckAvailabilityPayload {
  eventDate: string;
  eventTime: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}

/** Event type display labels */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  band_performance: "Band Performance",
  corporate_event: "Corporate Event",
  birthday_party: "Birthday Party",
  other: "Other",
};

/** Add-on options per event type */
export const ADD_ON_OPTIONS: Record<EventType, string[]> = {
  wedding: [
    "Photography",
    "Videography",
    "Floral Arrangements",
    "DJ / Band",
    "Catering",
  ],
  band_performance: [
    "Sound System",
    "Lighting Setup",
    "Extra Musicians",
    "Stage Setup",
  ],
  corporate_event: [
    "Projector & AV",
    "Catering",
    "Event Host",
    "Photography",
  ],
  birthday_party: [
    "Balloon Decor",
    "Clown / Entertainer",
    "Catering",
    "Photography",
  ],
  other: ["Photography", "Catering", "Decoration", "Sound System"],
};
