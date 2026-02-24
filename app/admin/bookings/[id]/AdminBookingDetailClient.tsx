"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    FileText,
    Tag,
    ShieldAlert,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    PackagePlus,
} from "lucide-react";
import Link from "next/link";
import type { IBooking, BookingStatus } from "@/types/booking";

interface Props {
    id: string;
    token?: string;
    exp?: string;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <AlertCircle className="h-3.5 w-3.5" /> },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    canceled: { label: "Canceled", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="h-3.5 w-3.5" /> },
    completed: { label: "Completed", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

type BookingRecord = IBooking & { bookingId?: string };

export default function AdminBookingDetailClient({ id, token, exp }: Props) {
    const [booking, setBooking] = useState<BookingRecord | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !exp) {
            setError("Access denied. This link is missing required authentication parameters.");
            setLoading(false);
            return;
        }

        const fetchBooking = async () => {
            try {
                const res = await fetch(`/api/admin/booking/${id}?token=${token}&exp=${exp}`);
                const data = await res.json() as { booking?: BookingRecord; error?: string };

                if (!res.ok) {
                    setError(data.error ?? "Failed to load booking data.");
                } else {
                    setBooking(data.booking ?? null);
                }
            } catch {
                setError("A network error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, token, exp]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Fetching Record...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-sm w-full bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center space-y-4">
                    <div className="h-14 w-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="h-7 w-7 text-red-500" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-base font-bold text-slate-900">Access Restricted</h1>
                        <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
                    </div>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Return to Admin Panel
                    </Link>
                </div>
            </div>
        );
    }

    if (!booking) return null;

    const statusCfg = STATUS_CONFIG[booking.status];
    const eventDate = new Date(booking.eventDate);

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-start py-12 px-4">
            {/* Back link */}
            <div className="w-full max-w-xl mb-4">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Admin Panel
                </Link>
            </div>

            {/* Card */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Header strip */}
                <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Admin Record</p>
                        <h1 className="text-lg font-bold text-white leading-tight">{booking.eventType}</h1>
                        {booking.bookingId && (
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">#{booking.bookingId}</p>
                        )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusCfg.color}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                    </span>
                </div>

                {/* Body */}
                <div className="divide-y divide-slate-100">

                    {/* Event Details Section */}
                    <section className="px-6 py-5 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Event Details</p>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Date" value={format(eventDate, "MMMM d, yyyy")} />
                            <DetailRow icon={<Clock className="h-4 w-4" />} label="Time" value={booking.eventTime} />
                            <DetailRow icon={<Tag className="h-4 w-4" />} label="Event Type" value={booking.eventType} />
                        </div>
                    </section>

                    {/* Client Details Section */}
                    <section className="px-6 py-5 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Client Details</p>
                        <div className="space-y-3">
                            <DetailRow icon={<User className="h-4 w-4" />} label="Full Name" value={booking.clientName} />
                            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={booking.clientEmail} />
                            <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={booking.clientPhone} />
                        </div>
                    </section>

                    {/* Add-ons */}
                    {booking.addOns && booking.addOns.length > 0 && (
                        <section className="px-6 py-5 space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Add-ons</p>
                            <div className="flex flex-wrap gap-2">
                                {booking.addOns.map((a) => (
                                    <span key={a} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-medium">
                                        <PackagePlus className="h-3 w-3" />
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Notes */}
                    {booking.notes && booking.notes.trim().length > 0 && (
                        <section className="px-6 py-5 space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes</p>
                            <div className="flex items-start gap-3">
                                <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-700 leading-relaxed">{booking.notes}</p>
                            </div>
                        </section>
                    )}

                    {/* Timestamp footer */}
                    <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                            Submitted {format(new Date(booking.createdAt), "MMM d, yyyy · h:mm a")}
                        </span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            ADMIN ONLY
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
            </div>
        </div>
    );
}
