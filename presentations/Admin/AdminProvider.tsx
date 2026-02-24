"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAdmin } from "./useAdmin";

export type AdminView = "DASHBOARD" | "BOOKINGS" | "CLIENTS" | "EVENTS" | "NOTIFICATIONS" | "CHATS" | "REVIEWS";

interface AdminContextType extends ReturnType<typeof useAdmin> {
    currentView: AdminView;
    setCurrentView: (view: AdminView) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const adminData = useAdmin();
    const [currentView, setCurrentView] = useState<AdminView>("DASHBOARD");

    return (
        <AdminContext.Provider value={{ ...adminData, currentView, setCurrentView }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdminContext() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdminContext must be used within an AdminProvider");
    }
    return context;
}
