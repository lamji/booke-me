import { Suspense } from "react";
import BookingPresentation from "@/presentations/Booking";

/**
 * /booking Route — Imports from presentations/ ONLY.
 * No logic, no complex JSX. (project-structure.md)
 */

export default function BookingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingPresentation />
        </Suspense>
    );
}
