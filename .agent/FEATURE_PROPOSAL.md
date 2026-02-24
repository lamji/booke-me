# Book.Me — Final Feature Proposal & System Architecture

This document outlines the complete feature set of the Book.Me Event Booking Management System, including operational flows and administrative capabilities.

---

## 1. Administrative Core & Intelligence

### 1.1 The Tiger: Elite AI Business Partner
A high-performance, humanized AI assistant specialized in administrative operations.
- **Explanation**: The Tiger has direct "Search & Destroy" access to the MongoDB collections. It can parse complex requests about bookings, clients, and revenue without requiring manual menu navigation.
- **Capabilities**:
    - **Read-Only Intelligence**: Query status (e.g., "Any pending bookings for next week?")
    - **Status Orchestration**: Execute state changes (e.g., "Approve booking BKG-123")
    - **Deep Inspection**: Inspect details (e.g., "Does Jick have add-ons for his wedding?")
    - **Client Outreach**: Send manual emails directly from the chat interface.
- **Security Guardrails**:
    - **Zero-Deletion Policy**: Strictly forbidden from deleting any records from the database.
    - **Restricted Modification**: Cannot edit client profiles, prices, or configuration directly. Modifications are restricted to authorized **UPDATE_STATUS** workflows only.
- **User Flow**:
    1. Admin opens the Tiger UI (terminal icon).
    2. Inputs a directive in natural language.
    3. Tiger executes server-side logic and reports result with automated focus-retention.

### 1.2 Multi-Channel Notification System
Real-time alerting for all critical business events.
- **Explanation**: Uses Socket.IO to broadcast events instantly from the client-facing site to the administrative panel.
- **Flow**:
    1. A lead or booking is captured on the public site.
    2. Server emits a socket event.
    3. Admin Header displays a live-badge count update.
    4. Admin opens the notification dropdown or full list to resolve (Approve/View/Dismiss).

### 1.3 Global System Configuration (Settings)
Centralized control over the business identity and legal transparency.
- **Explanation**: A dedicated module to manage public-facing contact data and legal requirements.
- **Flow**:
    1. Admin enters the Settings modal via the Header gear icon.
    2. Modifies business details (Phone, Email, Address) or Legal text (Privacy Policy, Terms).
    3. On Save, the system updates the global `settings` collection and syncs changes to the public footer instantly.

### 1.4 Secure Session Management
NextAuth-powered security layer.
- **Explanation**: Role-based access control ensuring only authorized administrators can reach the `/admin` route.
- **Flow**:
    1. User clicks "Sign Out" in the sidebar or header.
    2. System invalidates the JWT/Session cookie.
    3. Browser is immediately redirected to the root homepage, locking out the administrative views.

---

## 2. Operational Dashboard

### 2.1 Unified Analytics Engine
Higher-level business health monitoring.
- **Explanation**: Visual tiles displaying Real-time Visits, Unique Users, Pending Tasks count, and Public Sentiment (Average Rating).
- **Flow**:
    1. Dashboard mounts and triggers `/api/analytics`.
    2. Aggregates data from visitor logs and booking records.
    3. Displays interactive status cards for rapid daily assessment.

### 2.2 Registry Snapshot (Recent 5)
Immediate access to the latest platform activity.
- **Explanation**: A streamlined table showing the most recent 5 bookings for quick triage.
- **Flow**: Provides one-click status updates (Approve/Complete) directly from the landing view, saving time on high-volume days.

### 2.3 Operational Calendar & SocMed Export
A "Live Availability" hub with social media integration.
- **Explanation**: A high-density interactive monthly grid that serves as the "Live Pulse" of business availability. Features per-day event badges and a one-click social export engine.
- **Flow**:
    1. **Overview**: Admin monitors the monthly grid where each date displays booking density through status-coded badges.
    2. **Deep Dive**: Clicking any specific date triggers a secure **Details Modal** revealing precise event times, client identities, and requested add-ons.
    3. **Data Aggregation**: Admin clicks the "Copy Schedule" button in the calendar header to prepare public-facing announcements.
    4. **Transformation**: The system filters out internal metadata and transforms the monthly ledger into a curated, emoji-enhanced plain text summary.
    5. **SocMed Dispatch**: The formatted schedule (e.g., "📅 May 06: Wedding - 10:00 AM") is saved to the clipboard for instant posting across Facebook/Viber/Instagram.

---

## 3. Data Management & Moderation

### 3.1 Bookings Master Registry
The core ledger of the business.
- **Explanation**: Full CRUD interface for every event registration in the system with advanced filtering.
- **Flow**: Search by ID or Name → View Details (Notes, Add-ons) → Update Status → Automated Email Trigger to Client.

### 3.2 Client & Lead Registry (The CRM)
A dual-purpose database of confirmed customers and potential leads.
- **Explanation**: Automatically captures "Potential" leads from chatbot interactions (Name/Email/Phone) even if they haven't booked yet.
- **Flow**: Chatbot extracts lead data → Lead appears in "Potential" tab → Admin can send a manual "Follow-up Email" via built-in templates.

### 3.3 Event Configuration (Package Manager)
Dynamic service management.
- **Explanation**: Define what packages are available to the public (Wedding, Birthday, Corporate).
- **Flow**: Admin manages pricing, duration, and labels → Public booking form updates its dropdown options in real-time.

### 3.4 Communication Center (Chat Logs)
Historical record of business intelligence.
- **Explanation**: A dedicated module to review all transcripts between users and the public Booky AI.
- **Flow**: Admin navigates to "Chats" → View session breakdown → Analyze user pain points or common questions derived from raw conversational data.

### 3.5 Automated Retainment (Follow-ups & Reminders)
System-driven client engagement.
- **Explanation**: Built-in logic for both manual follow-ups and automated system reminders.
- **Components**:
    - **Follow-up Modal**: Send templated, professional emails to leads in one click.
    - **Cron Reminders**: Automated backend triggers (at `/api/cron/reminders`) to alert clients of upcoming events.

### 3.6 Review Moderation
Public reputation management.
- **Explanation**: A gatekeeper for client testimonials.
- **Flow**: Client submits a review → Admin reviews content and rating → Approves for public display on the homepage.

---

## 4. Real-time Infrastructure (Socket.IO)
The "Heartbeat" of the platform.
- **Explanation**: All modules (Clients, Bookings, Notifications) are wired to the Socket.IO bridge.
- **Benefit**: No page refreshes are ever required. When a user chats with the AI or books an event, the Admin UI updates the tables and charts live.

---

## 5. Security & Data Integrity Protocol
- **Audit Trails**: All status updates and administrative emails are logged for accountability.
- **Immutable Records**: Core client and booking data are protected against accidental deletion by the AI assistant.
- **Role-Based Command Execution**: Data-mutating commands (like status changes) require specific formatting and are validated against current record states before execution.
