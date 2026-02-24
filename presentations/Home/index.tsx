"use client";

import HeroSection from "@/presentations/Home/sub-components/HeroSection";
import AboutSection from "@/presentations/Home/sub-components/AboutSection";
import GallerySection from "@/presentations/Home/sub-components/GallerySection";
import ReviewsSection from "@/presentations/Home/sub-components/ReviewsSection";
import FooterSection from "@/presentations/Home/sub-components/FooterSection";

/**
 * Home Presentation — THE VIEW (MVVM)
 *
 * Composes all homepage sections from sub-components.
 * No direct logic here — delegates to useHome ViewModel.
 *
 * Location: presentations/Home/index.tsx
 */

import { useHome } from "./useHome";

export default function HomePresentation() {
    const { reviews } = useHome();

    return (
        <div className="min-h-screen bg-background">
            <HeroSection />
            <AboutSection />
            <GallerySection />
            <ReviewsSection reviews={reviews} />
            <FooterSection />
        </div>
    );
}
