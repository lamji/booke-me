"use client";

import { motion } from "framer-motion";
import { Heart, Music, Star, Users } from "lucide-react";

/**
 * AboutSection — Premium "About Us" with feature highlights
 */

const FEATURES = [
    {
        icon: Heart,
        title: "Weddings",
        description:
            "Crafting fairy-tale weddings with meticulous attention to every detail, from venue decor to floral arrangements.",
    },
    {
        icon: Music,
        title: "Live Performances",
        description:
            "From intimate acoustic sets to electrifying full-band shows — we curate the perfect musical experience.",
    },
    {
        icon: Users,
        title: "Corporate Events",
        description:
            "Professional event management for conferences, galas, and team-building retreats that leave lasting impressions.",
    },
    {
        icon: Star,
        title: "Special Occasions",
        description:
            "Birthday celebrations, anniversaries, and milestone events designed to make every moment unforgettable.",
    },
];

export default function AboutSection() {
    return (
        <section id="about" className="py-24 px-6 bg-background">
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
                        About Us
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        We Create Experiences,
                        <br />
                        <span className="text-muted-foreground">Not Just Events</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        With over a decade of experience, our team transforms ordinary
                        gatherings into extraordinary celebrations that resonate for years
                        to come.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative rounded-2xl border border-border/40 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
                        >
                            <div className="mb-4 inline-flex rounded-xl bg-amber-500/10 p-3 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
