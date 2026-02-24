"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * ReviewsSection — Client testimonials with premium card design
 */

const REVIEWS = [
    {
        name: "Maria Santos",
        initials: "MS",
        role: "Bride",
        rating: 5,
        text: "They made our dream wedding a reality. Every detail was perfect — from the floral arrangements to the seamless coordination. We couldn't have asked for a better team.",
    },
    {
        name: "James Rodriguez",
        initials: "JR",
        role: "Event Organizer",
        rating: 5,
        text: "Booked their band for our corporate gala and the energy was incredible. Professional, punctual, and they read the room perfectly. Standing ovation!",
    },
    {
        name: "Sarah Chen",
        initials: "SC",
        role: "Birthday Client",
        rating: 5,
        text: "My daughter's 18th birthday was absolutely magical. The decor, the entertainment, the food — everything exceeded our expectations. Thank you for making it so special!",
    },
    {
        name: "David Park",
        initials: "DP",
        role: "Corporate Client",
        rating: 5,
        text: "We've used their services for three consecutive annual conferences. Consistent quality, innovative ideas, and flawless execution every single time.",
    },
];

interface Review {
    _id: string;
    clientName: string;
    eventType: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function ReviewsSection({ reviews = [] }: { reviews?: Review[] }) {
    // Combine dynamic and static reviews for a full grid
    const displayReviews = reviews.length > 0
        ? reviews.map(r => ({
            name: r.clientName,
            initials: r.clientName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
            role: r.eventType,
            rating: r.rating,
            text: r.comment,
            isDynamic: true
        }))
        : REVIEWS;

    return (
        <section id="reviews" className="py-24 px-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-xl"
                    >
                        <p className="text-sm font-medium text-amber-500 tracking-widest uppercase mb-3">
                            Social Proof
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            What Our{" "}
                            <span className="text-muted-foreground italic">Vibe Creators</span> Say
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Real stories from real people who entrusted us with their most precious moments.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="hidden md:block"
                    >
                        <div className="flex -space-x-3 mb-4">
                            {REVIEWS.map((r, i) => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                    {r.initials}
                                </div>
                            ))}
                            <div className="h-10 w-10 rounded-full border-2 border-background bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
                                +{reviews.length || 0}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Join our satisfied community</p>
                    </motion.div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {displayReviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative rounded-3xl border border-border/10 bg-white p-8 transition-all duration-500 hover:border-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/5"
                        >
                            {/* Quote Icon */}
                            <Quote className="absolute top-8 right-8 h-10 w-10 text-amber-500/5 group-hover:text-amber-500/10 transition-colors" />

                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"}`}
                                    />
                                ))}
                            </div>

                            {/* Review Text */}
                            <p className="text-slate-600 leading-relaxed mb-8 font-medium italic">
                                &ldquo;{review.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                                <Avatar className="h-12 w-12 rounded-2xl ring-2 ring-slate-50 ring-offset-2">
                                    <AvatarFallback className="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 text-xs font-bold">
                                        {review.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{review.name}</p>
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">
                                        {review.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Post Event CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-16 bg-slate-900 rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">Recently worked with us?</h3>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">
                            Check your email for your unique review link! We appreciate your feedback as it helps us maintain our premium standards.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
