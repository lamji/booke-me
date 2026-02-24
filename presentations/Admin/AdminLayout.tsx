"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Calendar,
    LogOut,
    ClipboardList,
    Settings
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminContext } from "./AdminProvider";
import type { AdminView } from "./AdminProvider";
import { SettingsModal } from "./sub-components/SettingsModal";
import { NotificationDropdown } from "./sub-components/NotificationDropdown";
import { NotificationDetailsModal } from "./sub-components/NotificationDetailsModal";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { currentView, setCurrentView } = useAdminContext();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const menuItems: Array<{ group: string; items: Array<{ icon: React.ComponentType<{ className?: string }>; label: string; view: AdminView }> }> = [
        {
            group: "Management", items: [
                { icon: LayoutDashboard, label: "Dashboard", view: "DASHBOARD" },
                { icon: ClipboardList, label: "Bookings", view: "BOOKINGS" },
                { icon: Calendar, label: "Events", view: "EVENTS" },
            ]
        }
    ];

    return (
        <div className="flex min-h-screen bg-bg-secondary text-slate-900 font-sans antialiased">
            {/* Professional Dark Sidebar */}
            <aside className="w-[260px] bg-bg-primary text-white flex flex-col fixed h-full z-50 shadow-2xl">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                        <span className="font-bold text-white text-lg">B</span>
                    </div>
                    <span className="font-bold text-white text-xl tracking-tight">BOOK.ME</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                    {menuItems.map((group) => (
                        <div key={group.group} className="space-y-2">
                            <h3 className="px-2 text-[10px] font-medium text-white/50 uppercase tracking-widest">
                                {group.group}
                            </h3>
                            <nav className="space-y-1">
                                {group.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => setCurrentView(item.view)}
                                        className={`flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white ${currentView === item.view ? "bg-slate-800 text-white" : ""
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 ml-[260px] flex flex-col">
                {/* Professional Header */}
                <header className="h-[70px] bg-bg-secondary border-b border-border px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Search Removed */}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-900 hover:text-blue-600 rounded-full transition-all duration-300 hover:bg-slate-100"
                            onClick={() => setIsSettingsOpen(true)}
                            title="Global Settings"
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                        <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                        {/* Plus Removed */}
                        <NotificationDropdown />
                        <div className="h-4 w-[1px] bg-slate-200 mx-2" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium leading-none">Admin User</p>
                                <p className="text-[10px] text-slate-900 font-normal uppercase tracking-tight">Administrator</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-slate-200" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-900 hover:text-red-600 transition-colors ml-2"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                title="Sign Out"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>

                    </div>
                </header>

                {/* Main Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
            <NotificationDetailsModal />
        </div>
    );
}
