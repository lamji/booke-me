"use client";

import { useAdminContext } from "./AdminProvider";
import { BookingTable } from "./sub-components/BookingTable";
import { EventManager } from "./sub-components/EventManager";
import { NotificationList } from "./sub-components/NotificationList";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CreditCard,
    TrendingUp,
    MessageSquare,
    Globe,
    Fingerprint
} from "lucide-react";
import { DashboardCalendar } from "./sub-components/DashboardCalendar";
import { ChatManager } from "./sub-components/ChatManager";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

import { formatPHP } from "@/lib/format";

export default function AdminPresentation() {
    const {
        bookings,
        updateStatus,
        updatingId,
        pendingCount,
        approvedCount,
        currentView
    } = useAdminContext();

    const [analytics, setAnalytics] = useState<any>(null);

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
            { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending Tasks", value: pendingCount, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
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
