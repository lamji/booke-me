"use client";

import React, { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,
    MessageSquare,
    ChevronLeft,
    Send,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useReview } from "@/presentations/Reviews/useReview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const RATING_LABELS = [
    "Could be better 😕",
    "It was okay 😐",
    "Good experience 🙂",
    "Great service! 😄",
    "Absolutely perfect! 🤩"
];

function ReviewForm() {
    const vm = useReview();

    return (
        <div className="p-8 sm:p-10 space-y-8">
            <AnimatePresence mode="wait">
                {vm.submitResult?.success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10 space-y-4"
                    >
                        <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Thank You So Much!</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            {vm.submitResult.message}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-4 animate-pulse">
                            Redirecting you home...
                        </p>
                    </motion.div>
                ) : !vm.bookingId ? (
                    <motion.div
                        key="invalid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 space-y-4"
                    >
                        <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                            <AlertCircle className="h-10 w-10 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Missing Reference</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            We couldn&apos;t find a valid booking reference for this review. Please check your email link.
                        </p>
                        <Button asChild variant="outline" className="mt-4 rounded-xl px-8 uppercase tracking-widest text-[10px] font-black border-slate-200">
                            <Link href="/">Go Back Home</Link>
                        </Button>
                    </motion.div>
                ) : vm.isLoadingBooking ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identifying your event...</p>
                    </div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Event Info Card */}
                        {vm.bookingData && (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Your Event</p>
                                    <h3 className="text-lg font-black text-indigo-900 leading-tight">
                                        {vm.bookingData.eventType}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Reference</p>
                                    <p className="text-sm font-mono font-bold text-indigo-900">#{vm.bookingId}</p>
                                </div>
                            </div>
                        )}

                        {/* Rating Selector */}
                        <div className="space-y-4 text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Overall Satisfaction</p>
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => vm.setRating(star)}
                                        className={`transition-all duration-200 ${star <= vm.rating ? "text-amber-400 drop-shadow-sm" : "text-slate-200"
                                            }`}
                                    >
                                        <Star className={`h-10 w-10 ${star <= vm.rating ? "fill-current" : ""}`} />
                                    </motion.button>
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 italic">
                                {RATING_LABELS[vm.rating - 1]}
                            </p>
                        </div>

                        {/* Comment Area */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Your Comments</p>
                                <span className={`text-[10px] font-bold ${vm.comment.length < 10 ? "text-rose-400" : "text-slate-400 uppercase tracking-tighter"}`}>
                                    {vm.comment.length < 10 ? `${10 - vm.comment.length} more chars needed` : "Looking good!"}
                                </span>
                            </div>
                            <Textarea
                                placeholder="Tell us what you loved about the experience..."
                                value={vm.comment}
                                onChange={(e) => vm.setComment(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all resize-none p-4 text-slate-700 bg-white"
                            />
                        </div>

                        {vm.submitResult?.success === false && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-[11px] font-bold"
                            >
                                <AlertCircle className="h-4 w-4" />
                                {vm.submitResult.message}
                            </motion.div>
                        )}

                        <Button
                            onClick={vm.submitReview}
                            disabled={vm.comment.length < 10 || vm.isSubmitting}
                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
                        >
                            {vm.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Post My Review
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function NewReviewPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-indigo-50 overflow-hidden relative z-10"
            >
                {/* Header */}
                <div className="bg-slate-900 px-8 py-10 text-white relative">
                    <Link
                        href="/"
                        className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium uppercase tracking-widest"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <div className="mt-4 text-center">
                        <div className="h-14 w-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-400/30">
                            <MessageSquare className="h-7 w-7 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Share Your Experience</h1>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">
                            Your feedback helps us make every event unforgettable.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <Suspense fallback={
                    <div className="p-8 sm:p-10 flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identifying your event...</p>
                    </div>
                }>
                    <ReviewForm />
                </Suspense>
            </motion.div>

            {/* Footer Trust */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40 select-none"
            >
                <div className="h-px w-8 bg-slate-300" />
                Trusted by Premium Clients
                <div className="h-px w-8 bg-slate-300" />
            </motion.div>
        </div>
    );
}
