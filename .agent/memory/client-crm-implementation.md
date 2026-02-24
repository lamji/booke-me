# Client CRM & Lead Management (Phase 43)

## Technical Summary
Implemented a unified `Client` model to manage both existing customers (from bookings) and potential leads (from chat).

### Key Components
1. **Unified Model**: `lib/models/Client.ts` captures name, email, phone, and `type` (existing|potential).
2. **Chat Integration**: `app/api/chat/route.ts` now features server-side extraction logic that automatically upserts a 'potential' client whenever a name/email pair is detected in conversation.
3. **Booking Synchronization**: Both manual and AI-assisted booking paths now promote 'potential' clients to 'existing' status automatically.
4. **Admin CRM UI**:
   - Added `CLIENTS` view in `AdminPresentation`.
   - `ClientTable`: Displays type-specific badges and activity timestamps.
   - `FollowUpModal`: Integrated manual email sender for admin-to-lead communication.
   - **Advanced Follow-up (v4.6)**: 
     - **Templates**: Added `TEMPLATES` constant with dynamic variable replacement (e.g., `{{name}}`).
     - **Dropdown**: Integrated `Select` component for quick template switching.
     - **Live Preview**: Implemented a real-time email preview pane using a mobile-optimized side-by-side layout.
     - **Fullscreen Pattern**: Upgraded to standardized `DialogFullScreen` pattern (Shadcn) for maximized editing real estate.

### Technical Wins
- Used `findOneAndUpdate` with `$setOnInsert` to ensure existing customers are never accidentally demoted to 'potential' leads during chat.
- Implemented asynchronous form initialization in React (`FollowUpModal`) to satisfy strict `react-hooks/set-state-in-effect` rules.
- Automated migration path: `scripts/migrate-bookings-to-clients.mjs` ensures zero data loss during transition.

### Configuration
- Admin Sidebar now uses Lucide `Users` icon for CRM access.
- Audit logging integrated into the follow-up email flow (`FOLLOW_UP_EMAIL`).
