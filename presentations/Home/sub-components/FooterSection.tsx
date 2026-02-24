import { useEffect, useState } from "react";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

/**
 * FooterSection — Premium dark footer
 */

const FOOTER_LINKS = {
    Services: ["Weddings", "Band Performances", "Corporate Events", "Birthdays"],
    Company: ["About Us", "Gallery", "Reviews", "Contact"],
    Legal: ["Privacy Policy", "Terms of Service", "Cancellation Policy"],
};

interface SiteSettings {
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    policy?: string;
    termsAndConditions?: string;
    cancellationPolicy?: string;
}

export default function FooterSection() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    const [activeLegal, setActiveLegal] = useState<{ title: string; content: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (err) {
                console.error("[Footer] Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleLegalClick = (e: React.MouseEvent, type: string) => {
        e.preventDefault();
        if (type === "Privacy Policy") {
            setActiveLegal({ title: "Privacy Policy", content: settings?.policy || "" });
        } else if (type === "Terms of Service") {
            setActiveLegal({ title: "Terms of Service", content: settings?.termsAndConditions || "" });
        } else if (type === "Cancellation Policy") {
            setActiveLegal({ title: "Cancellation Policy", content: settings?.cancellationPolicy || "" });
        } else {
            toast.info(`${type} is not yet configured.`);
        }
    };

    const contactEmail = settings?.contactEmail || "hello@bookme.events";
    const contactPhone = settings?.contactPhone || "+63 912 345 6789";
    const address = settings?.address || "Manila, Philippines";
    return (
        <footer id="footer" className="bg-zinc-950 text-white pt-16 pb-8 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-3">
                            book
                            <span className="text-amber-500">.me</span>
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                            Premium event booking and management for life&apos;s most
                            important moments.
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-zinc-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-amber-500" />
                                {address}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-amber-500" />
                                {contactPhone}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-amber-500" />
                                {contactEmail}
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4">
                                {category}
                            </h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href={
                                                category === "Services" ? "#about" :
                                                    link === "About Us" ? "#about" :
                                                        link === "Gallery" ? "#gallery" :
                                                            link === "Reviews" ? "#reviews" :
                                                                link === "Contact" ? "#footer" :
                                                                    "#"
                                            }
                                            onClick={(e) => category === "Legal" ? handleLegalClick(e, link) : null}
                                            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="bg-zinc-800 mb-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <p>
                        © {new Date().getFullYear()} book.me — All rights reserved.
                    </p>
                    <p className="flex items-center gap-1">
                        Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" />{" "}
                        in the Philippines
                    </p>
                </div>
            </div>

            {/* Legal Content Modal */}
            {activeLegal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                            <h3 className="text-xl font-bold text-white">
                                {activeLegal.title}
                            </h3>
                            <button
                                onClick={() => setActiveLegal(null)}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {activeLegal.content || "No content available yet."}
                        </div>
                        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
                            <button
                                onClick={() => setActiveLegal(null)}
                                className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
}
