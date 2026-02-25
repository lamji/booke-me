"use client";

import React, { useState } from "react";
import { useEvents } from "../sub-helpers/useEvents";
import type { IEvent } from "@/lib/models/Event";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { formatPHP } from "@/lib/format";
import {
    PlusCircle,
    Search,
    Edit2,
    Trash2,
    Power,
    Eye,
    CircleDollarSign,
    MoreHorizontal,
    Plus,
    X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EventManager() {
    const { events, isLoading, createEvent, updateEvent, toggleEventStatus, deleteEvent, isSubmitting, updatingId } = useEvents();
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
    const [viewedEvent, setViewedEvent] = useState<IEvent | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        basePrice: "" as number | string,
        duration: "",
        process: "",
        addons: [] as { name: string, price: number | string }[]
    });

    const filteredEvents = events.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenForm = (event?: IEvent) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                name: event.name,
                description: event.description || "",
                basePrice: event.basePrice,
                duration: event.duration || "",
                process: event.process || "",
                addons: event.addons || []
            });
        } else {
            setEditingEvent(null);
            setFormData({
                name: "",
                description: "",
                basePrice: "",
                duration: "",
                process: "",
                addons: []
            });
        }
        setIsFormOpen(true);
    };

    const handleViewEvent = (event: IEvent) => {
        setViewedEvent(event);
        setIsViewOpen(true);
    };

    const handleAddAddon = () => {
        setFormData({
            ...formData,
            addons: [...formData.addons, { name: "", price: "" }]
        });
    };

    const handleRemoveAddon = (index: number) => {
        setFormData({
            ...formData,
            addons: formData.addons.filter((_, i) => i !== index)
        });
    };

    const handleAddonUpdate = (index: number, field: 'name' | 'price', value: string | number) => {
        const newAddons = [...formData.addons];
        newAddons[index] = { ...newAddons[index], [field]: value };
        setFormData({ ...formData, addons: newAddons });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            basePrice: Number(formData.basePrice),
            addons: formData.addons.map(addon => ({
                ...addon,
                price: Number(addon.price)
            }))
        };

        if (editingEvent) {
            updateEvent(editingEvent._id as unknown as string, payload, () => setIsFormOpen(false));
        } else {
            createEvent(payload, () => setIsFormOpen(false));
        }
    };

    // if (isLoading) return <div className="p-8 text-center text-slate-900 font-medium uppercase tracking-widest">Synchronizing Event Engine...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900" />
                    <Input
                        placeholder="Search configurations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 border-slate-900 focus:ring-blue-500 font-medium text-sm uppercase tracking-tighter"
                        data-test-id="admin-input-event-search"
                    />
                </div>
                <Button
                    onClick={() => handleOpenForm()}
                    className="h-10 px-6 font-bold bg-slate-900 text-white w-full sm:w-auto hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    data-test-id="admin-btn-event-create"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Event Type
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md">
                <Table loading={isLoading}>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-b border-slate-200">
                            <TableHead className="font-medium text-slate-900 text-[11px] uppercase tracking-widest px-6 h-12 text-center w-16">#</TableHead>
                            <TableHead className="font-medium text-slate-900 text-[11px] uppercase tracking-widest px-6 h-12">Event Configuration</TableHead>
                            <TableHead className="font-medium text-slate-900 text-[11px] uppercase tracking-widest px-6 h-12">Value Structure</TableHead>
                            <TableHead className="font-medium text-slate-900 text-[11px] uppercase tracking-widest px-6 h-12">Availability</TableHead>
                            <TableHead className="text-right font-medium text-slate-900 text-[11px] uppercase tracking-widest px-6 h-12">Action Control</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEvents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-900 font-medium uppercase tracking-tighter">No event configurations detected in the registry.</TableCell>
                            </TableRow>
                        ) : filteredEvents.map((event, index) => (
                            <TableRow key={event._id as unknown as string} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-6 py-4 text-center">
                                    <span className="text-[10px] font-medium text-slate-900">{index + 1}</span>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <p className="font-medium text-slate-900 text-sm leading-tight">{event.name}</p>
                                        <p className="text-[11px] text-slate-900 font-medium mt-0.5 line-clamp-1 uppercase tracking-tighter">
                                            {event.description || "No description provided."}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 outline-none">
                                    <div className="flex items-center gap-2">
                                        <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="font-medium text-slate-700 text-sm">{formatPHP(event.basePrice)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge variant={event.isActive ? "secondary" : "outline"} className={`uppercase text-[9px] font-medium tracking-widest px-2 py-0.5 ${event.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-900' : 'text-slate-900 border-slate-900'}`}>
                                        {event.isActive ? 'Online' : 'Draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-slate-900 hover:text-slate-900"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-xl w-48">
                                            <DropdownMenuLabel className="text-[10px] font-medium text-slate-900 uppercase p-3 tracking-widest">Event Control</DropdownMenuLabel>

                                            <DropdownMenuItem
                                                onClick={() => handleOpenForm(event)}
                                                disabled={updatingId === (event._id as unknown as string)}
                                                className="gap-2 cursor-pointer"
                                                data-test-id={`admin-btn-event-edit-${event.name}`}
                                            >
                                                <Edit2 className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-600">Edit Configuration</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => handleViewEvent(event)}
                                                className="gap-2 cursor-pointer"
                                                data-test-id={`admin-btn-event-view-${event.name}`}
                                            >
                                                <Eye className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-600">View Detailed rules</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={() => toggleEventStatus(event._id as unknown as string, event.isActive)}
                                                disabled={updatingId === (event._id as unknown as string)}
                                                className="gap-2 cursor-pointer"
                                                data-test-id={`admin-btn-event-toggle-${event.name}`}
                                            >
                                                <Power className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-900">
                                                    {event.isActive ? "Deactivate Event" : "Activate Event"}
                                                </span>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => deleteEvent(event._id as unknown as string)}
                                                disabled={updatingId === (event._id as unknown as string)}
                                                className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                data-test-id={`admin-btn-event-delete-${event.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="text-sm font-medium">Delete Permanent</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* View Event Modal */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl">
                    {viewedEvent && (
                        <>
                            <div className="bg-slate-900 p-8 text-white">
                                <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 font-medium uppercase tracking-tighter text-[10px]">Registry Profile</Badge>
                                <DialogTitle className="text-3xl font-bold tracking-tight">{viewedEvent.name}</DialogTitle>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-8 font-medium">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Pricing Structure</p>
                                        <p className="text-xl font-bold text-slate-900 leading-none">{formatPHP(viewedEvent.basePrice)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Duration Profile</p>
                                        <p className="text-xl font-bold text-slate-900 leading-none">{viewedEvent.duration || "unspecified"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Description & Scope</p>
                                        <p className="text-sm text-slate-900 leading-relaxed font-medium uppercase tracking-tighter">
                                            {viewedEvent.description || "No internal description available."}
                                        </p>
                                    </div>

                                    {viewedEvent.process && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Internal Process</p>
                                            <p className="text-sm text-slate-900 leading-relaxed font-medium whitespace-pre-wrap uppercase tracking-tighter">
                                                {viewedEvent.process}
                                            </p>
                                        </div>
                                    )}

                                    {viewedEvent.addons && viewedEvent.addons.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Add-on Inventory</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {viewedEvent.addons.map((addon, i) => (
                                                    <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                        <span className="text-[11px] font-medium text-slate-700">{addon.name}</span>
                                                        <span className="text-[11px] font-bold text-blue-600">{formatPHP(addon.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="pt-6">
                                    <Button
                                        onClick={() => setIsViewOpen(false)}
                                        className="w-full h-11 bg-slate-100 text-slate-900 font-medium uppercase tracking-tighter hover:bg-slate-200 border-none transition-all shadow-none"
                                    >
                                        Close Profile
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Event Form Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-xl shadow-2xl border-none h-[90vh] flex flex-col">
                    <div className="bg-slate-900 p-6 shrink-0">
                        <DialogTitle className="text-xl font-bold text-white tracking-tight">
                            {editingEvent ? "Update Event Configuration" : "Initialize New Event"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-900 text-xs font-medium mt-1 uppercase tracking-widest opacity-70">
                            {editingEvent ? "Modify existing event parameters." : "Define a new event profile for the registry."}
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Master Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="h-10 font-bold"
                                        placeholder="e.g. Wedding Package"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Base Rate (PHP)</label>
                                        <Input
                                            type="number"
                                            value={formData.basePrice}
                                            onChange={e => setFormData({ ...formData, basePrice: e.target.value === "" ? "" : Number(e.target.value) })}
                                            required
                                            min="0"
                                            className="h-10 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Duration Profile</label>
                                        <Input
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            className="h-10"
                                            placeholder="e.g. 8 Hours"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Scope Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-24 p-3 rounded-md border border-slate-900 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none uppercase tracking-tighter"
                                        placeholder="Public-facing description..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Internal Process</label>
                                    <textarea
                                        value={formData.process}
                                        onChange={e => setFormData({ ...formData, process: e.target.value })}
                                        className="w-full h-32 p-3 rounded-md border border-slate-900 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none uppercase tracking-tighter"
                                        placeholder="Steps, procedures, etc..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">Add-on Customization</label>
                                    <Button type="button" size="sm" variant="ghost" className="h-6 text-blue-600 font-bold text-[10px] hover:bg-blue-50" onClick={handleAddAddon}>
                                        <Plus className="h-3 w-3 mr-1" /> Add Option
                                    </Button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.addons.length === 0 && (
                                        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                            <p className="text-[10px] font-medium text-slate-900 uppercase">No add-ons defined</p>
                                        </div>
                                    )}
                                    {formData.addons.map((addon, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    placeholder="Addon Name"
                                                    value={addon.name}
                                                    onChange={e => handleAddonUpdate(index, 'name', e.target.value)}
                                                    className="h-8 text-xs font-medium"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={addon.price}
                                                    onChange={e => handleAddonUpdate(index, 'price', e.target.value === "" ? "" : Number(e.target.value))}
                                                    className="h-8 text-xs font-mono"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-900 hover:text-red-500"
                                                onClick={() => handleRemoveAddon(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>

                    <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                        <div className="flex justify-end gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                                className="font-medium text-slate-900 border-slate-900 h-10 px-6 uppercase tracking-widest"
                                disabled={isSubmitting}
                                data-test-id="admin-btn-event-form-cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="font-bold bg-slate-900 text-white h-10 px-6"
                                disabled={isSubmitting}
                                data-test-id="admin-btn-event-form-commit"
                            >
                                {isSubmitting ? "Committing..." : "Commit Profile"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
