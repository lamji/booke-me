"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "./button";
import { FindBookingModal } from "./FindBookingModal";

import { usePathname } from "next/navigation";

export function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pathname = usePathname();

    // Hide header in admin routes
    if (pathname?.startsWith("/admin")) return null;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 h-20 flex items-center justify-between border-b border-white/5 bg-black transition-all duration-300">
                <div className="flex items-center gap-2">
                    {/* Logo / Brand */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                            <span className="font-bold text-black text-xl leading-none tracking-tighter">B</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white/90 group-hover:text-white transition-colors">
                            BOOK<span className="text-amber-500">.ME</span>
                        </span>
                    </Link>
                </div>

                {/* Right Nav */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/5 transition-colors gap-2 rounded-full px-4"
                        onClick={() => setIsModalOpen(true)}
                        data-test-id="header-btn-find-booking"
                    >
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline">Find Booking</span>
                    </Button>
                </div>
            </header>

            {/* Spacer to prevent content from going under the fixed header */}
            <div className="h-20" />

            <FindBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
