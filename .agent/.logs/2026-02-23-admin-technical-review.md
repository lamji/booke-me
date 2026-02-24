# Technical Review: Admin Dashboard Architecture

**Project**: Book-Me Event Management System
**Date**: 2026-02-23
**Focus**: Admin Portal Technical Specifications

---

## 1. Architecture Overview (MVVM)
The admin portal follows a strict **MVVM (Model-View-ViewModel)** pattern to ensure clean separation of UI and logic.

- **Model**: Data structures defined in `@/types/booking` and `@/lib/models`.
- **ViewModel**: `useAdmin.ts` & `AdminProvider.tsx`.
- **View**: `AdminPresentation/index.tsx` and sub-components.

## 2. Core Components Hierarchy
```text
AdminPage (app/admin/page.tsx)
└── AdminProvider (presentations/Admin/AdminProvider.tsx)
    └── AdminLayout (presentations/Admin/AdminLayout.tsx) [Sidebar/Header]
        └── AdminPresentation (presentations/Admin/index.tsx) [View Router]
            ├── DashboardView (DASHBOARD)
            ├── Bookings Registry (BOOKINGS)
            └── Event Configuration (EVENTS)
```

## 3. Technical Implementation Details

### A. State Management & Lifecycle
- **Context API**: `AdminProvider` wraps the entire dashboard, sharing state from the `useAdmin` hook.
- **View Switching**: Managed via `currentView` state (DASHBOARD, BOOKINGS, EVENTS, etc.).

### B. Logic Layer (`useAdmin.ts`)
- **Data Fetching**: Uses `axios` for REST API calls to `/api/bookings`.
- **Real-time Updates**: 
  - Integrated with **Socket.IO** (`useSocket` hook).
  - Joins room `join-admin` on mount.
  - Listens for `new-booking` and `booking-update` to trigger re-fetches or optimistic updates.
- **CRUD Actions**: Handles status updates (approve/cancel) with optimistic UI updates.

### C. UI Implementation
- **Theme**: Professional Slate/Dark Sidebar with Indigo/Blue accents.
- **Components**: Leveraging **Shadcn UI** library.
  - `TanStack Table` (via `BookingTable.tsx`) for high-performance data grids.
  - `Sheet/Dialog` for deep-viewing booking details or editing event types.
  - `Lucide React` for consistent iconography.

## 4. API Endpoints (Admin Context)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bookings` | `GET` | Fetch all bookings (filterable by status) |
| `/api/bookings/[id]` | `PATCH` | Update booking status (`approved`, `canceled`) |
| `/api/events` | `GET` | Fetch event configuration registry |
| `/api/events` | `POST` | Create new event type |
| `/api/events/[id]` | `PATCH/DELETE` | Modify or remove event types |

## 5. AI Catch-up Guide (Technical)
- **Adding a new view**:
  1. Add the view name to `AdminView` type in `AdminProvider.tsx`.
  2. Add a menu item in `AdminLayout.tsx`.
  3. Implement the UI block in `AdminPresentation/index.tsx`.
- **Data Schema**: Refer to `IBooking` for required fields (client info, event details, status).
- **Socket Integration**: Ensure `socket.emit("join-admin")` is called to receive backend notifications.
- **Testing**: Use `data-test-id` attributes (e.g., `admin-btn-view-booking`) for E2E automation.

---
**Status**: Admin MVP core features (Dashboard, Bookings, Events) are fully implemented and synchronized.
