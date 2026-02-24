"use client";

import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider — Client-side Session Provider
 *
 * Location: components/Providers/AuthProvider/index.tsx
 */

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
