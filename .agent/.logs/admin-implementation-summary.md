# Tech Win: Book-Me Admin Dashboard Implementation

**Architecture**: MVVM with React Context + Socket.IO.
**ViewModel**: `useAdmin.ts` manages bookings state, filters, and real-time synchronicity via `useSocket`.
**View Router**: `AdminPresentation` handles 100% pure UI switching between `DASHBOARD`, `BOOKINGS`, and `EVENTS`.
**Layout**: `AdminLayout` provides a fixed 260px dark sidebar with role-aware navigation and search-enabled header.

### Key Technical Patterns:
1. **Optimistic Updates**: `updateStatus` in `useAdmin} updates local state before server confirmation for instant feedback.
2. **Socket Room**: Admin clients emit `join-admin` to subscribe to restricted event streams.
3. **Data Grid**: `BookingTable.tsx` uses `@tanstack/react-table` with custom formatting for currencies (PHP) and dates.
4. **Modularity**: Sub-components like `EventManager` are isolated, allowing for independent scaling of admin features.

### Required Context for Future Tasks:
- All Admin API interactions must use the `api` instance from `@/lib/axios`.
- UI must adhere to Shadcn standards and the specified Indigo/Slate palette.
- Real-time listeners are attached to `new-booking` for instant dashboard refreshes.
