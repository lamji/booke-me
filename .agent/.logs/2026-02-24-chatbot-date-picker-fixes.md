# Bugfixes: Chatbot Hallucination & Date/Time Selectors UI

## Date: 2026-02-24

### 1. Chatbot Date Availability Hallucination
- **Issue**: If the user didn't explicitly trigger the strict Regex phrase for date checking (e.g. saying simply "yes 2026"), the `checkDate` payload would fall to undefined on the client logic. Without `checkDate`, the API did not inject the `[DATABASE STATUS]` result for availability. The LLM would then "hallucinate" an assumption reading "Since I don't have any information suggesting this is booked, it is available".
- **Fix**: Rewrote **RULE 3** in `app/api/chat/route.ts` specifically closing the loop on this logical hole:
  - Forbade the phrase `"I don't have information that suggests it is booked"`.
  - Enforced that if no `[DATABASE STATUS]` is actively confirming availability in the context, Booky must rely strictly on either previous verified conversation memory (for follow-up responses), OR explicitly ask the user to provide the exact date (in YYYY-MM-DD or Month DD, YYYY format) to proceed. It is forbidden from inventing availability.

### 2. Date and Time Selector Improvements (Hero Section)
- **Time Selector**:
  - Bound `disabled={!selectedDate}` property to the `Select` component ensuring users cannot pick a time until a date is chosen.
  - Added stylistic disabled variants (`disabled:opacity-50`, `disabled:cursor-not-allowed`) to match modern UX expectations.
  - Aligned empty state text colors explicitly targeting `data-[placeholder]` values.
- **Date Selector**:
  - Added React state `isDatePickerOpen` to track popover overlay.
  - Programmatically triggering `setIsDatePickerOpen(false)` when `onSelect(date)` fires for the first time, ensuring the dropdown closes immediately upon user selection.

### Validation
- Validated via `test-booky-inquiry.mjs` verifying strict format rules on date inquiries.
- Ran all three pipeline gates natively (`lint`, `tsc`, `build`) and checked for regressions, producing clean outputs.
