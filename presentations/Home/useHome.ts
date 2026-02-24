"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import type {
  CheckAvailabilityResponse,
  IReview,
} from "@/types/booking";

/**
 * useHome — ViewModel for the Homepage
 *
 * Manages hero date selection state, availability checking,
 * and navigation to the booking page with pre-filled data.
 * Pure logic, no JSX. (MVVM coding-standard.md)
 */

export function useHome() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<CheckAvailabilityResponse | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);

  useEffect(() => {
    // Fetch fully booked dates on mount
    const fetchBookedDates = async () => {
      try {
        const res = await api.get("/api/bookings/dates");
        if (res.data?.bookedDates) {
          setBookedDates(res.data.bookedDates.map((d: string) => new Date(d)));
        }
      } catch (error) {
        console.error("Failed to fetch booked dates", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await api.get("/api/reviews?featured=true");
        setReviews(res.data);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };

    fetchBookedDates();
    fetchReviews();
  }, []);


  const checkAvailability = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;

    setIsChecking(true);
    setAvailability(null);

    try {
      const res = await api.post("/api/bookings/availability", {
        eventDate: selectedDate.toISOString(),
        eventTime: selectedTime,
      });
      setAvailability(res.data);
    } catch {
      setAvailability({
        available: false,
        message: "Failed to check availability. Try again.",
      });
    } finally {
      setIsChecking(false);
    }
  }, [selectedDate, selectedTime]);

  const navigateToBooking = useCallback(() => {
    if (!selectedDate || !selectedTime) return;
    const params = new URLSearchParams({
      date: selectedDate.toISOString(),
      time: selectedTime,
    });
    router.push(`/booking?${params.toString()}`);
  }, [selectedDate, selectedTime, router]);

  return {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    isChecking,
    availability,
    bookedDates,
    reviews,
    checkAvailability,
    navigateToBooking,
  };
}

export default useHome;
