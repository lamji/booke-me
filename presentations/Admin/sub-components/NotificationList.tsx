"use client";

import React from "react";
import { format } from "date-fns";
import {
    Calendar,
    CheckCircle2,
    MoreHorizontal,
    Inbox,
    Trash2,
    ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminContext } from "../AdminProvider";
import type { INotification } from "@/types/booking";

export function NotificationList() {
    const {
        notifications,
        markNotificationRead,
        deleteNotification,
        setSelectedNotification,
    } = useAdminContext();

    const handleViewDetails = (notification: INotification) => {
        if (!notification.isRead) {
            markNotificationRead(notification._id);
        }
        setSelectedNotification(notification);
    };

    if (notifications.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <Inbox className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">All caught up!</h2>
                    <p className="text-sm text-slate-900 font-normal uppercase tracking-tight">No new notifications at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
                <Badge variant="outline" className="bg-slate-50 text-slate-900 border-slate-900 font-medium uppercase tracking-widest text-[10px]">
                    {notifications.filter(n => !n.isRead).length} Unread
                </Badge>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`p-6 flex items-start gap-5 transition-colors ${!notification.isRead ? "bg-blue-50/30" : "hover:bg-slate-50/50"
                            }`}
                    >
                        <div className={`mt-1 h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${notification.type === "new_booking"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-blue-100 text-blue-600"
                            }`}>
                            {notification.type === "new_booking" ? (
                                <Calendar className="h-5 w-5" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <p className={`text-sm ${!notification.isRead ? "font-medium text-slate-900" : "font-normal text-slate-900 opacity-60"}`}>
                                    {notification.message}
                                </p>
                                <span className="text-xs font-medium text-slate-900 whitespace-nowrap uppercase tracking-tighter">
                                    {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {!notification.isRead && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-blue-600 font-bold text-xs"
                                        onClick={() => markNotificationRead(notification._id)}
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-900">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] bg-white border border-slate-200">
                                <DropdownMenuItem
                                    className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                                    onClick={() => handleViewDetails(notification)}
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex items-center gap-2 text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    onClick={() => deleteNotification(notification._id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete Alert
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
        </div>
    );
}
