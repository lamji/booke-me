# Legacy Project Logs (Extracted from Global Memory)

This file contains historical logs related to the Book-Me Event Management System, extracted from the global `.agent/memory/logs.md` file per the Project Logging Protocol.

---

## [2026-02-20] - Booking Page Refactor & Coding Standard Update (Project: book-me-event/ai-template)
**Type**: Feature Refactor / Rule Hardening
**Status**: Completed

### Description
Updated the project's coding standards to enforce the **DRY (Don't Repeat Yourself)** philosophy. Applied the **No-Carding** rule to the Booking page, replacing standard Shadcn Card components with a custom Glassmorphism aesthetic. Removed redundant availability checking logic to streamline the user experience.

### Rule Updates
- `.agent/rules/coding-standard.md`: Added **DRY Philosophy** as a Critical Rule §0.
- `.agent/workflows/senior-dev-rules.md`: Confirmed duration-based time tracking and template logging.
- `.templates`: Added **Glassmorphism Form (No-Carding)** template for cross-project reuse.

### Implementation Details (Project: book-me-event/ai-template)
- `presentations/Booking/index.tsx`: Replaced `Card` with custom `div` containers and removed "Check Availability" UI.
- `presentations/Booking/useBooking.ts`: Removed redundant availability states and functions.
- `proxy.ts`: Renamed from `middleware.ts` and updated for Next.js 16 compliance.

---

## [2026-02-20] - Fix Socket.IO Booking Triggers (Book Me Event)
**Type**: Bug Fix / Real-Time Updates
**Status**: Completed

### Description
Traced and fixed an issue where the admin dashboard required a manual refresh to see new bookings or status updates. The problem was that the `socketio.ts` server lacked rebroadcasting logic, and the ViewModels weren't explicitly emitting or listening to the specific Socket.IO events.

### Changes (book-me-event/ai-template)
1. **Server (`pages/api/socketio.ts`)**: Added listeners to intercept `new-booking` and `booking-update` events from clients and rebroadcast them to the `admin-room`.
2. **Booking ViewModel (`presentations/Booking/useBooking.ts`)**: Added `useSocket` and invoked `emit("new-booking", payload)` upon a successful POST request.
3. **Admin ViewModel (`presentations/Admin/useAdmin.ts`)**: Bound listeners for `new-booking` and `booking-update` via `socket.on` to automatically trigger `fetchBookings()` and refresh the data grid. Fixed TypeScript `any` types to `unknown` and satisfied ESLint dependency warnings.

---

## [2026-02-20] - Architect & Simulate Custom Socket.IO Server
**Type**: Infrastructure & Testing
**Status**: Completed

### Description
Identified that Next.js 16 (App Router/Turbopack) blocked the local `pages/api/socketio.ts` WS upgrade in dev mode, causing the persistent `xhr poll error`. Re-architected the dev pipeline to use a custom Node.js `server.mjs`.

### Changes (book-me-event/ai-template)
1. **Removed**: `pages/api/socketio.ts` dependency.
2. **Added**: `server.mjs` custom Node server running Socket.IO alongside Next.js.
3. **Updated**: `package.json` to point `"dev": "node server.mjs"`.
4. **Added**: `scripts/simulate-socket.mjs` test suite.

---

## [2026-02-20] - Safe Scripts Production Block
**Type**: Security & Stability
**Status**: Completed

### Description
Added environment safeguard checks to development, diagnostic, and testing scripts to prevent accidental execution in production environments. 

### Changes (book-me-event/ai-template/scripts)
- Prepended an environment flag check (`NODE_ENV === "production" || VERCEL_ENV === "production"`) to `diagnose-mongo.mjs`, `simulate-socket.mjs`, and `test-api.mjs`.

---

## [2026-02-20] - Fix Double Bookings & Admin View Modal
**Type**: Feature & Bug Fix
**Status**: Completed

### Description
1. **Bug Fix**: The Hero section's DatePicker was allowing users to book dates that were already taken, violating the 1-booking-per-day MVP rule.
2. **Feature**: The Admin table lacked a way to view all details of a booking in a clean, isolated view.

### Changes (book-me-event/ai-template)
- **API**: Created `GET /api/bookings/dates` to fetch all non-canceled `eventDate` arrays.
- **Home VM (`useHome.ts`)**: Added `fetchBookedDates` on mount to pull disabled dates.
- **Home UI (`HeroSection.tsx`)**: Updated the `<Calendar />` disabled logic to check against both past dates and `bookedDates`.
- **Admin UI (`BookingViewModal.tsx`) [template]**: Created a full-screen, responsive dialog separating Event Info, Client Info, and Notes.
- **Admin VM/UI (`BookingTable.tsx`)**: Wired up a new "View Details" dropdown action to trigger the View Modal.

---

## [2026-02-20] - Unblock Date API & Update Dev Rules
**Type**: Bug Fix & Protocol Update
**Status**: Completed

