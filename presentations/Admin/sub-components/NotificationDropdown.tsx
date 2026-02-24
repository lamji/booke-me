"use client";

import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, CheckCircle2, Inbox } from "lucide-react";
import { useAdminContext } from "../AdminProvider";
import { format } from "date-fns";
import type { INotification } from "@/types/booking";

export function NotificationDropdown() {
    const {
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        setSelectedNotification,
        setCurrentView
    } = useAdminContext();

    const recentNotifications = notifications.slice(0, 5);

    const handleNotificationClick = (notification: INotification) => {
        if (!notification.isRead) {
            markNotificationRead(notification._id);
        }
        setSelectedNotification(notification);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-900 hover:text-blue-600 rounded-full relative transition-all duration-300 hover:bg-slate-100"
                >
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-medium text-white">
                            {unreadNotificationsCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">

                <div className="max-h-[400px] overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-3">
                                <Inbox className="h-6 w-6" />
                            </div>
                            <p className="text-xs font-medium text-slate-500">All caught up!</p>
                        </div>
                    ) : (
                        recentNotifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification._id}
                                className={`p-4 flex items-start gap-4 cursor-pointer focus:bg-slate-50 border-b border-slate-50 last:border-0 ${!notification.isRead ? "bg-blue-50/20" : ""
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${notification.type === "new_booking"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-blue-100 text-blue-600"
                                    }`}>
                                    {notification.type === "new_booking" ? (
                                        <Calendar className="h-4 w-4" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={`text-xs leading-relaxed ${!notification.isRead ? "font-bold text-slate-900" : "font-normal text-slate-900 opacity-60"}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        className="w-full text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-4 h-auto rounded-xl"
                        onClick={() => setCurrentView("NOTIFICATIONS")}
                    >
                        View All Notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
