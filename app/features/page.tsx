"use client";

import React from "react";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 p-8 sm:p-20">
            <article className="max-w-4xl mx-auto space-y-12">
                {/* Proposal Header */}
                <header className="border-b-2 border-slate-900 pb-10">
                    <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-4">Book.Me — Final Feature Proposal & System Architecture</h1>
                    <p className="text-lg font-medium text-slate-500">
                        This document outlines the complete feature set of the Book.Me Event Booking Management System, including operational flows and administrative capabilities.
                    </p>
                </header>

                <section className="space-y-10">
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">1. Administrative Core & Intelligence</h2>

                        <div className="space-y-6 ml-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">1.1 The Tiger: Elite AI Business Partner</h3>
                                <p className="mb-3">A high-performance, humanized AI assistant specialized in administrative operations.</p>
                                <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                    <li><strong>Explanation</strong>: The Tiger has direct &quot;Search &amp; Destroy&quot; access to the MongoDB collections. It can parse complex requests about bookings, clients, and revenue without requiring manual menu navigation.</li>
                                    <li><strong>Capabilities</strong>:
                                        <ul className="list-circle ml-8 mt-2 space-y-1">
                                            <li><strong>Read-Only Intelligence</strong>: Query status (e.g., &quot;Any pending bookings for next week?&quot;)</li>
                                            <li><strong>Status Orchestration</strong>: Execute state changes (e.g., &quot;Approve booking BKG-123&quot;)</li>
                                            <li><strong>Deep Inspection</strong>: Inspect details (e.g., &quot;Does Jick have add-ons for his wedding?&quot;)</li>
                                            <li><strong>Client Outreach</strong>: Send manual emails directly from the chat interface.</li>
                                            <li><strong>Lead Conversion</strong>: Extract potential client data from chat transcripts and automatically create lead records.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Security Guardrails</strong>:
                                        <ul className="list-circle ml-8 mt-2 space-y-1">
                                            <li><strong>Zero-Deletion Policy</strong>: Strictly forbidden from deleting any records from the database.</li>
                                            <li><strong>Restricted Modification</strong>: Cannot edit client profiles, prices, or configuration directly. Modifications are restricted to authorized <strong>UPDATE_STATUS</strong> workflows only.</li>
                                        </ul>
                                    </li>
                                    <li><strong>User Flow</strong>:
                                        <ol className="list-decimal ml-8 mt-2 space-y-1">
                                            <li>Admin opens the Tiger UI (terminal icon).</li>
                                            <li>Inputs a directive in natural language.</li>
                                            <li>Tiger executes server-side logic and reports result with automated focus-retention.</li>
                                        </ol>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">1.2 Multi-Channel Notification System</h3>
                                <p className="mb-3">Real-time alerting for all critical business events.</p>
                                <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                    <li><strong>Explanation</strong>: Uses Socket.IO to broadcast events instantly from the client-facing site to the administrative panel.</li>
                                    <li><strong>Flow</strong>:
                                        <ol className="list-decimal ml-8 mt-2 space-y-1">
                                            <li>A lead or booking is captured on the public site.</li>
                                            <li>Server emits a socket event.</li>
                                            <li>Admin Header displays a live-badge count update.</li>
                                            <li>Admin opens the notification dropdown or full list to resolve (Approve/View/Dismiss).</li>
                                        </ol>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">1.3 Global System Configuration (Settings)</h3>
                                <p className="mb-3">Centralized control over the business identity and legal transparency.</p>
                                <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                    <li><strong>Explanation</strong>: A dedicated module to manage public-facing contact data and legal requirements.</li>
                                    <li><strong>Flow</strong>:
                                        <ol className="list-decimal ml-8 mt-2 space-y-1">
                                            <li>Admin enters the Settings modal via the Header gear icon.</li>
                                            <li>Modifies business details (Phone, Email, Address) or Legal text (Privacy Policy, Terms).</li>
                                            <li>On Save, the system updates the global settings collection and syncs changes to the public footer instantly.</li>
                                        </ol>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">1.4 Secure Session Management</h3>
                                <p className="mb-3">NextAuth-powered security layer.</p>
                                <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                    <li><strong>Explanation</strong>: Role-based access control ensuring only authorized administrators can reach the /admin route.</li>
                                    <li><strong>Flow</strong>:
                                        <ol className="list-decimal ml-8 mt-2 space-y-1">
                                            <li>User clicks &quot;Sign Out&quot; in the sidebar or header.</li>
                                            <li>System invalidates the JWT/Session cookie.</li>
                                            <li>Browser is immediately redirected to the root homepage, locking out the administrative views.</li>
                                        </ol>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">2. Operational Dashboard</h2>

                        <div className="space-y-6 ml-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">2.1 Unified Analytics Engine</h3>
                                <p className="mb-3">Higher-level business health monitoring.</p>
                                <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                    <li><strong>Explanation</strong>: Visual tiles displaying Real-time Visits, Unique Users, Pending Tasks count, and Public Sentiment (Average Rating).</li>
                                    <li><strong>Flow</strong>:
                                        <ol className="list-decimal ml-8 mt-2 space-y-1">
                                            <li>Dashboard mounts and triggers /api/analytics.</li>
                                            <li>Aggregates data from visitor logs and booking records.</li>
                                            <li>Displays interactive status cards for rapid daily assessment.</li>
                                        </ol>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">2.2 Registry Snapshot (Recent 5)</h3>
                                <p className="mb-3">Immediate access to the latest platform activity.</p>
                                <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                    <li><strong>Explanation</strong>: A streamlined table showing the most recent 5 bookings for quick triage.</li>
                                    <li><strong>Flow</strong>: Provides one-click status updates (Approve/Complete) directly from the landing view, saving time on high-volume days.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">2.3 Operational Calendar & SocMed Export</h3>
                                <p className="mb-3">A &quot;Live Availability&quot; hub with social media integration.</p>
                                <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                    <li><strong>Explanation</strong>: A high-density interactive monthly grid that serves as the &quot;Live Pulse&quot; of business availability. Features per-day event badges and a one-click social export engine.</li>
                                    <li><strong>Flow</strong>:
                                        <ol className="list-decimal ml-8 mt-2 space-y-1">
                                            <li><strong>Overview</strong>: Admin monitors the monthly grid where each date displays booking density through status-coded badges.</li>
                                            <li><strong>Deep Dive</strong>: Clicking any specific date triggers a secure Details Modal revealing precise event times, client identities, and requested add-ons.</li>
                                            <li><strong>Data Aggregation</strong>: Admin clicks the &quot;Copy Schedule&quot; button in the calendar header to prepare public-facing announcements.</li>
                                            <li><strong>Transformation</strong>: The system filters out internal metadata and transforms the monthly ledger into a curated, emoji-enhanced plain text summary.</li>
                                            <li><strong>SocMed Dispatch</strong>: The formatted schedule is saved to the clipboard for instant posting across Facebook/Viber/Instagram.</li>
                                        </ol>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">3. Data Management & Moderation</h2>

                        <div className="grid sm:grid-cols-2 gap-8 ml-4">
                            <div className="p-6 border border-slate-200 rounded-lg">
                                <h3 className="text-lg font-bold mb-2 italic">3.1 Bookings Master Registry</h3>
                                <p className="text-sm text-slate-600 mb-2">The core ledger of the business.</p>
                                <p className="text-sm"><strong>Flow</strong>: Search by ID or Name → View Details → Update Status → Automated Email Trigger.</p>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-lg">
                                <h3 className="text-lg font-bold mb-2 italic">3.2 Client & Lead Registry (CRM)</h3>
                                <p className="text-sm text-slate-600 mb-2">Dual-purpose database of customers and leads.</p>
                                <p className="text-sm"><strong>Flow</strong>: Chatbot extracts lead data → Lead appears in &quot;Potential&quot; tab → Admin can send &quot;Follow-up Email&quot;.</p>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-lg">
                                <h3 className="text-lg font-bold mb-2 italic">3.3 Event Configuration</h3>
                                <p className="text-sm text-slate-600 mb-2">Dynamic service management.</p>
                                <p className="text-sm"><strong>Flow</strong>: Admin manages pricing/labels → Public booking form updates in real-time.</p>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-lg">
                                <h3 className="text-lg font-bold mb-2 italic">3.4 Communication Center (Chat Logs)</h3>
                                <p className="text-sm text-slate-600 mb-2">Historical record of business intelligence.</p>
                                <p className="text-sm"><strong>Flow</strong>: Admin navigates to &quot;Chats&quot; → View session breakdown → Analyze user pain points.</p>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-lg">
                                <h3 className="text-lg font-bold mb-2 italic">3.5 Automated Retainment</h3>
                                <p className="text-sm text-slate-600 mb-2">System-driven client engagement.</p>
                                <p className="text-sm"><strong>Flow</strong>: Follow-up Modals + automated Cron-based reminders for upcoming events.</p>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-lg">
                                <h3 className="text-lg font-bold mb-2 italic">3.6 Review Moderation</h3>
                                <p className="text-sm text-slate-600 mb-2">Public reputation management.</p>
                                <p className="text-sm"><strong>Flow</strong>: Client submits review → Admin approves for homepage display.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">4. Real-time Infrastructure (Socket.IO)</h2>
                        <div className="ml-4">
                            <p className="mb-4">The &quot;Heartbeat&quot; of the platform.</p>
                            <p className="text-slate-700 leading-relaxed italic border-l-2 border-slate-200 pl-4">
                                All modules (Clients, Bookings, Notifications) are wired to the Socket.IO bridge. Benefit: No page refreshes are ever required. When a user chats with the AI or books an event, the Admin UI updates live.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">5. Security & Data Integrity Protocol</h2>
                        <div className="ml-4 space-y-4 text-slate-700">
                            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full" /> <strong>Audit Trails</strong>: All status updates and administrative emails are logged for accountability.</p>
                            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full" /> <strong>Immutable Records</strong>: Core client and booking data are protected against accidental deletion by the AI assistant.</p>
                            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full" /> <strong>Role-Based Execution</strong>: Data-mutating commands require specific formatting and validation before execution.</p>
                        </div>
                    </div>
                </section>

                <footer className="border-t-2 border-slate-900 pt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Book.Me Administrative Suite</span>
                    <span>© 2026 :: Secured Document</span>
                </footer>
            </article>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .list-circle { list-style-type: circle; }
            `}</style>
        </div>
    );
}