### Description
1. **Bug Fix**: Discovered that NextAuth's `proxy.ts` middleware was silently returning a 401 redirect (HTML) for `GET /api/bookings/dates` instead of the expected JSON array of dates, causing the frontend DatePicker to fail to disable already-booked dates like the 27th.
2. **Rule Update**: Added a mandatory testing rule to `senior-dev-rules.md` requiring an isolated Node script for all APIs, including login token simulation for protected routes.

### Changes
- **`proxy.ts`**: Whitelisted `/api/bookings/dates` in the `authorized` callback's public path exemptions.
- **`.agent/workflows/senior-dev-rules.md`**: Added a new "API & Backend Implementation" rule to strictly mandate creating `scripts/test-[feature].mjs` testing APIs and simulating the auth flow.
- **`scripts/test-booking-dates.mjs`**: Created it to prove fix validity.

---

## [2026-02-20] - Header UI & Nodemailer Integration
**Type**: Feature
**Status**: Completed

### Description
Implemented a global `<Header />` component and a comprehensive email notification system using Nodemailer to send transactional emails to clients throughout the booking lifecycle.

### Changes
- **Dependencies**: Added `nodemailer` and updated `.env.local` to use Gmail SMTP credentials with an App Password.
- **UI (`Header.tsx`)**: Created a sticky, glassmorphism header containing the brand logo and a "Find Booking" button.
- **UI (`FindBookingModal.tsx`)**: Added a Dialog modal allowing users to search their booking status by either Email or Booking ID.
- **API (`GET /api/bookings/find`)**: Created a public endpoint to query a specific booking based on ID or email. Whitelisted in `proxy.ts` and tested via `scripts/test-find-booking.mjs`.

---

## [2026-02-20] - E2E Testing Suite & Data-Test-ID Rule
**Type**: Testing & Protocol Update
**Status**: Completed

### Description
Created a comprehensive Jest-based E2E testing suite that validates the entire user-facing booking API flow. Switched from Playwright (too slow for the user's workflow) to Jest + ts-jest for fast API-level testing. Also added `data-test-id` attributes to all interactive UI elements and made it a hard rule.

### Changes
- **Dependencies**: Removed `@playwright/test`. Added `jest`, `ts-jest`, `@types/jest`.
- **`jest.config.js`**: [NEW] Created Jest configuration with ts-jest and path aliases.
- **`tests/e2e/booking-flow.test.ts`**: [NEW] 8 test cases covering: booked dates, availability check, booking submission (happy path + validation), find booking by email/ID, and cron reminders.
- **UI (`data-test-id`)**: Added to `BookingPresentation`, `HeroSection`, `Header`, `FindBookingModal` — 15 interactive elements tagged.
- **`.agent/workflows/senior-dev-rules.md`**: Added **hard rule**: "Every interactive element MUST include a `data-test-id`."

---

## [2026-02-20] - Admin E2E Tests & E2E Knowledge Base
**Type**: Testing & Documentation
**Status**: Completed

### Description
Created a comprehensive API-test suite for the Admin flow, simulating the NextAuth login process completely, alongside a master `e2e-knowledge-base` document as a strict reference for long-term recall. Bypassed `proxy.ts` rate limits for local testing.

### Changes
- **`tests/e2e/admin-flow.test.ts`**: [NEW] 7 test cases covering the admin flow. Handles NextAuth CSRF, cookie capture across redirects, paginated GETs, and status updates via PATCH.
- **`.agent/qa/qa-admin-test-case.md`**: [NEW] Handbook detailing Admin E2E flow and Auth simulation.
- **`.agent/qa/e2e-knowledge-base.md`**: [NEW] Persistent master document retaining 100% of the project's E2E architecture context, API references, configuration, test flows, and `data-test-id` indexes. Ensures immediate future recall.

---

## [2026-02-20] - Admin Terminology Refinement & Logout E2E
**Type**: Refinement & Testing
**Status**: Completed

### Description
Refined the Admin API terminology to use "approved" instead of "confirmed" across validation schemas and tests. Implemented a functional Logout E2E test (`TC-A08`) that verifies the NextAuth signout endpoint.

---

## [2026-02-20] - Admin Booking Details Modal Redesign
**Type**: UI/UX Refinement
**Status**: Completed

### Description
Redesigned the Admin Booking Details Modal from a cramped "full-screen" drawer into a premium, wide-centered dialog with enhanced aesthetics and better information hierarchy.

---

## [2026-02-20] - Dynamic Events Registry (Admin & API)
**Type**: Feature Update
**Status**: Completed

### Description
Refactored the Admin Sidebar to strictly display Dashboard, Bookings, and the new Events module. Engineered a complete MVVM Dynamic Events system. Included a Mongoose Model, RESTful secure API endpoints, Zod validation, and a dedicated test script that simulates NextAuth admin login for autonomous API validation. Built the EventManager UI strictly adhering to the Professional Static Regular protocol, complete with data-test-id attributes.

### Added/Modified
- AdminLayout.tsx
- AdminProvider.tsx
- index.tsx (Admin)
- lib/models/Event.ts
- lib/validation/event.ts
- app/api/events/route.ts
- app/api/events/[id]/route.ts
- presentations/Admin/sub-helpers/useEvents.ts
- presentations/Admin/sub-components/EventManager.tsx
- scripts/test-events-api.mjs
