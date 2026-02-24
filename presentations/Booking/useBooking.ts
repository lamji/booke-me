"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSocket } from "@/lib/hooks/useSocket";
import api from "@/lib/axios";
import type { CreateBookingPayload } from "@/types/booking";
import type { IEvent } from "@/lib/models/Event";


/**
 * useBooking — ViewModel for the Booking form
 *
 * Handles form state, validation, and submission.
 * Extracts date/time from URL on mount.
 */

export function useBooking() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { socket, emit } = useSocket();

  // Reference data
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Form fields
  const [eventType, setEventType] = useState<string>("");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [addOns, setAddOns] = useState<string[]>([]);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPreSelected, setIsPreSelected] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Fetch active events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get("/api/events");
      const data = Array.isArray(res.data) ? res.data : [];
      setEvents(data);
      setEventType(prev => prev || (data.length > 0 ? data[0].name : ""));
    } catch (error) {
      console.error("Failed to fetch event types:", error);
      setEvents([]);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!socket) return;
    socket.on("events-updated", fetchEvents);
    return () => {
      socket.off("events-updated", fetchEvents);
    };
  }, [socket, fetchEvents]);

  // Parse URL Params on mount
  useEffect(() => {
    if (!searchParams) return;
    const d = searchParams.get("date");
    const t = searchParams.get("time");

    if (d && t) {
      const parsedDate = new Date(d);
      if (!isNaN(parsedDate.getTime())) {
        setEventDate(parsedDate);
        setEventTime(t);
        setIsPreSelected(true);
      }
    }
  }, [searchParams]);

  const toggleAddOn = useCallback((addOn: string) => {
    setAddOns((prev) =>
      prev.includes(addOn)
        ? prev.filter((a) => a !== addOn)
        : [...prev, addOn]
    );
  }, []);

  const submitBooking = useCallback(async () => {
    // Reset previous missing fields
    setMissingFields([]);
    
    const missing: string[] = [];
    if (!eventType) missing.push("eventType");
    if (!eventDate) missing.push("eventDate");
    if (!eventTime) missing.push("eventTime");
    if (!clientName) missing.push("clientName");
    if (!clientEmail) missing.push("clientEmail");
    if (!clientPhone) missing.push("clientPhone");

    if (missing.length > 0) {
      setMissingFields(missing);
      setSubmitResult({
        success: false,
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const payload: CreateBookingPayload = {
        eventType: eventType as string,
        eventDate: eventDate ? (eventDate as Date).toISOString() : "",
        eventTime,
        clientName,
        clientEmail,
        clientPhone,
        notes,
        addOns,
      };

      const res = await api.post("/api/bookings", payload);

      // Trigger realtime update for admins
      emit("new-booking", res.data.booking);

      setSubmitResult({
        success: true,
        message: "Booking submitted! We'll get back to you shortly.",
      });

      // Redirect home after 3 seconds on success
      setTimeout(() => router.push("/"), 3000);

    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setSubmitResult({
        success: false,
        message: err?.response?.data?.error || "Submission failed. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [eventType, eventDate, eventTime, clientName, clientEmail, clientPhone, notes, addOns, emit, router]);

  // Derived: Get current event object
  const currentEvent = events.find(e => e.name === eventType);

  return {
    events,
    isDataLoading,
    currentEvent,
    eventType, setEventType,
    eventDate, setEventDate,
    eventTime, setEventTime,
    clientName, setClientName,
    clientEmail, setClientEmail,
    clientPhone, setClientPhone,
    notes, setNotes,
    addOns, toggleAddOn,
    isSubmitting,
    submitResult,
    submitBooking,
    isPreSelected,
    missingFields, setMissingFields,
  };
}

export default useBooking;

