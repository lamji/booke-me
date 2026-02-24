# Admin Portal Features

## Analytics & Dashboard
- **Dashboard Overview**: Key metrics including total bookings, revenue, top events, and overall client engagement over time.
- **Charts & Reports**: Visual charts (`ChartReport`) displaying booking trends and analytics statistics.
- **Calendar View**: Comprehensive `DashboardCalendar` for visualizing upcoming and past events intuitively.

## Client Management
- **Client List**: At-a-glance client data table tracking "existing vs potential" labels, emails, phone numbers, and last activity limits.
- **Follow-up Tooling**: Built-in specialized system (`FollowUpModal`) enabling the admin to rapidly sketch and send custom personalized emails equipped with header blocks, text, images, and action buttons.

## Booking Management
- **Booking Overview**: A comprehensive `BookingTable` listing all current, pending, and past bookings in one organized datagrid.
- **Booking Details View**: A dedicated modal (`BookingViewModal`) detailing specific event parameters, including user information, add-on configurations, booking status, and action logging.
- **Booking Fulfillment Controls**: Functionality to accept, modify, or reject bookings directly from the portal.

## Event Management
- **Event Controls**: Create, edit, and oversee multiple event templates (e.g., standard consultations vs complex packages) via the `EventManager`.

## Engagement & Communication
- **Live Notifications System**: Real-time push alerts equipped with dropdown viewers (`NotificationDropdown`, `NotificationList`) notifying the admin of recent interactions, new bookings, or cancellations.
- **Notification Direct Resolution**: Deep inspection of active alerts via `NotificationDetailsModal`, letting the admin process queue state efficiently.
- **Chat Management**: Real-time multi-threaded communication with customers directly integrated into the dashboard backend via proxy APIs or the `ChatManager`.
- **Review Curation**: `ReviewTable` enabling the admin to view and monitor incoming customer reviews, allowing quick quality assurance loops.

## Administration
- **Global Settings Configuration**: Edit broad site preferences, branding defaults, notification toggles, or general platform constraints seamlessly (`SettingsModal`).
