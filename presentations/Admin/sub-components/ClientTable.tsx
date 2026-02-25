import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Send } from "lucide-react";
import { format } from "date-fns";
import type { IClientDocument } from "@/lib/models/Client";


interface ClientTableProps {
    data: IClientDocument[];
    onFollowUp: (client: IClientDocument) => void;
    loading?: boolean;
}

export function ClientTable({ data, onFollowUp, loading }: ClientTableProps) {
    return (
        <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <Table loading={loading}>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="h-12 text-[11px] font-medium text-slate-900 uppercase tracking-widest px-6">Client</TableHead>
                        <TableHead className="h-12 text-[11px] font-medium text-slate-900 uppercase tracking-widest px-6">Type</TableHead>
                        <TableHead className="h-12 text-[11px] font-medium text-slate-900 uppercase tracking-widest px-6">Contact</TableHead>
                        <TableHead className="h-12 text-[11px] font-medium text-slate-900 uppercase tracking-widest px-6">Last Activity</TableHead>
                        <TableHead className="h-12 text-[11px] font-medium text-slate-900 uppercase tracking-widest px-6 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((client) => (
                            <TableRow key={client.email} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-all">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-slate-900">{client.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge
                                        variant={client.type === "existing" ? "default" : "secondary"}
                                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-none ${client.type === "existing"
                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                            }`}
                                    >
                                        {client.type === "existing" ? "Client" : "Potential"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-900 font-medium">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                            {client.email}
                                        </div>
                                        {client.phone && (
                                            <div className="flex items-center gap-2 text-[10px] text-slate-900 font-medium">
                                                <Phone className="h-3 w-3 text-slate-400" />
                                                {client.phone}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-[11px] text-slate-900 font-medium uppercase tracking-tighter">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            Active {format(new Date(client.updatedAt), "dd MMM yyyy")}
                                        </div>
                                        {client.lastFollowedUpAt && (
                                            <div className="text-blue-600 text-[10px]">
                                                Followed up: {format(new Date(client.lastFollowedUpAt), "dd MMM HH:mm")}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {client.type === "potential" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onFollowUp(client)}
                                                className="h-8 gap-2 text-[10px] font-medium uppercase tracking-tighter border-slate-200 text-slate-900 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                            >
                                                <Send className="h-3 w-3" />
                                                Follow Up
                                            </Button>
                                        )}

                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-slate-900 text-sm uppercase tracking-tighter font-medium">
                                No clients found in database.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
