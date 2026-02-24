"use client";

import React from "react";
import { Send, X, Terminal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminChat } from "./useAdminChat";

/**
 * AdminChatBot — "The Tiger"
 * 
 * Specialized AI assistant for administrators.
 * Features a sharper, more industrial design compared to the user-facing Booky.
 */
export const AdminChatBot = () => {
    const {
        messages,
        input,
        setInput,
        isLoading,
        isOpen,
        toggleChat,
        send,
        handleKeyDown,
        inputRef,
    } = useAdminChat();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom whenever messages change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages, isLoading]);

    // Custom formatter for bold and newlines
    const formatMessage = (content: string) => {
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        return (
            <span>
                {parts.map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i} className="text-orange-400">{part.slice(2, -2)}</strong>;
                    }
                    return part.split("\n").map((line, j, arr) => (
                        <span key={`${i}-${j}`}>
                            {line}
                            {j < arr.length - 1 && <br />}
                        </span>
                    ));
                })}
            </span>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            {/* Toggle Button */}
            <Button
                onClick={toggleChat}
                className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 transform ${isOpen ? "rotate-90 bg-orange-600 hover:bg-orange-700" : "bg-zinc-900 border-2 border-orange-500 hover:bg-zinc-800"
                    }`}
                id="tiger-toggle-btn"
            >
                {isOpen ? <X className="h-6 w-6 text-white" /> : <Terminal className="h-6 w-6 text-orange-500" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[400px] h-[550px] bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-600/20 p-1.5 rounded border border-orange-600/30">
                                <ShieldAlert className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-100 tracking-tighter uppercase">THE TIGER</h3>
                                <p className="text-[10px] text-zinc-500 font-mono tracking-widest">ADMIN OPS MODE :: v1.0</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-zinc-500 font-mono">SECURE</span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 bg-zinc-950">
                        <div className="space-y-4">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm ${m.role === "user"
                                            ? "bg-zinc-800 border border-orange-600/30 text-white rounded-tr-none shadow-orange-900/10 shadow-lg"
                                            : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none font-sans"
                                            }`}
                                    >
                                        <div className="leading-relaxed">
                                            {formatMessage(m.content)}
                                        </div>
                                        <p className="text-[9px] mt-1.5 opacity-40 font-mono">
                                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-lg flex gap-1 items-center">
                                        <span className="h-1 w-1 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="h-1 w-1 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="h-1 w-1 bg-orange-600 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-px w-full" />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                        <div className="flex gap-2 relative">
                            <Input
                                ref={inputRef}
                                id="tiger-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter operational directive..."
                                className="bg-zinc-950 border-zinc-800 text-zinc-200 focus-visible:ring-orange-500 placeholder:text-zinc-600 text-xs font-mono"
                                disabled={isLoading}
                            />
                            <Button
                                id="tiger-send-btn"
                                size="icon"
                                onClick={send}
                                disabled={isLoading || !input.trim()}
                                className="bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-lg shadow-orange-900/20"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminChatBot;
