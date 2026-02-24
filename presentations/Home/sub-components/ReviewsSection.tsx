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

export default function ReviewsSection() {
    return (
        <section id="reviews" className="py-24 px-6 bg-background">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm font-medium text-amber-500 tracking-widest uppercase mb-3">
                        Testimonials
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        What Our{" "}
                        <span className="text-muted-foreground">Clients Say</span>
                    </h2>
                </motion.div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {REVIEWS.map((review, index) => (
                        <motion.div
                            key={review.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative rounded-2xl border border-border/40 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                        >
                            {/* Quote Icon */}
                            <Quote className="absolute top-4 right-4 h-8 w-8 text-amber-500/10" />

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-4 w-4 fill-amber-400 text-amber-400"
                                    />
                                ))}
                            </div>

                            {/* Review Text */}
                            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                                &ldquo;{review.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-amber-500/10 text-amber-600 text-xs font-semibold">
                                        {review.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{review.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {review.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
