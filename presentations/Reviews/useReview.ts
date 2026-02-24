"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api, { isAxiosError } from "@/lib/axios";

export function useReview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams?.get("bkgId");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [bookingData, setBookingData] = useState<{ clientName: string; eventType: string } | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(!!bookingId);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/api/bookings/find?id=${bookingId}`);
        if (res.data?.booking) {
          setBookingData(res.data.booking);
        }
      } catch (error) {
        console.error("[Review] Failed to fetch booking info:", error);
      } finally {
        setIsLoadingBooking(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const submitReview = useCallback(async () => {
    if (!bookingId) return;
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await api.post("/api/reviews", {
        bookingId,
        rating,
        comment,
      });
      setSubmitResult({ success: true, message: res.data.message });
      
      // Auto redirect after success
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      let message = "Failed to submit review. Please try again.";
      if (isAxiosError(error) && error.response?.data?.error) {
        message = error.response.data.error;
      }
      setSubmitResult({
        success: false,
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [bookingId, rating, comment, router]);

  return {
    bookingId,
    bookingData,
    isLoadingBooking,
    rating,
    setRating,
    comment,
    setComment,
    isSubmitting,
    submitReview,
    submitResult,
  };
}
