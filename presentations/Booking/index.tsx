"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useBooking } from "./useBooking";

interface EventAddon {
    name: string;
    price: number;
}


/**
 * BookingPresentation — THE VIEW for booking form
 *
 * Renders all form fields and delegates logic to useBooking ViewModel.
 */

const TIME_SLOTS = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
];

export default function BookingPresentation() {
    const vm = useBooking();

    return (
        <div className="min-h-screen bg-muted/30 py-16 px-6">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-background border border-border/40 shadow-none rounded-xl overflow-hidden"
                >
                    <div className="text-center pb-2 pt-8 px-6 border-b border-border/10">
                        <h1 className="text-2xl font-bold">
                            Book Your Event
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Fill in the details below and we&apos;ll confirm your booking.
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Event Type */}
                        <div className="space-y-2">
                            <Label>Event Type *</Label>
                            <Select
                                value={vm.eventType}
                                onValueChange={(v) => { vm.setEventType(v); if (vm.missingFields.includes("eventType")) { vm.setMissingFields(vm.missingFields.filter(f => f !== "eventType")); } }}
                                disabled={vm.isDataLoading}
                            >
                                <SelectTrigger className={`w-full bg-muted/20 ${vm.missingFields.includes("eventType") ? "border-red-500/50 ring-red-500/20" : ""}`} data-test-id="select-event-type">
                                    <SelectValue placeholder={vm.isDataLoading ? "Loading events..." : "Choose event type"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {vm.events.map((event) => (
                                        <SelectItem key={String(event._id)} value={event.name}>
                                            {event.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start bg-muted/20 ${vm.missingFields.includes("eventDate") ? "border-red-500/50 ring-red-500/20 text-red-500" : ""}`}
                                            data-test-id="btn-pick-date"
                                            disabled={vm.isPreSelected}
                                        >
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            {vm.eventDate
                                                ? format(vm.eventDate, "PPP")
                                                : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={vm.eventDate}
                                            onSelect={(d) => { vm.setEventDate(d); if (vm.missingFields.includes("eventDate")) { vm.setMissingFields(vm.missingFields.filter(f => f !== "eventDate")); } }}
                                            disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Time *</Label>
                                <Select
                                    value={vm.eventTime}
                                    onValueChange={(v) => { vm.setEventTime(v); if (vm.missingFields.includes("eventTime")) { vm.setMissingFields(vm.missingFields.filter(f => f !== "eventTime")); } }}
                                    disabled={vm.isPreSelected}
                                >
                                    <SelectTrigger className={`w-full bg-muted/20 ${vm.missingFields.includes("eventTime") ? "border-red-500/50 ring-red-500/20" : ""}`} data-test-id="select-time">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Pick a time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_SLOTS.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Client Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                    value={vm.clientName}
                                    onChange={(e) => { vm.setClientName(e.target.value); if (vm.missingFields.includes("clientName")) { vm.setMissingFields(vm.missingFields.filter(f => f !== "clientName")); } }}
                                    placeholder="Juan Dela Cruz"
                                    className={`bg-muted/20 ${vm.missingFields.includes("clientName") ? "border-red-500/50 ring-red-500/20" : ""}`}
                                    data-test-id="input-client-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={vm.clientEmail}
                                    onChange={(e) => { vm.setClientEmail(e.target.value); if (vm.missingFields.includes("clientEmail")) { vm.setMissingFields(vm.missingFields.filter(f => f !== "clientEmail")); } }}
                                    placeholder="juan@email.com"
                                    className={`bg-muted/20 ${vm.missingFields.includes("clientEmail") ? "border-red-500/50 ring-red-500/20" : ""}`}
                                    data-test-id="input-client-email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Phone *</Label>
                            <Input
                                value={vm.clientPhone}
                                onChange={(e) => { vm.setClientPhone(e.target.value); if (vm.missingFields.includes("clientPhone")) { vm.setMissingFields(vm.missingFields.filter(f => f !== "clientPhone")); } }}
                                placeholder="+63 912 345 6789"
                                className={`bg-muted/20 ${vm.missingFields.includes("clientPhone") ? "border-red-500/50 ring-red-500/20" : ""}`}
                                data-test-id="input-client-phone"
                            />
                        </div>

                        {/* Add-ons */}
                        {vm.currentEvent?.addons && vm.currentEvent.addons.length > 0 && (
                            <div className="space-y-3">
                                <Label>{vm.currentEvent?.name} Add-ons</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {vm.currentEvent?.addons.map((addOn: EventAddon) => (
                                        <label
                                            key={addOn.name}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={vm.addOns.includes(addOn.name)}
                                                onCheckedChange={() => vm.toggleAddOn(addOn.name)}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{addOn.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    +₱{addOn.price.toLocaleString()}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={vm.notes}
                                onChange={(e) => vm.setNotes(e.target.value)}
                                placeholder="Any special requests or details..."
                                rows={3}
                                className="bg-muted/20"
                                data-test-id="input-notes"
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            onClick={vm.submitBooking}
                            disabled={vm.isSubmitting}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-6"
                            data-test-id="btn-submit-booking"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {vm.isSubmitting ? "Submitting..." : "Submit Booking"}
                        </Button>

                        {/* Result */}
                        {vm.submitResult && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`flex items-center gap-2 rounded-lg p-3 text-sm ${vm.submitResult.success
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                                    }`}
                            >
                                {vm.submitResult.success ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                {vm.submitResult.message}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

