"use client";

import React from "react";
import {
    Star,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    User,
    Calendar,
} from "lucide-react";
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
import { IReview } from "@/types/booking";

const STATUS_CONFIG = {
    pending: { color: "bg-yellow-400", label: "Pending" },
    approved: { color: "bg-emerald-500", label: "Approved" },
    rejected: { color: "bg-red-500", label: "Rejected" },
};

interface ReviewTableProps {
    data: IReview[];
    onUpdateStatus: (id: string, status: "approved" | "rejected") => void;
}

export function ReviewTable({ data, onUpdateStatus }: ReviewTableProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-200 hover:bg-transparent">
                        <TableHead className="w-[200px] text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Client</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 text-center">Rating</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Comment</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 text-center">Status</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs font-medium italic">
                                No reviews found in the registry.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((review) => (
                            <TableRow key={review._id} className="border-slate-100 hover:bg-slate-50/30 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 font-bold text-sm flex items-center gap-2">
                                            <User className="h-3 w-3 text-slate-300" />
                                            {review.clientName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter flex items-center gap-1">
                                            <Calendar className="h-2 w-2" />
                                            {review.eventType}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"}`}
                                            />
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-xs text-slate-600 font-medium line-clamp-2 max-w-md">
                                        &ldquo;{review.comment}&rdquo;
                                    </p>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <div className={`px-2 py-0.5 rounded-full ${STATUS_CONFIG[review.status].color} bg-opacity-10 flex items-center gap-1.5`}>
                                            <div className={`h-1 w-1 rounded-full ${STATUS_CONFIG[review.status].color}`} />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${STATUS_CONFIG[review.status].color.replace('bg-', 'text-')}`}>
                                                {STATUS_CONFIG[review.status].label}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase p-3">Moderation Control</DropdownMenuLabel>
                                            <DropdownMenuSeparator />

                                            {review.status !== "approved" && (
                                                <DropdownMenuItem
                                                    onClick={() => onUpdateStatus(review._id, "approved")}
                                                    className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Approve Review</span>
                                                </DropdownMenuItem>
                                            )}

                                            {review.status !== "rejected" && (
                                                <DropdownMenuItem
                                                    onClick={() => onUpdateStatus(review._id, "rejected")}
                                                    className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Reject Review</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
