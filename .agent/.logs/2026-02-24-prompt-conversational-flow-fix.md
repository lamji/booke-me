# Fixes: Booky Conversational Flow and Prompts

## Date: 2026-02-24

### 1. Refined NLP Instructions for Prompt Context
- **Issue**: Due to the system prompt dynamically inserting "CONFIRMED — do not ask again" and "Client Name..." for captured prospect fields, Booky's LLM occasionally misread this literal language, leading to awkward responses like "I see we have that on file" or "I already have your name." This broke the natural, non-robotic flow.
- **Fix**: Rephrased the explicit instructions within `app/api/chat/route.ts`'s system prompt from `CONFIRMED` to `CAPTURED — address them by this name, but do not state that you 'have it on file'`. Added explicit rules against explaining the Year assumption ("I'll assume you mean 2026") and explicitly forbade declaring "I already have your email."

### 2. Conversational Aggregation (Phase 3)
- **Issue**: Booky strictly followed the original Phase 3 instruction: "Collect these fields one-by-one." This created drawn-out loops where a user confirming intent ("okey thanks") would be individually prompted for a phone number, then prompted later for an exact time, frustrating the prospect path to booking.
- **Fix**: Upgraded Phase 3 in `app/api/chat/route.ts`'s system prompt to explicitly condense queries: `"Collect ALL of the following missing fields together in ONE natural question (do not ask one-by-one)."`. Booky now smoothly requests all remaining details needed simultaneously (i.e. Phone and Time) to close the booking swiftly.

### Validation
- Ran all three pipeline gates natively (`lint`, `tsc`, `build`) and checked for regressions, producing perfectly clean outputs.
