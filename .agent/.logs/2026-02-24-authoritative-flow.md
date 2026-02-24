# Technical Log: Authoritative Booking Flow & Redundancy Prevention (v3.7)
Date: 2026-02-24

## Objective
Fix the issue where Booky hallucinates a lack of "real-time access" to the database and redundantly asks for booking information (like date and event type) that the user has already provided in the conversational flow.

## Changes
1. **Rule 0: USE YOUR EYES**: Added a high-priority rule instructing the model to treat the `## LIVE DATA` and `## Availability Result` blocks as absolute truth.
2. **Rule 9: REAL-TIME AUTHORITY**: Explicitly forbade the AI from generating phrases like "I don't have real-time access" or "our team will confirm" when an availability result is actively present in the prompt.
3. **Rule 10: NO REDUNDANCY**: Instructed the AI to dynamically adapt its workflow. If Phase 3 is triggered but the user has already stated their preferred date or event type, Booky must skip asking for those fields and proceed to the next required data point.
4. **Context Strengthening**: Updated the `availabilityContext` generator in the API to prepend `[DATABASE STATUS]` and explicitly instruct the model: `You MUST inform the user...`.
5. **Regex Update**: Improved the regex in `useChat.ts` to correctly catch date queries that omit the year (e.g., "May 10").

## Verification
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- Logic verified: The system prompt now aggressively enforces its authority over the data it is fed and prevents loop-like redundancy in the booking script.
