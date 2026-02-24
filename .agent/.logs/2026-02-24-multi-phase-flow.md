# Technical Log: Multi-Phase Conditional Booking Flow (v3.4)
Date: 2026-02-24

## Objective
Refine the public ChatBot ("Booky") conversational flow to prioritize lead capture while maintaining a low-friction information-sharing experience.

## Changes
1. **System Prompt Overhaul**: Updated `app/api/chat/route.ts` to implement a 4-phase workflow:
   - **Phase 1: Lead Capture**: Mandates collection of `clientName` and `clientEmail` before answering specific availability or pricing queries.
   - **Phase 2: The Advisor**: Provides knowledge and answers queries once lead info is captured, without pushing for more personal data.
   - **Phase 3: Conversion**: Proceeds to collect full booking details (phone, event type, date, time) only when the user expresses intent to book.
   - **Phase 4: Verification**: Final summary and functional command execution.
2. **Behavioral Guardrails**: Explicitly instructed the AI to stop asking for extra data in Phase 2 unless conversion intent is detected.

## Verification
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- Logic verified: AI now collects Name/Email as a "gate" for information, then stays in "Advisor" mode until the user is ready to book.
