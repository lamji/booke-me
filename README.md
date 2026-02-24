# book.me — Event Booking Management System

A fullstack MVP for event booking with real-time admin notifications.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: MongoDB (Mongoose)
- **State**: Redux Toolkit + React Query
- **UI**: Shadcn UI + Tailwind CSS 4 + Framer Motion
- **Realtime**: Socket.IO
- **HTTP**: Axios (centralized interceptors)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### Installation

```bash
# Clone the repo
git clone https://github.com/lamji/ai-builder-template.git
cd ai-builder-template

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the homepage.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — Hero, About, Gallery, Reviews, Footer |
| `/booking` | Booking form — select event, date, submit |
| `/admin` | Admin dashboard — view, approve, cancel bookings |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings` | Create a new booking |
| `GET` | `/api/bookings` | List bookings (paginated) |
| `POST` | `/api/bookings/availability` | Check date/time availability |
| `PATCH` | `/api/bookings/:id` | Update booking status |

## Architecture (MVVM)

```
app/                  → Routing layer (thin wrappers)
presentations/        → View + ViewModel (MVVM core)
  Home/               → Homepage sections
  Booking/            → Booking form
  Admin/              → Admin dashboard
components/           → Reusable UI + Providers
lib/                  → Global logic (axios, db, redux, hooks)
types/                → Shared TypeScript interfaces
pages/api/            → Socket.IO server (requires Pages API)
```

## 🛡️ Security & Compliance

This project is built with **PCI DSS** and **OWASP Top 10** security standards as a priority.

### Key Security Features
- **Strict Input Validation**: All API endpoints are guarded by **Zod** schemas to prevent injection and malformed data attacks.
- **Rate Limiting**: Global rate limiting (100req/15min) and strict-action limiting (20req/15min) implemented in Middleware to prevent brute-force and DDoS.
- **Security Headers**: Production-grade headers configured via `next.config.ts`:
  - `Content-Security-Policy`: Restricts resource loading to trusted sources.
  - `Strict-Transport-Security`: Enforces TLS 1.2+.
  - `X-Frame-Options: DENY`: Prevents clickjacking.
- **Audit Logging**: All administrative actions are recorded with IP, UserID, and action details (PCI DSS Req 10).
- **Session Security**: NextAuth cookies are configured as `HttpOnly`, `Secure`, and `SameSite: Strict`.
- **Data Protection**: Automatic redaction of sensitive keys (`password`, `secret`, `token`) in all logs.

### Compliance Checklist
- [x] No storage of raw cardholder data (PAN, CVV).
- [x] Encryption in transit enforced.
- [x] Access control restricted to authenticated administrators.
- [x] Audit trails for all data modifications.

## License

MIT
