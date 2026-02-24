# Admin Features Documentation - Book.Me

Detailed breakdown and operational flow for the Book.Me Administrative Suite.

## 1. The Tiger: Elite AI Business Assistant
The administrative core of the platform is powered by **The Tiger**, a specialized AI partner designed for rapid system oversight.

### Capabilities:
- **Direct Data Access**: Query real-time booking statistics, revenue estimates, and client registry data.
- **Natural Language Operations**: Instead of navigating complex menus, you can type "Tiger, approve booking BKG-123" or "Search for client Jick."
- **Event Scheduling**: Ask "Tiger, what do we have for May 6th?" and it will cross-reference the database instantly.
- **Email Dispatch**: Command the Tiger to send manual follow-ups or update notifications directly from the chat window.

### Operational Flow:
1. **Trigger**: Active the Tiger via the Terminal icon in the bottom right corner of the admin panel.
2. **Directive**: Type an operational directive (e.g., "Review the booking for tomorrow").
3. **Execution**: The AI parses the intent, queries the MongoDB cluster via internal commands, and reports the findings in natural language.
4. **Conclusion**: The assistant automatically restores target focus to the input field for your next command.

---

## 2. Dynamic Notifications System
A real-time alerting infrastructure that ensures no booking or client interaction is missed.

### Capabilities:
- **Instant Alerts**: Receive push notifications via Socket.IO for new bookings as they happen.
- **Actionable Details**: Clicking a notification opens a detailed modal with rapid-action buttons (Approve/Reject).
- **Status Persistence**: Tracks read/unread states and archives notifications for later review.

### Operational Flow:
1. **Event**: A user submits a booking on the public site.
2. **Socket Broadcast**: The server emits a `new-booking` event to the restricted Administrative Room.
3. **UI Feedback**: The bell icon in the header updates with a live badge count.
4. **Resolution**: Opening the dropdown allows the admin to view specific details and resolve the notification.

---

## 3. Global System Configuration (Settings)
A centralized command center for public-facing business identity and legal transparency.

### Capabilities:
- **Business Identity**: Update the public contact email, phone number, and physical office address.
- **Legal Engine**: Manage the raw text for Privacy Policy, Terms & Conditions, and Cancellation Policy.
- **Global Sync**: Changes saved here reflect instantly across the public footer and legal pages.

### Operational Flow:
1. **Navigation**: Click the Gear icon in the Administrative Header.
2. **Modification**: Edit the form fields within the secure Dialog modal.
3. **Persistence**: Click "Save Changes" to commit to the MongoDB `settings` collection.
4. **Propagation**: The frontend re-fetches the global state, updating the public UI immediately.

---

## 4. Operational Dashboard & Analytics
A 30,000-foot view of platform health and immediate scheduled tasks.

### Capabilities:
- **Live Analytics**: View daily visits, unique visitors, and average customer ratings sourced from direct session logs.
- **Registry Snapshot**: A condensed list of the 5 most recent bookings for immediate validation.
- **Social-Ready Calendar**: An interactive monthly schedule designed for internal oversight.

### Operational Flow:
1. **Analytics Engine**: The dashboard fetches from `/api/analytics`, aggregating visitor data into visual tiles.
2. **Interaction**: Hovering over stats provides historical context over the last 7 days.
3. **Quick Review**: Use the "Recent Bookings" table to update status without entering the full registry.

---

## 5. Secure Session Management (Logout)
Hardened security protocols for exiting the administrative context.

### Capabilities:
- **Complete Invalidation**: Clears all local storage, session cookies, and JWT tokens.
- **Redirect Protection**: Automatically routes the browser back to the secure login gate.

---

## 6. SocMed-Ready Layout (Plain Text Schedule)
*Feature under synchronization* — Implementation planned for a dedicated "Social Export" tool that strips UI elements and presents your "May 2026 Schedule" in clean, copy-pasteable plain text for Facebook/Instagram/Viber announcements.
