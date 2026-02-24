# Technical Log: Booking Flow Hardening & E2E Verification (v3.8)
Date: 2026-02-24

## Objective
Simulate a real user inquiry from cold → booking, identify failures against expected behavior, and iterate until the full flow passes with a real booking ID.

## Iterations Run

### Iteration 1 — Initial Test
**Issue 1**: Phase 1 data leak — Booky answered "What events do you offer?" before collecting Name+Email
**Issue 2**: "Let me check..." filler text still slipping through on availability queries
**Issue 3**: At booking summary, Booky claimed "I don't have your email" despite it being in the chat history

### Iteration 2 — Prompt Rewrite (Golden Rules)
**Changes**:
- Rewrote entire system prompt with explicit RULE 0 through RULE 5 architecture
- RULE 0: Hard Lead-Capture Gate — no data allowed before Name+Email
- RULE 2: Zero Filler — literally forbade specific phrases
- RULE 5: Date must be in YYYY-MM-DD ISO format in BOOK_CMD
- Lowered temperature 0.5 → 0.2 for deterministic output

**Result**: Phase 1 gate working ✅, no filler ✅, but email still lost in context on long turns ❌

### Iteration 3 — Server-Side Lead Extraction
**Root Cause of email issue**: LLM hallucinating lack of email due to context window depth
**Fix**: Implemented server-side regex extraction of name + email from user message history.
  - Extracted facts injected into prompt as `## COLLECTED LEAD DATA` block
  - Name regex: `/(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+...)/i`
  - Email regex: standard RFC-compliant email pattern
  - RULE 0 updated to reference the `## COLLECTED LEAD DATA` section (✅ or ❌ state)

**Result**: Full 12-turn flow passed. Booking registered: **BKG-20260224-R1WG** ✅

## Final Verified Behavior
| Check | Result |
|---|---|
| Phase 1 data gate (no info before Name+Email) | ✅ PASS |
| No filler text before availability answer | ✅ PASS |
| Availability answer is direct (no "team will verify") | ✅ PASS |
| Name remembered throughout conversation | ✅ PASS |
| Email remembered at booking summary | ✅ PASS |
| Non-redundant field collection in Phase 3 | ✅ PASS |
| Booking successfully registered with ID | ✅ PASS `BKG-20260224-R1WG` |

## Files Modified
- `app/api/chat/route.ts` — System prompt rewrite, lead extraction, temperature change
- `presentations/ChatBot/useChat.ts` — loadingType state, focus management, date regex upgrade
- `presentations/ChatBot/index.tsx` — Context-aware loading bubble UI

## Verification
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- Inquiry simulation: 12-turn flow, booking registered BKG-20260224-R1WG
