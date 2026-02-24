"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
    Bell,
    Calendar,
    Clock,
    User,
    Tag,
    Copy,
    Check,
    Loader2,
    ShieldCheck,
    Package
} from "lucide-react";
import { useAdminContext } from "../AdminProvider";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import type { IBooking } from "@/types/booking";

interface BookingTokenResponse {
    token: string;
    exp: number;
}

export function NotificationDetailsModal() {
    const { selectedNotification, setSelectedNotification, updateStatus, markNotificationRead } = useAdminContext();
    const [bookingData, setBookingData] = useState<IBooking | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isActioning, setIsActioning] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Extract booking ID from link
    const extractBookingId = useCallback((): string | null => {
        if (!selectedNotification?.link) return null;
        const parts = selectedNotification.link.split("/");
        return parts[parts.length - 1] || null;
    }, [selectedNotification]);

    const bookingId = extractBookingId();

    useEffect(() => {
        if (selectedNotification?.type === "new_booking" && bookingId) {
            const fetchData = async () => {
                setIsLoadingData(true);
                try {
                    // Get a temporary admin token to fetch the full record
                    const tokenRes = await api.post<BookingTokenResponse>(`/api/admin/booking/${bookingId}`);
                    const { token, exp } = tokenRes.data;

                    const dataRes = await fetch(`/api/admin/booking/${bookingId}?token=${token}&exp=${exp}`);
                    const data = await dataRes.json();
                    if (data.booking) {
                        setBookingData(data.booking);
                    }
                } catch (err) {
                    console.error("Failed to fetch booking for notification:", err);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchData();
        } else {
            setBookingData(null);
        }
    }, [selectedNotification, bookingId]);

    if (!selectedNotification) return null;

    const isInternalBooking = selectedNotification.type === "new_booking" && bookingId;

    const handleCopyId = () => {
        if (!bookingData?.bookingId) return;
        navigator.clipboard.writeText(bookingData.bookingId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleModerate = async (status: "approved" | "canceled") => {
        if (!bookingId) return;
        setIsActioning(status);
        try {
            await updateStatus(bookingId, status);
            await markNotificationRead(selectedNotification._id);
            setSelectedNotification(null);
        } catch (err) {
            console.error("Moderation failed from modal:", err);
        } finally {
            setIsActioning(null);
        }
    };

    return (
        <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
            <DialogContent className={`p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl transition-all duration-300 ${isInternalBooking ? "sm:max-w-xl" : "sm:max-w-[460px]"}`}>

                {/* ── HEADER (High Fidelity) ── */}
                <div className="bg-slate-900 px-8 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                        <Bell className="h-32 w-32 rotate-12" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <ShieldCheck className="h-3 w-3 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Registry Entry</span>
                            {isInternalBooking && (
                                <Badge className="ml-auto bg-amber-50 rounded-full text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 animate-pulse">
                                    ● Pending Review
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-1">
                            {isInternalBooking && bookingData ? (
                                <h1 className="text-3xl font-black tracking-tight">{bookingData.eventType}</h1>
                            ) : (
                                <DialogTitle className="text-xl font-bold tracking-tight text-white">
                                    Notification Details
                                </DialogTitle>
                            )}
                            {isInternalBooking && bookingData?.bookingId && (
                                <div className="flex items-center gap-2 text-slate-400 mt-2">
                                    <span className="text-xs font-mono">Reference ID: <span className="text-slate-200 font-bold">{bookingData.bookingId}</span></span>
                                    <button onClick={handleCopyId} className="hover:text-white transition-colors">
                                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── BODY (Registry Entry Style) ── */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {isLoadingData ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identifying record...</p>
                        </div>
                    ) : isInternalBooking && bookingData ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

                            {/* Section: Identification */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Identification</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Full Name</span>
                                        <span className="text-sm font-black text-slate-900 mt-1">{bookingData.clientName}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Contact Email</span>
                                        <span className="text-sm font-bold text-blue-600 underline truncate mt-1">{bookingData.clientEmail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Specification */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Specification</span>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Scheduled Date</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{format(new Date(bookingData.eventDate), "MMMM d, yyyy")}</span>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Time Window</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{bookingData.eventTime}</span>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Project Value</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">₱{bookingData.eventType === "Wedding" ? "2,500.00" : "1,500.00"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Notes */}
                            {bookingData.notes && (
                                <div className="space-y-3">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Specification Notes</span>
                                    <div className="p-5 bg-slate-50 border-l-4 border-slate-900 rounded-r-2xl italic text-sm text-slate-600 leading-relaxed">
                                        &ldquo;{bookingData.notes}&rdquo;
                                    </div>
                                </div>
                            )}

                            {/* Status Footer */}
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-4 border-t border-slate-100">
                                <span className="uppercase tracking-widest">Created: {format(new Date(bookingData.createdAt), "MM/dd/yy HH:mm")}</span>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleModerate("canceled")}
                                        disabled={!!isActioning}
                                        className="h-10 px-8 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold uppercase tracking-widest text-[11px] disabled:opacity-50"
                                    >
                                        {isActioning === "canceled" ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Cancel"}
                                    </button>
                                    <button
                                        onClick={() => handleModerate("approved")}
                                        disabled={!!isActioning}
                                        className="h-10 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold uppercase tracking-widest text-[11px] disabled:opacity-50"
                                    >
                                        {isActioning === "approved" ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Approve"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Standard Notification View */
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-start gap-3">
                                <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <Clock className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Received At</p>
                                    <p className="text-sm font-medium text-slate-900 leading-tight mt-0.5">
                                        {format(new Date(selectedNotification.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-sm leading-relaxed text-slate-700 font-medium">
                                    {selectedNotification.message}
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full text-slate-400 hover:text-slate-700 font-black h-12 text-[10px] uppercase tracking-[0.2em] border-slate-100 hover:bg-slate-50"
                                onClick={() => setSelectedNotification(null)}
                            >
                                Dismiss Alert
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
