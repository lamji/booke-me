"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    ArrowUpDown,
    CircleCheck,
    CircleX,
    Eye,
    Copy,
    User,
    FileDown,
    Filter,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { format } from "date-fns";
import type { IBooking, EventType } from "@/types/booking";
import { EVENT_TYPE_LABELS } from "@/types/booking";
import { BookingViewModal } from "./BookingViewModal";
import { useAdminContext } from "../AdminProvider";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_CONFIG = {
    pending: { color: "bg-yellow-400", label: "Pending" },
    approved: { color: "bg-green-500", label: "Completed" },
    canceled: { color: "bg-red-500", label: "Canceled" },
};

interface BookingTableProps {
    data: IBooking[];
    onUpdateStatus: (id: string, status: "approved" | "canceled") => void;
    updatingId: string | null;
    hidePagination?: boolean;
}

export function BookingTable({ data, onUpdateStatus, updatingId, hidePagination = false }: BookingTableProps) {
    "use no memo";
    const {
        filter, setFilter,
        eventTypeFilter, setEventTypeFilter,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        page, setPage,
        totalPages, totalItems,
        events
    } = useAdminContext();

    const [viewedBooking, setViewedBooking] = React.useState<IBooking | null>(null);

    // Helper to get event name (handles dynamic events)
    const getEventName = React.useCallback((type: string) => {
        const event = events.find(e => e.name === type || String(e._id) === type);
        return event ? event.name : (EVENT_TYPE_LABELS[type as EventType] || type);
    }, [events]);

    // Export Logic
    const exportToExcel = React.useCallback(() => {
        const worksheet = XLSX.utils.json_to_sheet(data.map(b => ({
            ID: b._id,
            Event: getEventName(b.eventType),
            Client: b.clientName,
            Email: b.clientEmail,
            Phone: b.clientPhone,
            Date: format(new Date(b.eventDate), "PPP"),
            Time: b.eventTime,
            Status: b.status.toUpperCase(),
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
        XLSX.writeFile(workbook, `Bookings_Export_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    }, [data, getEventName]);

    const exportToPDF = React.useCallback(() => {
        const doc = new jsPDF();
        const tableColumn = ["Event", "Client", "Date", "Status"];
        const tableRows = data.map(b => [
            getEventName(b.eventType),
            b.clientName,
            format(new Date(b.eventDate), "MMM dd, yyyy"),
            b.status.toUpperCase()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        });
        doc.text("Bookings Registry Report", 14, 15);
        doc.save(`Bookings_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    }, [data, getEventName]);

    const handleSort = React.useCallback((key: string) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("desc");
        }
    }, [sortBy, sortOrder, setSortBy, setSortOrder]);

    const columns = React.useMemo<ColumnDef<IBooking>[]>(() => [
        {
            accessorKey: "_id",
            header: "#",
            cell: ({ row }) => <span className="text-slate-900 text-[10px] font-medium">{(page - 1) * 10 + row.index + 1}</span>,
        },
        {
            accessorKey: "eventType",
            header: () => (
                <button
                    onClick={() => handleSort("eventType")}
                    className="flex items-center gap-2 hover:text-slate-900 transition-colors uppercase"
                >
                    Event
                    {sortBy === "eventType" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-900" />
                    )}
                </button>
            ),
            cell: ({ row }) => (
                <span className="font-medium text-slate-800 text-sm">
                    {getEventName(row.original.eventType)}
                </span>
            ),
        },
        {
            accessorKey: "clientName",
            header: "Assigned To",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 leading-none">{row.original.clientName}</span>
                        <span className="text-[10px] text-slate-900 font-medium uppercase mt-0.5">{row.original.clientEmail}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: () => (
                <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-2 hover:text-slate-900 transition-colors uppercase"
                >
                    Status
                    {sortBy === "status" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-300" />
                    )}
                </button>
            ),
            cell: ({ row }) => {
                const config = STATUS_CONFIG[row.original.status as keyof typeof STATUS_CONFIG] || { color: "bg-slate-300", label: row.original.status };
                return (
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${config.color}`} />
                        <span className="text-[10px] font-medium text-slate-700 uppercase tracking-tighter">{config.label}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "eventDate",
            header: () => (
                <button
                    onClick={() => handleSort("eventDate")}
                    className="flex items-center gap-2 hover:text-slate-900 transition-colors uppercase"
                >
                    Due Date
                    {sortBy === "eventDate" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-300" />
                    )}
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-slate-900 font-medium text-[11px] uppercase tracking-tighter">
                    {format(new Date(row.original.eventDate), "dd MMM yyyy")}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const booking = row.original;
                const isPending = booking.status === "pending";

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-900 hover:text-slate-900"
                                data-test-id="admin-btn-more-actions"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-xl w-48">
                            <DropdownMenuLabel className="text-[10px] font-medium text-slate-400 uppercase p-3">Row Control</DropdownMenuLabel>

                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(booking._id)}
                                className="gap-2 cursor-pointer"
                            >
                                <Copy className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">Copy Master ID</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => setViewedBooking(booking)}
                                className="gap-2 cursor-pointer"
                            >
                                <Eye className="h-4 w-4 text-slate-900" />
                                <span className="text-sm font-medium text-slate-900">View Detailed Profile</span>
                            </DropdownMenuItem>

                            {isPending && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onUpdateStatus(booking._id, "approved")}
                                        disabled={updatingId === booking._id}
                                        className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                        data-test-id={`admin-btn-approve-${booking._id}`}
                                    >
                                        <CircleCheck className="h-4 w-4" />
                                        <span className="text-sm font-medium">Approve Request</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onUpdateStatus(booking._id, "canceled")}
                                        disabled={updatingId === booking._id}
                                        className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                        data-test-id={`admin-btn-cancel-${booking._id}`}
                                    >
                                        <CircleX className="h-4 w-4" />
                                        <span className="text-sm font-medium">Decline Request</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [page, sortBy, sortOrder, handleSort, getEventName, onUpdateStatus, updatingId]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Table Controls (Filtering & Export) */}
            {!hidePagination && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Filter className="h-3.5 w-3.5 text-slate-900" />
                            <span className="text-xs font-medium text-slate-900 uppercase tracking-tighter">FILTERS</span>
                        </div>

                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-xs font-medium border-slate-200 focus:ring-0 focus:border-slate-400 transition-all uppercase tracking-tighter" data-test-id="admin-filter-status">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="border-none shadow-2xl bg-white">
                                <SelectItem value="all" className="text-xs font-medium uppercase tracking-tighter" data-test-id="admin-filter-status-all">All Status</SelectItem>
                                <SelectItem value="pending" className="text-xs font-medium uppercase tracking-tighter" data-test-id="admin-filter-status-pending">Pending</SelectItem>
                                <SelectItem value="approved" className="text-xs font-medium uppercase tracking-tighter" data-test-id="admin-filter-status-approved">Completed</SelectItem>
                                <SelectItem value="canceled" className="text-xs font-medium uppercase tracking-tighter" data-test-id="admin-filter-status-canceled">Canceled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                            <SelectTrigger className="w-[150px] h-9 text-xs font-medium border-slate-200 focus:ring-0 focus:border-slate-400 transition-all uppercase tracking-tighter" data-test-id="admin-filter-event">
                                <SelectValue placeholder="Event Type" />
                            </SelectTrigger>
                            <SelectContent className="border-none shadow-2xl bg-white">
                                <SelectItem value="all" className="text-xs font-medium uppercase tracking-tighter" data-test-id="admin-filter-event-all">All Events</SelectItem>
                                {events.map((e) => (
                                    <SelectItem key={String(e._id)} value={e.name} className="text-xs font-medium uppercase tracking-tighter" data-test-id={`admin-filter-event-${e.name}`}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToExcel}
                            className="h-9 gap-2 text-[10px] font-medium uppercase tracking-tighter text-slate-900 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                            data-test-id="admin-btn-export-excel"
                        >
                            <FileDown className="h-3.5 w-3.5 text-slate-900" />
                            Export Excel
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={exportToPDF}
                            className="h-9 gap-2 text-[10px] font-medium uppercase tracking-tighter bg-primary text-white border-none hover:bg-primary/90 transition-all shadow-none"
                            data-test-id="admin-btn-export-pdf"
                        >
                            <FileDown className="h-3.5 w-3.5 text-white" />
                            Export PDF
                        </Button>
                    </div>
                </div>
            )}

            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-none overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-12 text-[11px] font-medium text-slate-900 uppercase tracking-widest px-6 whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-all"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-slate-900 font-medium text-sm uppercase tracking-tighter">
                                    No records matching strict filters found in registry
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {!hidePagination && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-200">
                        <div className="text-[10px] text-slate-900 font-medium uppercase tracking-widest">
                            Found <span className="text-slate-900 font-medium">{totalItems}</span> total entries in database
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-md border-slate-200 text-slate-500 text-[10px] font-medium uppercase tracking-widest disabled:opacity-30"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                data-test-id="admin-btn-pagination-prev"
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1.5">
                                <div className="h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
                                    {page}
                                </div>
                                <span className="text-[10px] font-medium text-slate-900 uppercase italic">of {totalPages}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-md border-slate-200 text-slate-900 text-[10px] font-medium uppercase tracking-widest disabled:opacity-30"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages}
                                data-test-id="admin-btn-pagination-next"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <BookingViewModal
                booking={viewedBooking}
                isOpen={!!viewedBooking}
                onClose={() => setViewedBooking(null)}
                onUpdateStatus={onUpdateStatus}
                updatingId={updatingId}
            />
        </div>
    );
}
