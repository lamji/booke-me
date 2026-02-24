import React from "react";
import { ShieldAlert, Zap, BarChart3, Users, Calendar, Settings, LogOut, MessageSquare, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-orange-500/30 selection:text-orange-200">
            {/* Background Blur Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
                            <ShieldAlert className="text-white h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter italic">BOOK.ME <span className="text-orange-500 font-mono text-[10px] align-top not-italic ml-1 tracking-widest uppercase">PROPOSAL</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="/admin"
                            className="px-6 py-2 rounded-full bg-white text-zinc-950 text-sm font-bold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5"
                        >
                            Try Admin Panel
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-20 relative">
                {/* Hero Section */}
                <div className="mb-24 text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        Final Feature Proposal & Architecture
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light">
                        Full-spectrum event management with elite-grade administrative intelligence and real-time infrastructure.
                    </p>
                </div>

                {/* Section 1: Administrative Intelligence */}
                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-12 w-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Zap className="text-orange-500 h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">1. Administrative Intelligence</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 italic-header">
                        <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all duration-500 glassmorphism shadow-2xl">
                            <div className="h-10 w-10 bg-orange-600 rounded-lg mb-6 flex items-center justify-center shadow-lg shadow-orange-900/40 transform group-hover:scale-110 transition-transform">
                                <Zap className="text-white h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">The Tiger: Elite AI Partner</h3>
                            <p className="text-sm leading-relaxed mb-6 text-zinc-400 font-light">
                                A high-performance, humanized AI assistant specialized in administrative operations with direct MongoDB access.
                            </p>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "Read-Only Intelligence: Real-time stat queries",
                                    "Status Orchestration: Approve/Cancel workflows",
                                    "Deep Inspection: Analyze client add-ons & history",
                                    "Zero-Deletion Policy: Hard data integrity rules"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                                        <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-800/20">
                                <p className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-bold mb-2 underline decoration-orange-500/30">User Flow</p>
                                <p className="text-[11px] text-zinc-400 leading-tight">Admin directive → AI parsing → Command emission → Server-side execution → Reported result with focus retention.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500 glassmorphism relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <MessageSquare className="h-24 w-24" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-500" />
                                    Multi-Channel Notifications
                                </h3>
                                <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">
                                    Real-time alerting via Socket.IO broadcasting client-side events directly to the admin terminal.
                                </p>
                                <div className="flex items-center gap-4 text-[10px] font-mono">
                                    <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Live Sync</span>
                                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Zero Refresh</span>
                                </div>
                            </div>

                            <div className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all duration-500 glassmorphism relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Settings className="h-24 w-24" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-purple-500" />
                                    Global Configuration
                                </h3>
                                <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">
                                    Centralized control over business identity and legal transparency (Privacy, Terms, Contact).
                                </p>
                                <div className="flex items-center gap-4 text-[10px] font-mono">
                                    <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Legal Engine</span>
                                    <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Instant Propagate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Operational Dashboard */}
                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <BarChart3 className="text-blue-500 h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">2. Operational Dashboard</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: BarChart3,
                                title: "Analytics Engine",
                                desc: "Visual tiles for Visits, Users, Tasks, and Sentiment (Avg Rating).",
                                color: "blue"
                            },
                            {
                                icon: Users,
                                title: "Registry Snapshot",
                                desc: "Streamlined table of the most recent 5 bookings for rapid triage.",
                                color: "green"
                            },
                            {
                                icon: Calendar,
                                title: "SocMed Export",
                                desc: "Convert schedule to plain-text for Facebook/Viber in one click.",
                                color: "orange"
                            }
                        ].map((card, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:scale-[1.02] transition-transform duration-300 glassmorphism relative overflow-hidden group">
                                <div className={`h-12 w-12 rounded-2xl bg-${card.color}-500/10 flex items-center justify-center mb-6 group-hover:bg-${card.color}-500/20 transition-colors`}>
                                    <card.icon className={`text-${card.color}-500 h-6 w-6`} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed font-light">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 3: Data Management */}
                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <BarChart3 className="text-indigo-500 h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">3. Data Management & Moderation</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Calendar, title: "Bookings Registry", desc: "Full CRUD ledger with advanced multi-status filtering." },
                            { icon: Users, title: "CRM & Leads", desc: "Auto-captures leads from chatbot interactions before booking." },
                            { icon: Settings, title: "Package Manager", desc: "Dynamic pricing and package configuration in real-time." },
                            { icon: MessageSquare, title: "Chat Logs", desc: "Review transcripts of user interactions for business intelligence." },
                            { icon: Mail, title: "Auto-Reminders", desc: "Cron-based follow-ups and automated client notifications." },
                            { icon: Lock, title: "Review Moderation", desc: "Review content and ratings before public display." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <item.icon className="h-5 w-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                                    <p className="text-[11px] text-zinc-500 leading-tight font-light">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Protocol */}
                <section className="mt-40 p-12 rounded-[40px] bg-gradient-to-br from-orange-600/20 to-blue-600/20 border border-white/10 glassmorphism text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-zinc-950/20 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="h-14 w-14 bg-white text-zinc-950 rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight underline decoration-orange-500/40">Security & Integrity Protocol</h2>
                        <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
                            <div>
                                <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-widest font-mono italic">Audit Trails</h4>
                                <p className="text-xs text-zinc-400 font-light leading-relaxed underline">All status updates and administrative emails are logged.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-widest font-mono italic">Immutable Records</h4>
                                <p className="text-xs text-zinc-400 font-light leading-relaxed underline">Core data protected against accidental deletion by AI.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-widest font-mono italic">Validated Logic</h4>
                                <p className="text-xs text-zinc-400 font-light leading-relaxed underline">Commands verified against record states before execution.</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Demo Access Section */}
                <section id="demo" className="mt-32 max-w-4xl mx-auto">
                    <div className="p-1 rounded-[32px] bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 animate-gradient-x">
                        <div className="bg-zinc-950 rounded-[31px] p-10 text-center">
                            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Experience it Live</h2>
                            <p className="text-zinc-400 mb-10 font-light">Use the credentials below to explore the administrative core and interact with **The Tiger**.</p>

                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-mono">Username</p>
                                    <p className="text-xl font-bold text-white font-mono">admin</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-mono">Password</p>
                                    <p className="text-xl font-bold text-white font-mono">admin123</p>
                                </div>
                            </div>

                            <a
                                href="/login"
                                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-orange-600 text-white font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-2xl shadow-orange-900/40 transform hover:-translate-y-1"
                            >
                                <Lock className="h-5 w-5" />
                                Access Control Center
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white tracking-widest uppercase italic">The Tiger</span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest">VERSION 1.0.0 (STABLE)</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">Book.Me Administrative Suite © 2026 :: Secure Core Operating Mode</p>
                </div>
            </footer>

            <style jsx global>{`
                .glassmorphism {
                    backdrop-filter: blur(24px) saturate(180%);
                    -webkit-backdrop-filter: blur(24px) saturate(180%);
                }
                .italic-header h3 {
                    letter-spacing: -0.01em;
                }
            `}</style>
        </div>
    );
}
