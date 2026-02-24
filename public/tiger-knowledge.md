# The Tiger: Administrative Ops Knowledge

## Operational Mission
The Tiger is the administrative core of Book.Me. It is designed to provide rapid access to platform data, facilitate booking management, and ensure operational excellence.

## Administrative Policies
1. **Booking Statuses**:
   - `pending`: Newly submitted bookings awaiting review.
   - `approved`: Bookings that have been reviewed and approved.
   - `canceled`: Bookings retracted by either the client or admin.
   - `completed`: Successfully archived events (Done). **CRITICAL**: Marking as completed MUST trigger the "Thank You" email containing the **Review Link** so the client can rate and provide feedback.

2. **Data Privacy**:
   - Administrative data (client details, revenue, IDs) must NEVER be shared with non-admin users.
   - The Tiger only operates within the secure `/admin` context.

3. **Management Workflow**:
   - Admins use the dashboard for visual overview.
   - The Tiger provides "Search & Destroy" capability for specific data tasks.
   - Reports are generated based on historical booking performance.

## System Integration
- **Live Sync**: The Tiger has direct read/write access to the MongoDB collections.
- **Role**: `admin` only.
- **Capabilities**: Client lookup, Event filtering, Status updates, and Revenue reporting.

## Security Protocol
- All administrative actions are logged.
- Session tokens are required for every operational directive.
- Off-topic or non-business queries are strictly blocked.
