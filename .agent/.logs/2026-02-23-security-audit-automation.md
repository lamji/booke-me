# Technical Log: Security Audit & Automation
Date: 2026-02-23

## Technical Summary
Conducted a security audit of the booking availability logic and implemented a local cron-based reminder service. Polished the dashboard UI based on visual feedback.

## Key Changes

### 1. Availability Security Fix (Phase 7)
- **Problem**: The system allowed multiple bookings on the same day if the times were different. This led to "4 events on Feb 27" in test data.
- **Root Cause**: Validation check in `POST /api/bookings` used `{ eventDate, eventTime }`.
- **Fix**: Upgraded validation to **Strict One-Event-Per-Day** in `app/api/bookings/route.ts`. 
  - Now uses `$gte: startOfDay` and `$lte: endOfDay` to block any new booking on a day that already has an approved/pending event.
  - Excludes `canceled` events from this check.

### 2. Daily 9AM Automation
- **Implementation**: Added `node-cron` with a `"0 9 * * *"` schedule in `server.mjs`.
- **Logic**: 
  - Checks for approved events exactly 2 days ahead.
  - Dispatches email alerts to both the **User** and the **Admin** (`ADMIN_EMAIL`).
  - Triggers via an internal GET request to `/api/cron/reminders`.

### 3. UI Polish
- **Shadow Removal**: Removed `shadow-sm` from the "Recent 5 Bookings" card container to align with the high-contrast flat aesthetic.
- **Calendar Filtering**: Updated `DashboardCalendar.tsx` to automatically exclude `canceled` bookings from the visual count, ensuring the admin only sees active operations.

## Verification
- [x] Verified that submitting a second booking on the same date now returns a `409 Conflict`.
- [x] Verified that 9AM cron job is initialized in `server.mjs` logs.
- [x] Verified shadow removal in `Admin/index.tsx`.

## Lessons Learned
- Product "Security" often refers to business exclusivity rules (one event per day) rather than just technical collision (same date+time).
- Local cron jobs in `server.mjs` are essential for keeping the dev environment's automation identical to production (Vercel Cron).
