"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Bot } from "lucide-react";
import { useChat } from "./useChat";


/**
 * ChatBot — Booky AI assistant floating widget
 *
 * - Floating button bottom-right
 * - Desktop: compact chat panel (400px wide)
 * - Mobile: full-screen overlay
 * - Mobile keyboard: input sticks above keyboard using env(keyboard-inset-height) / safe-area approach
 */

export default function ChatBot() {
    const {
        messages,
        input,
        setInput,
        isLoading,
        isOpen,
        openChat,
        closeChat,
        send,
        handleKeyDown,
        inputRef,
    } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <>
            {/* ── Floating Trigger Button ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={openChat}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-200"
                        aria-label="Open Booky chat assistant"
                        id="booky-open-btn"
                    >
                        <Bot className="h-5 w-5" />
                        <span className="text-sm font-semibold hidden sm:inline">Ask Booky</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Chat Panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden"
                            onClick={closeChat}
                        />

                        {/* Chat window */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={[
                                // Mobile: full screen overlay
                                "fixed inset-0 z-50 flex flex-col bg-white",
                                // Desktop: compact panel bottom-right
                                "sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[580px] sm:rounded-2xl sm:border sm:border-border/40 sm:shadow-2xl",
                            ].join(" ")}
                            style={{
                                // Mobile: account for browser chrome + virtual keyboard
                                // paddingBottom respects the keyboard-inset-height env variable on supported browsers
                                paddingBottom: "env(keyboard-inset-height, 0px)",
                            }}
                        >
                            {/* ── Header ── */}
                            <div className="flex items-center gap-3 border-b border-border/20 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 sm:rounded-t-2xl">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white">Booky</p>
                                    <p className="text-xs text-white/80">Book.Me Event Assistant</p>
                                </div>
                                <button
                                    onClick={closeChat}
                                    className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                                    aria-label="Close chat"
                                    id="booky-close-btn"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* ── Messages ── */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/60">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="mr-2 mt-1 flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                                                <Bot className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={[
                                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                                                msg.role === "user"
                                                    ? "rounded-tr-sm bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                                                    : "rounded-tl-sm bg-white text-gray-800 border border-gray-100",
                                            ].join(" ")}
                                        >
                                            {/* Simple markdown: bold (**) and line breaks */}
                                            {formatMessage(msg.content)}
                                        </div>
                                    </div>
                                ))}

                                {/* Typing indicator */}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="mr-2 flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                                            <Bot className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm px-4 py-3">
                                            <div className="flex gap-1.5 items-center">
                                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0ms]" />
                                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce [animation-delay:150ms]" />
                                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce [animation-delay:300ms]" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* ── Quick Prompts ── */}
                            {messages.length === 1 && (
                                <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-gray-100 bg-white">
                                    {QUICK_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => {
                                                setInput(prompt);
                                                setTimeout(() => inputRef.current?.focus(), 50);
                                            }}
                                            className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-orange-700 hover:bg-orange-100 transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── Input ── */}
                            <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:rounded-b-2xl safe-area-bottom">
                                <input
                                    ref={inputRef}
                                    id="booky-input"
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Booky anything..."
                                    disabled={isLoading}
                                    className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all disabled:opacity-60"
                                />
                                <button
                                    onClick={send}
                                    disabled={isLoading || !input.trim()}
                                    id="booky-send-btn"
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
                                    aria-label="Send message"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// ── Quick prompt suggestions shown before first user message ──
const QUICK_PROMPTS = [
    "What events do you offer?",
    "What are your prices?",
    "How do I book?",
    "Check availability",
];



function formatMessage(content: string) {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                // Render newlines as <br>
                return part.split("\n").map((line, j, arr) => (
                    <span key={`${i}-${j}`}>
                        {line}
                        {j < arr.length - 1 && <br />}
                    </span>
                ));
            })}
        </span>
    );
}
