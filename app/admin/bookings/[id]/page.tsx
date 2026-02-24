import { Suspense } from "react";
import AdminBookingDetailClient from "./AdminBookingDetailClient";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string; exp?: string }>;
}

export default async function AdminBookingDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { token, exp } = await searchParams;

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Loading Record...</p>
                </div>
            </div>
        }>
            <AdminBookingDetailClient id={id} token={token} exp={exp} />
        </Suspense>
    );
}
