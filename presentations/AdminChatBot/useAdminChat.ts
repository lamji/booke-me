"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import api from "@/lib/axios";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useAdminChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "**The Tiger** online. Awaiting administrative directives. I have full access to the system. How can I assist with operations today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input whenever the chat is opened or when loading finishes
  useEffect(() => {
    if (isOpen && !isLoading) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading]);

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

    try {
      const payload = {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      // Ensure we hit the admin chat endpoint
      const res = await api.post("/api/admin/chat", payload);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: res.data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      let errorMsg = "Operational error. Unable to reach the administrative core.";
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response?: { status?: number } }).response;
        if (resp?.status === 401) {
          errorMsg = "Access Denied. Admin session expired or invalid.";
        }
      }
        
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ **${errorMsg}**`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      // Immediate focus after response
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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
    isOpen,
    toggleChat,
    send,
    handleKeyDown,
    inputRef,
  };
}

export default useAdminChat;
