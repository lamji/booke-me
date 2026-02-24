import { useState, useCallback, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useSocket } from "@/lib/hooks/useSocket";
import type { IEvent } from "@/lib/models/Event";

interface EventPayload {
    name: string;
    description?: string;
    basePrice: number;
    duration?: string;
    process?: string;
    addons?: Array<{ name: string; price: number }>;
    isActive?: boolean;
}

function getAxiosErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof AxiosError) {
        return (error.response?.data as { error?: string })?.error ?? fallback;
    }
    return fallback;
}

export function useEvents() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { emit } = useSocket();

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/events?admin=true");
            setEvents(res.data);
        } catch (error: unknown) {
            toast.error("Failed to fetch events registry", {
                description: getAxiosErrorMessage(error, "Connection error"),
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const createEvent = async (data: EventPayload, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await axios.post("/api/events", data);
            toast.success("Event type created and added to registry.");
            await fetchEvents();
            emit("events-updated");
            onSuccess?.();
        } catch (error: unknown) {
            toast.error("Creation Failed", {
                description: getAxiosErrorMessage(error, "Could not save event type."),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateEvent = async (id: string, data: Partial<EventPayload>, onSuccess?: () => void) => {
        setUpdatingId(id);
        try {
            await axios.patch(`/api/events/${id}`, data);
            toast.success("Event configuration saved.");
            await fetchEvents();
            emit("events-updated");
            onSuccess?.();
        } catch (error: unknown) {
            toast.error("Update Failed", {
                description: getAxiosErrorMessage(error, "Could not update event."),
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleEventStatus = async (id: string, currentStatus: boolean) => {
        setUpdatingId(id);
        try {
            await axios.patch(`/api/events/${id}`, { isActive: !currentStatus });
            toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'}.`);
            await fetchEvents();
            emit("events-updated");
        } catch (error: unknown) {
            toast.error("Status Update Failed", {
                description: getAxiosErrorMessage(error, "Action could not be completed."),
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteEvent = async (id: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this event type?")) return;
        
        setUpdatingId(id);
        try {
            await axios.delete(`/api/events/${id}`);
            toast.success("Event permanently removed from registry.");
            await fetchEvents();
            emit("events-updated");
        } catch (error: unknown) {
            toast.error("Deletion Failed", {
                description: getAxiosErrorMessage(error, "Event could not be deleted."),
            });
        } finally {
            setUpdatingId(null);
        }
    };

    return {
        events,
        isLoading,
        isSubmitting,
        updatingId,
        createEvent,
        updateEvent,
        toggleEventStatus,
        deleteEvent,
        refresh: fetchEvents
    };
}
