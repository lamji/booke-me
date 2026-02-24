"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, Speaker } from "lucide-react";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { format } from "date-fns";
import type { IBooking, EventType } from "@/types/booking";
import { EVENT_TYPE_LABELS } from "@/types/booking";

interface FindBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_COLORS = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    canceled: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function FindBookingModal({ isOpen, onClose }: FindBookingModalProps) {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [booking, setBooking] = useState<IBooking | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setBooking(null);

        const isEmail = query.includes("@");
        const params = isEmail ? `?email=${encodeURIComponent(query)}` : `?id=${encodeURIComponent(query)}`;

        try {
            const res = await api.get(`/api/bookings/find${params}`);
            if (res.data?.booking) {
                setBooking(res.data.booking);
            }
        } catch (err: unknown) {
            if (err instanceof AxiosError && err.response?.status === 404) {
                setError("No booking found with those details.");
            } else if (err instanceof AxiosError) {
                setError(err.response?.data?.error || "An error occurred while searching.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setQuery("");
        setError(null);
        setBooking(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[500px] bg-black/90 backdrop-blur-xl border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-2">Find Your Booking</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Enter your Email Address or your unique Booking ID to check your status.
                    </DialogDescription>
                </DialogHeader>

                {!booking ? (
                    <form onSubmit={handleSearch} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Ex: john@email.com or 60f7..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500"
                                required
                                data-test-id="modal-input-search"
                            />
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                            disabled={isLoading}
                            data-test-id="modal-btn-search"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Search
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div>
                                <p className="text-sm text-zinc-400">Status</p>
                                <Badge variant="outline" className={`mt-1 font-mono ${STATUS_COLORS[booking.status]}`}>
                                    {booking.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-zinc-400">Client</p>
                                <p className="font-medium text-white">{booking.clientName}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Speaker className="h-5 w-5 text-amber-500" />
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Event Type</p>
                                    <p className="font-medium text-white">{EVENT_TYPE_LABELS[booking.eventType as EventType] || booking.eventType}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Date</p>
                                    <p className="font-medium text-white">{format(new Date(booking.eventDate), "PPP")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Time</p>
                                    <p className="font-medium text-white">{booking.eventTime}</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5"
                            onClick={() => setBooking(null)}
                        >
                            Search Another
                        </Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
