"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

/**
 * useSocket Hook
 *
 * Global reusable hook for Socket.IO client connections.
 * Location: lib/hooks/ (per project-structure.md)
 *
 * Usage:
 *   const { socket, emit } = useSocket();
 *   useEffect(() => { socket?.on("event", handler) }, [socket]);
 */

let globalSocket: Socket | null = null;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(globalSocket);

  useEffect(() => {
    if (globalSocket) return;

    // Initialize socket connection
    fetch("/api/socketio").finally(() => {
      if (globalSocket) return;

      globalSocket = io({
        path: "/api/socketio",
        addTrailingSlash: false,
      });

      globalSocket.on("connect", () => {
        console.log("[Socket] Connected:", globalSocket?.id);
        setSocket(globalSocket);
      });

      globalSocket.on("disconnect", () => {
        console.log("[Socket] Disconnected");
      });

      setSocket(globalSocket);
    });
  }, []);

  const emit = useCallback(
    (event: string, data?: unknown) => {
      globalSocket?.emit(event, data);
    },
    []
  );

  return {
    socket,
    emit,
  };
}

export default useSocket;
