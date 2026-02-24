"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Bell, Calendar, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useAdminContext } from "../AdminProvider";
import { Badge } from "@/components/ui/badge";

export function NotificationDetailsModal() {
    const { selectedNotification, setSelectedNotification, setCurrentView } = useAdminContext();

    if (!selectedNotification) return null;

    const handleAction = () => {
        if (selectedNotification.type === "new_booking" || selectedNotification.type === "status_change") {
            setCurrentView("BOOKINGS");
        }
        setSelectedNotification(null);
    };

    return (
        <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
                <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bell className="h-24 w-24 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${selectedNotification.type === "new_booking"
                            ? "bg-amber-500 text-white"
                            : "bg-blue-500 text-white"
                            }`}>
                            {selectedNotification.type === "new_booking" ? (
                                <Calendar className="h-8 w-8" />
                            ) : (
                                <CheckCircle2 className="h-8 w-8" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] tracking-widest uppercase">
                                {selectedNotification.type.replace("_", " ")}
                            </Badge>
                            <DialogTitle className="text-xl font-bold tracking-tight text-white">
                                Notification Details
                            </DialogTitle>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Received At</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {format(new Date(selectedNotification.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-sm leading-relaxed text-slate-700 italic">
                                &ldquo;{selectedNotification.message}&rdquo;
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 h-auto rounded-xl shadow-lg transition-all active:scale-[0.98]"
                            onClick={handleAction}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Go to Related Record
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-slate-500 hover:text-slate-900 font-medium py-3"
                            onClick={() => setSelectedNotification(null)}
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
