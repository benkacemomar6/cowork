# CoWork

A full-stack freelance marketplace: clients post jobs, freelancers submit proposals, the client hires one of them, work gets delivered through tracked milestones, and both sides leave a review at the end. Includes real-time messaging/notifications, email verification and password reset, and an admin console.

## Features

- **Auth** — register/login with JWT (short-lived access token + revocable 7-day refresh token), email verification, and forgot/reset password (Nodemailer, logs to console if no SMTP is configured).
- **Jobs** — post, edit, browse/search/filter/sort, delete. Public browsing, client-owned management.
- **Proposals** — freelancers apply with a cover letter and bid; the client accepts one (auto-rejecting the rest) or rejects/the freelancer can withdraw.
- **Milestones** — the client breaks an accepted job into paid stages; the freelancer submits deliverables; the client approves or requests revisions. The job auto-completes once every milestone is approved.
- **Messaging** — a private thread per in-progress job between the client and hired freelancer, delivered live over a socket connection (not polling).
- **Notifications** — in-app, pushed live to whichever of a job's two participants is currently connected, for every proposal/milestone state change.
- **Reviews** — rating + comment left by either side once a job is complete, shown on public profiles.
- **Admin console** — platform stats, user list with ban/unban, job list with status moderation and removal.

## Tech Stack

**Backend** — `server/`

| Layer | Choice |
| --- | --- |
| Runtime | Node.js, Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` password hashing |
| Realtime | Socket.IO (one room per logged-in user, joined by user ID) |
| Email | Nodemailer |
| Hardening | `helmet`, `cors`, `express-rate-limit` (on `/api/auth`) |

**Frontend** — `client/`

| Layer | Choice |
| --- | --- |
| Framework | React 19 + Vite |
| Routing | React Router 7 (role-gated protected routes) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) — one shared stylesheet (`src/styles/tokens.css`) drives every page |
| Realtime | `socket.io-client`, wired through `AuthContext` |
| HTTP | axios, with an interceptor that attaches the JWT and retries once on a 401 using the refresh token |
| Icons | lucide-react |

## Architecture

Strict layering in `server/src/`, enforced by convention:

```text
route → authenticate/requireRole middleware → controller → service → Mongoose model
```

- **Routes** only map an HTTP verb+path to a controller and attach middleware — no logic.
- **Controllers** parse the request, call one service function, shape the response.
- **Services** hold all business logic *and* ownership/authorization checks (e.g. "is this user the client who owns this job?") — `requireRole` middleware only gates by role, not by resource ownership.
- **Models** are one Mongoose schema per collection (`User`, `Job`, `Proposal`, `Milestone`, `Message`, `Notification`, `Review`), related by ObjectId, no embedding.

Every service throws `AppError(message, statusCode)`; every controller forwards it to `next(error)`; one `errorHandler` at the end of the Express pipeline formats the final response.

## Project Structure

```text
cowork/
├── server/                  # Express API
│   ├── server.js            # app setup, middleware, socket.io init, listen
│   └── src/
│       ├── routes/          # HTTP verb+path → controller
│       ├── controllers/     # req/res shaping only
│       ├── services/        # business logic + authorization
│       ├── models/          # Mongoose schemas
│       ├── middleware/      # authenticate, requireRole, errorHandler
│       ├── utils/           # AppError, mailer
│       └── socket.js        # Socket.IO singleton (initSocket/getIO)
└── client/                  # React (Vite) frontend
    └── src/
        ├── pages/           # one component per route
        ├── components/      # Navbar, JobCard, Pagination, AdminTabs, ...
        ├── context/         # AuthContext (user, tokens, socket)
        ├── routes/          # ProtectedRoute
        ├── api/             # axios instance
        ├── utils/           # formatters
        └── styles/          # tokens.css — the whole app's design system
```

## Getting Started

**Prerequisites:** Node.js, a running MongoDB instance (local or a connection string).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # then fill in the values below
node server.js         # runs on PORT, connects to Mongo (db name: "cowork")
```

**Environment variables** (`server/.env`):

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | yes | port the API listens on (matches `client/src/api/axios.js`'s baseURL — 3000 by default) |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | signs access tokens |
| `JWT_REFRESH_SECRET` | yes | signs refresh tokens |
| `CLIENT_URL` | no | used to build links in verification/reset emails (defaults to `http://localhost:5173`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | no | real email delivery — leave `SMTP_HOST` unset and emails are logged to the console instead, so auth flows still work with zero setup |
| `MAIL_FROM` | no | From: header for outgoing emails |

### 2. Frontend

```bash
cd client
npm install
npm run dev             # Vite dev server, defaults to http://localhost:5173
```

No client-side `.env` yet — the API base URL is hardcoded to `http://localhost:3000/api` in `src/api/axios.js`.

### 3. Use it

Open the client dev server URL, register a client and a freelancer account (two browsers/incognito windows, or log out/in), post a job as the client, apply as the freelancer, accept the proposal, and work through milestones/messages from there. To reach `/admin`, promote an existing account's `role` to `admin` directly in MongoDB — there's no self-service way to become an admin.

There's no lint, build, or test setup yet — `npm test` in `server/` is an unconfigured stub. Verify backend changes by requiring the module directly (`node -e "require('./path/to/file')"`) or `node --check <file>` for a syntax pass.

## Documentation

- [`CoWork-PRD (1).md`](<CoWork-PRD (1).md>) — product requirements, personas, phase roadmap
- [`CoWork-Design-Doc (1).md`](<CoWork-Design-Doc (1).md>) — architecture draft, DB schema, API endpoint map, state machines
- [`PROJECT-STATUS.md`](PROJECT-STATUS.md) — living snapshot of what's implemented, what's broken, what's not started
- [`PROJECT-WRITEUP.md`](PROJECT-WRITEUP.md) — tech stack, lessons learned, and a step-by-step walkthrough of the whole user journey
