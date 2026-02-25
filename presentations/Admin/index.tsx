"use client";

import { useAdminContext } from "./AdminProvider";
import { BookingTable } from "./sub-components/BookingTable";
import { ReviewTable } from "./sub-components/ReviewTable";
import { EventManager } from "./sub-components/EventManager";
import { NotificationList } from "./sub-components/NotificationList";
import {
    LayoutDashboard,
    Users,
    Globe,
    Fingerprint,
    Star
} from "lucide-react";
import { DashboardCalendar } from "./sub-components/DashboardCalendar";
import { ChatManager } from "./sub-components/ChatManager";
import { ClientTable } from "./sub-components/ClientTable";
import { FollowUpModal } from "./sub-components/FollowUpModal";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import type { IClientDocument } from "@/lib/models/Client";


interface AnalyticsData {
    today: { visits: number; uniques: number };
    totals: { bookings: number; chats: number };
    history: Array<{ date: string; visits: number; uniques: number }>;
}

export default function AdminPresentation() {
    const {
        bookings,
        updateStatus,
        updatingId,
        pendingCount,
        reviews,
        updateReviewStatus,
        updateReviewFeatured,
        averageRating,
        currentView,
        clients,
        fetchClients,
        sendFollowUp,
        isLoading
    } = useAdminContext();

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [selectedClient, setSelectedClient] = useState<IClientDocument | null>(null);

    useEffect(() => {
        if (currentView === "CLIENTS") fetchClients();
    }, [currentView, fetchClients]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get("/api/analytics");
                setAnalytics(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            }
        };
        if (currentView === "DASHBOARD") fetchAnalytics();
    }, [currentView]);

    // DASHBOARD VIEW (Analytics + 5 Recent)
    if (currentView === "DASHBOARD") {
        const stats = [
            { label: "Daily Visits", value: analytics?.today?.visits || 0, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Unique Users", value: analytics?.today?.uniques || 0, icon: Fingerprint, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Pending Tasks", value: pendingCount, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Average Rating", value: averageRating, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
        ];

        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                        <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">Daily analytics and recent activity overview.</p>
                    </div>

                    <div className="flex items-center gap-3">
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-bg-secondary p-6 rounded-xl border border-border flex items-center gap-5 transition-all">
                            <div className={`h-12 w-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-normal text-slate-900 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left: Recent Bookings Table (8) */}
                    <div className="lg:col-span-8 flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">Recent 5 Bookings</h2>
                            <span className="text-xs font-normal text-slate-900 font-mono tracking-tighter">REGISTRY_SNAPSHOT_V1</span>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <BookingTable
                                data={bookings.slice(0, 5)}
                                onUpdateStatus={updateStatus}
                                updatingId={updatingId}
                                hidePagination={true}
                                loading={isLoading}
                            />
                        </div>
                    </div>

                    {/* Right: Event Calendar (4) */}
                    <div className="lg:col-span-4 flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">Schedule Overview</h2>
                            <span className="text-xs font-normal text-slate-900 uppercase tracking-widest">Live Availability</span>
                        </div>
                        <div className="flex-1">
                            <DashboardCalendar bookings={bookings} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // REGISTRY / BOOKINGS VIEW (Full List)
    if (currentView === "BOOKINGS") {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bookings Registry</h1>
                        <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">The complete ledger of all event registrations.</p>
                    </div>

                    <div className="flex items-center gap-3">
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Master Record</h2>
                        <span className="text-xs font-normal text-slate-900 uppercase tracking-widest">Total Entries: {bookings.length}</span>
                    </div>

                    <BookingTable
                        data={bookings}
                        onUpdateStatus={updateStatus}
                        updatingId={updatingId}
                        loading={isLoading}
                    />
                </div>
            </div>
        );
    }

    // EVENT MANAGEMENT VIEW
    if (currentView === "EVENTS") {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Event Configuration Registry</h1>
                        <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">Define, price, and manage event profiles offered in public view.</p>
                    </div>

                    <div className="flex items-center gap-3">
                    </div>
                </div>

                <EventManager />
            </div>
        );
    }

    // CHATS VIEW
    if (currentView === "CHATS") {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Communication Center</h1>
                        <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">Real-time recording of chatbot interactions per session.</p>
                    </div>
                </div>
                <ChatManager />
            </div>
        );
    }

    // NOTIFICATIONS VIEW
    if (currentView === "NOTIFICATIONS") {
        return <NotificationList />;
    }

    // REVIEWS MODERATION VIEW
    if (currentView === "REVIEWS") {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review Moderation</h1>
                        <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">Manage and approve client testimonials for public display.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Feedback Ledger</h2>
                        <span className="text-xs font-normal text-slate-900 uppercase tracking-widest">Total Reviews: {reviews.length}</span>
                    </div>

                    <ReviewTable
                        data={reviews}
                        onUpdateStatus={updateReviewStatus}
                        onUpdateFeatured={updateReviewFeatured}
                        loading={isLoading}
                    />
                </div>
            </div>
        );
    }

    // CLIENTS REGISTRY VIEW
    if (currentView === "CLIENTS") {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients & Leads Registry</h1>
                        <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">Manage existing customers and follow up with potential leads captured from chat.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchClients()}
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 rounded-none h-auto pb-1 px-0"
                            >
                                All Contacts
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchClients("potential")}
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-900/40 hover:text-slate-900 rounded-none h-auto pb-1 px-0"
                            >
                                Potential Leads
                            </Button>
                        </div>
                        <span className="text-xs font-normal text-slate-900 uppercase tracking-widest">Total Registry: {clients.length}</span>
                    </div>

                    <ClientTable
                        data={clients}
                        onFollowUp={(client) => setSelectedClient(client)}
                        loading={isLoading}
                    />
                </div>

                <FollowUpModal
                    client={selectedClient}
                    isOpen={!!selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onSend={async (email, subject, body, footer) => {
                        const res = await sendFollowUp(email, subject, body, footer);
                        if (res.success) fetchClients(); // Refresh to update last followed up date
                        return res;
                    }}
                />
            </div>
        );
    }

    // FALLBACK / OTHER VIEWS
    return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <LayoutDashboard className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">{currentView} Module</h2>
                <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">This professional module is currently being synchronized.</p>
            </div>
        </div>
    );
}
