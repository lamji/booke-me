"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * GallerySection — Photo Collab / Bento Grid Layout
 *
 * HARD RULE: No basic cards. Uses a bento/masonry-style collage layout
 * with varied image sizes for a premium editorial feel.
 *
 * All images from Unsplash (per mvp-protocol.md).
 */

const GALLERY_IMAGES = [
    {
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
        alt: "Elegant wedding ceremony",
        className: "col-span-2 row-span-2",
    },
    {
        src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80",
        alt: "Live band performance",
        className: "col-span-1 row-span-1",
    },
    {
        src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
        alt: "Floral arrangements",
        className: "col-span-1 row-span-1",
    },
    {
        src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
        alt: "Corporate gala event",
        className: "col-span-1 row-span-2",
    },
    {
        src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
        alt: "Concert stage lighting",
        className: "col-span-1 row-span-1",
    },
    {
        src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
        alt: "Birthday celebration",
        className: "col-span-1 row-span-1",
    },
    {
        src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        alt: "Event venue setup",
        className: "col-span-2 row-span-1",
    },
];

export default function GallerySection() {
    return (
        <section id="gallery" className="py-24 px-6 bg-muted/30">
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
                        Our Work
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Captured{" "}
                        <span className="text-muted-foreground">Moments</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        A glimpse into the magic we create — every event is a story worth
                        telling.
                    </p>
                </motion.div>

                {/* Bento / Collab Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[220px] gap-3">
                    {GALLERY_IMAGES.map((image, index) => (
                        <motion.div
                            key={image.alt}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className={`group relative overflow-hidden rounded-xl ${image.className}`}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-sm font-medium">
                                    {image.alt}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
