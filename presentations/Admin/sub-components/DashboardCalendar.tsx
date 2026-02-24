"use client";

import React, { useState } from "react";
import {
    format,
    isSameDay,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isToday,
    isSameMonth
} from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    CalendarDays,
    Clock,
    User,
    Info,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IBooking } from "@/types/booking";

interface DashboardCalendarProps {
    bookings: IBooking[];
}

export function DashboardCalendar({ bookings }: DashboardCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calendar generation logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    // Helper to get bookings for a specific day (excluding canceled)
    const getBookingsForDay = (date: Date) =>
        bookings.filter(b => isSameDay(new Date(b.eventDate), date) && b.status !== "canceled");

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 leading-none">
                            {format(currentMonth, "MMMM yyyy")}
                        </h3>
                        <p className="text-[10px] font-medium text-slate-900 uppercase tracking-widest mt-1">
                            Operational Schedule
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg border-slate-200">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg border-slate-200">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 border-b border-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-[10px] font-medium text-slate-900 uppercase tracking-tighter">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr">
                {calendarDays.map((day, idx) => {
                    const dayBookings = getBookingsForDay(day);
                    const isBooked = dayBookings.length > 0;
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <button
                            key={idx}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "relative flex flex-col p-2 border-r border-b border-slate-50 transition-all hover:bg-slate-50 group text-left h-full",
                                !isCurrentMonth && "bg-slate-50/30",
                                idx % 7 === 6 && "border-r-0"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-medium leading-none mb-1",
                                isToday(day) ? "bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center" : "text-slate-900",
                                !isCurrentMonth && "opacity-20"
                            )}>
                                {format(day, "d")}
                            </span>

                            {isBooked && isCurrentMonth && (
                                <div className="mt-auto space-y-1">
                                    <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-full" />
                                    </div>
                                    <p className="text-[9px] font-medium text-primary uppercase">
                                        {dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}
                                    </p>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-slate-900">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        Booked
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-slate-900">
                        <div className="h-2 w-2 rounded-full bg-slate-200" />
                        Available
                    </div>
                </div>
                <div className="text-[9px] font-normal text-slate-900 uppercase">
                    v1.3.4 Engine
                </div>
            </div>

            {/* Modal for Date Details */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
                    <div className="bg-primary p-6 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-blue-200" />
                                {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Date Details"}
                            </DialogTitle>
                            <DialogDescription className="text-white/70 text-xs font-medium">
                                Detailed schedule for the selected date.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {selectedDate && getBookingsForDay(selectedDate).length > 0 ? (
                            <div className="space-y-4">
                                {getBookingsForDay(selectedDate).map((booking) => (
                                    <div key={booking._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3 transition-all hover:border-primary/20">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="bg-white border-slate-200 text-[10px] font-medium uppercase py-0 text-primary">
                                                {booking.eventType}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-900">
                                                <Clock className="h-3 w-3" />
                                                {booking.eventTime}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                                <User className="h-4 w-4 text-slate-900" />
                                                {booking.clientName}
                                            </div>
                                            <div className="text-[10px] text-slate-900 font-normal pl-6 flex items-center justify-between">
                                                <span>Status: <span className="font-medium text-primary uppercase">{booking.status}</span></span>
                                                <span className="font-mono text-slate-900 opacity-30">#{booking._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                                <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                                    <Info className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 uppercase tracking-tighter">Quiet Day</p>
                                    <p className="text-xs font-normal text-slate-900 translate-y-[-2px]">No events scheduled for this date.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-50 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-[10px] font-medium uppercase tracking-widest text-slate-900 hover:bg-slate-100">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
