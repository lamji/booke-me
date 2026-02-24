"use client";

import AdminPresentation from "@/presentations/Admin";
import AdminLayout from "@/presentations/Admin/AdminLayout";
import { AdminProvider } from "@/presentations/Admin/AdminProvider";

export default function AdminPage() {
    return (
        <AdminProvider>
            <AdminLayout>
                <AdminPresentation />
            </AdminLayout>
        </AdminProvider>
    );
}
