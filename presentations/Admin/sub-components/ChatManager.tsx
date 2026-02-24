"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    MessageSquare,
    Calendar,
    Clock,
    ChevronRight,
    Search,
    Bot,
    User,
    MoreVertical,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/lib/hooks/useSocket";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
}

interface Conversation {
    _id: string;
    sessionId: string;
    clientInfo?: {
        name?: string;
        email?: string;
    };
    messages: Message[];
    lastMessageAt: string;
    status: string;
}

export function ChatManager() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { socket } = useSocket();

    const fetchConversations = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/api/conversations");
            setConversations(res.data.conversations);

            // If the selected chat is currently open, update it to seamlessly show new messages/lead data
            setSelectedChat(prev => {
                if (!prev) return prev;
                const updated = res.data.conversations.find((c: Conversation) => c.sessionId === prev.sessionId);
                return updated || prev;
            });
        } catch (error) {
            console.error("[Admin] Failed to fetch chats:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Real-time Socket.IO Listeners for Active Sessions
    useEffect(() => {
        if (!socket) return;

        socket.emit("join-admin"); // Ensure we are indeed in the admin room to receive events

        const onChatUpdated = (chatData: unknown) => {
            console.log("[Admin] Chat updated via socket:", chatData);
            fetchConversations();
        };

        socket.on("chat-updated", onChatUpdated);

        return () => {
            socket.off("chat-updated", onChatUpdated);
        };
    }, [socket, fetchConversations]);

    const filteredChats = conversations.filter(chat =>
        chat.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.clientInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-160px)] gap-6 animate-in fade-in duration-700">
            {/* ── Chat Sidebar (Table List) ── */}
            <div className={`flex-col bg-white rounded-xl border border-border shadow-sm overflow-hidden min-w-0 ${selectedChat ? 'hidden lg:flex lg:flex-1' : 'flex flex-1'}`}>
                <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat History
                    </h2>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {conversations.length} Sessions
                    </Badge>
                </div>

                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search session or client..."
                            className="pl-9 bg-slate-50 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-w-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400 text-sm italic uppercase tracking-widest">
                            Synchronizing records...
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm italic uppercase tracking-widest">
                            No sessions recorded.
                        </div>
                    ) : (
                        filteredChats.map((chat) => (
                            <button
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                className={`w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${selectedChat?._id === chat._id ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {chat.clientInfo?.name || chat.sessionId.split('_')[1] || "Anonymous"}
                                        </p>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {format(new Date(chat.lastMessageAt), "HH:mm")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300" />
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ── Messenger View (Detailed Conversation) ── */}
            <div className={`flex-1 bg-white rounded-xl border border-border shadow-sm flex flex-col min-w-0 ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                {!selectedChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <MessageSquare className="h-10 w-10" />
                        </div>
                        <p className="text-sm font-medium uppercase tracking-widest italic">Select a session to view conversation</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    onClick={() => setSelectedChat(null)}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {selectedChat.clientInfo?.name || "Session Record"}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-tighter">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(selectedChat.lastMessageAt), "MMM dd, yyyy")}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(selectedChat.lastMessageAt), "HH:mm")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        {/* Bubble Stream */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                            {selectedChat.messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto mb-1 ${msg.role === 'user' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'
                                            }`}>
                                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>

                                        <div className="space-y-1">
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap break-words ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <p className={`text-[9px] text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                {format(new Date(msg.timestamp), "HH:mm")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer / Read-only note */}
                        <div className="p-4 border-t border-slate-100 bg-white text-center">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                                Conversation Archived Session Control
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
