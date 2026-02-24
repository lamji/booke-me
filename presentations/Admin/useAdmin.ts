"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/lib/hooks/useSocket";
import api from "@/lib/axios";
import type { IBooking, INotification } from "@/types/booking";
import type { IEvent } from "@/lib/models/Event";

interface SiteSettings {
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  policy?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
}

type UpdateSettingsInput = Partial<SiteSettings>;


/**
 * useAdmin — ViewModel for Admin Dashboard
 *
 * Handles fetching bookings, updating status, and real-time updates.
 * Pure logic, no JSX. (MVVM coding-standard.md)
 */

export function useAdmin() {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { socket, emit } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Sorting State
  const [filter, setFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get("/api/events?admin=true");
      setEvents(res.data);
    } catch (error) {
      console.error("[Admin] Failed to fetch events:", error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { 
        limit: "10",
        page: page.toString(),
        sortBy,
        sortOrder
      };
      if (filter !== "all") params.status = filter;
      if (eventTypeFilter !== "all") params.eventType = eventTypeFilter;

      const res = await api.get("/api/bookings", { params });
      setBookings(res.data.bookings);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.total);
    } catch (error) {
      console.error("[Admin] Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, eventTypeFilter, sortBy, sortOrder, page]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("[Admin] Failed to fetch notifications:", error);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get("/api/settings");
      setSettings(res.data);
    } catch (error) {
      console.error("[Admin] Failed to fetch settings:", error);
    }
  }, []);

  const updateSettings = useCallback(async (data: UpdateSettingsInput) => {
    try {
      const res = await api.put("/api/settings", data);
      setSettings(res.data.settings);
      return { success: true };
    } catch (error) {
      console.error("[Admin] Failed to update settings:", error);
      return { success: false, error };
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("[Admin] Failed to mark notification read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("[Admin] Failed to delete notification:", error);
    }
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filter, eventTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchEvents();
    fetchBookings();
    fetchNotifications();
    fetchSettings();
  }, [fetchEvents, fetchBookings, fetchNotifications, fetchSettings]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    if (!socket) return;
    
    // Join the admin room to receive notifications
    socket.emit("join-admin");

    const onNewBooking = (bookingData: unknown) => {
      console.log("[Admin] New booking via socket:", bookingData);
      fetchBookings(); // Refresh the list
    };

    const onBookingUpdate = (updateData: unknown) => {
      console.log("[Admin] Booking update via socket:", updateData);
      fetchBookings(); // Refresh the list
      fetchNotifications();
    };

    const onNewNotification = (notificationData: unknown) => {
      console.log("[Admin] New notification via socket:", notificationData);
      fetchNotifications();
    };

    socket.on("new-booking", onNewBooking);
    socket.on("booking-update", onBookingUpdate);
    socket.on("new-notification", onNewNotification);

    return () => {
      socket.off("new-booking", onNewBooking);
      socket.off("booking-update", onBookingUpdate);
      socket.off("new-notification", onNewNotification);
    };
  }, [socket, fetchBookings, fetchNotifications]);

  const updateStatus = useCallback(
    async (id: string, status: "approved" | "canceled") => {
      setUpdatingId(id);
      try {
        await api.patch(`/api/bookings/${id}`, { status });
        
        // Notify others
        emit("booking-update", { id, status });

        // Optimistic update
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status } : b))
        );
      } catch (error) {
        console.error("[Admin] Failed to update booking:", error);
      } finally {
        setUpdatingId(null);
      }
    },
    [emit]
  );

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const canceledCount = bookings.filter((b) => b.status === "canceled").length;
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return {
    bookings,
    notifications,
    events,
    isLoading,
    filter,
    setFilter,
    eventTypeFilter,
    setEventTypeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updatingId,
    updateStatus,
    fetchBookings,
    markNotificationRead,
    fetchNotifications,
    deleteNotification,
    pendingCount,
    approvedCount,
    canceledCount,
    unreadNotificationsCount,
    page,
    setPage,
    totalPages,
    totalItems,
    settings,
    fetchSettings,
    updateSettings,
    selectedNotification,
    setSelectedNotification,
  };
}

export default useAdmin;
