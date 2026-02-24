"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import api from "@/lib/axios";

/**
 * useChat — ViewModel for Booky AI Chatbot
 *
 * Manages conversation history, loading state, and API communication.
 * Follows MVVM: no JSX here, purely logic.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi there! 👋 I'm **Booky**, your Book.Me event assistant. I can help you with event packages, pricing, availability, and how to book. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"general" | "availability">("general");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Initialize unique session ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("booky_session_id");
      if (!id) {
        id = `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
        localStorage.setItem("booky_session_id", id);
      }
      sessionIdRef.current = id;
    }
  }, []);

  // Ensure input stays focused after loading finishes
  useEffect(() => {
    if (!isLoading && isOpen) {
      inputRef.current?.focus();
    }
  }, [isLoading, isOpen]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Detect if user is asking about availability
    const isAvailabilityQuery = /availab|book.*date|date.*availab|can i book|is.*free|open slot/i.test(text);
    setLoadingType(isAvailabilityQuery ? "availability" : "general");

    // Detect if user is asking about availability and extract date
    // Handles: 2026-05-10, May 10, May 10, 2026, etc.
    const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2}|\w+ \d{1,2}(?:,? \d{4})?)\b/i);

    let checkDate: string | undefined;
    if (isAvailabilityQuery && dateMatch) {
      try {
        checkDate = new Date(dateMatch[0]).toISOString().split("T")[0];
      } catch {
        checkDate = undefined;
      }
    }

    try {
      const payload = {
        sessionId: sessionIdRef.current,
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        ...(checkDate ? { checkDate } : {}),
      };

      const res = await api.post("/api/chat", payload);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: res.data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or contact us directly.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  return {
    messages,
    input, setInput,
    isLoading,
    loadingType,
    isOpen,
    openChat,
    closeChat,
    send,
    handleKeyDown,
    inputRef,
  };
}

export default useChat;
