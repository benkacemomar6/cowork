# CoWork — Project Writeup

What CoWork is, what it's built with, what it actually does step by step, and what I learned building it.

## What it is

CoWork is a freelance marketplace: clients post jobs, freelancers submit proposals, the client hires one of them, the work gets delivered through tracked milestones, and both sides leave a review at the end. Same shape as Upwork/Fiverr, built from scratch.

## Tech stack

**Backend**
- **Node.js + Express 5** — the API. Routes are thin (map a URL to a controller), controllers parse the request and shape the response, all business logic and authorization checks live in a service layer, and everything talks to MongoDB through Mongoose models.
- **MongoDB + Mongoose** — one collection per entity (`User`, `Job`, `Proposal`, `Milestone`, `Message`, `Notification`, `Review`), related by ObjectId reference rather than embedding.
- **JWT (`jsonwebtoken`)** — short-lived access tokens (1h) plus longer-lived refresh tokens (7d, stored server-side per user so they can be revoked).
- **bcrypt** — password hashing.
- **Socket.IO** — a persistent connection per logged-in user (joined to a room keyed by their user ID) used to push live messages and notifications instead of making the client poll for everything.
- **Nodemailer** — sends the email-verification and password-reset emails; falls back to logging the email to the console when no SMTP is configured, so the flow still works in local dev with zero setup.
- **helmet, cors, express-rate-limit** — baseline HTTP hardening and a request cap on the auth routes.

**Frontend**
- **React 19 + Vite** — no meta-framework, just Vite serving a single-page app.
- **React Router 7** — routing, including role-gated routes (a `ProtectedRoute` wrapper that checks both "is logged in" and "has the right role") and nested/merged param routes for things like `/jobs/:jobId/proposals`.
- **Tailwind CSS v4** (`@tailwindcss/vite`) — the whole app's design system lives in one stylesheet built on Tailwind's `@theme` tokens, so every page reuses the same handful of classes (`.card`, `.btn`, `.pill`, `.ledger-row`, `.navbar-*`) instead of styling each page individually.
- **socket.io-client** — the browser side of the realtime connection, wrapped in `AuthContext` so any component can read live unread-notification counts or subscribe to new messages.
- **axios** — API calls, with an interceptor that attaches the JWT and silently retries a request once with a refreshed token on a 401.
- **lucide-react** — icon set used throughout (category icons, job-card metadata icons, form icons).

**Design tooling**
- **Figma** (via MCP) — used to generate a small companion design-system file (color variables, type ramp, button/navbar/card components) as a durable reference alongside the code.

## What I learned

**Layered architecture actually pays off.** Keeping routes dumb, controllers thin, and all authorization logic (`is this user the client who owns this job?`) in the service layer made it possible to find and fix real bugs — like a broken message-fetch handler — by reading one function instead of tracing logic scattered across the request pipeline.

**Mongoose will pass query operators straight through.** If you take a JSON body value and drop it directly into `Model.findOne({ email })` without checking its type, `{"email": {"$regex": "^a"}}` isn't treated as the string `"[object Object]"` — Mongoose reads the `$`-prefixed key as a real MongoDB query operator. That's a working NoSQL injection with nothing more exotic than the standard JSON body parser. The fix is boring (reject anything that isn't a `string` before it touches a query) but you only think to do it once you've seen the failure mode.

**"Returning the user object" almost always means "returning the password hash too."** Mongoose documents serialize every field by default. Three admin endpoints in this project quietly returned raw user documents — hashes and live refresh tokens included — because nobody added `.select('-password')`. It's an easy category of bug to miss because the endpoint *works fine*; nothing about the happy path looks wrong.

**A socket connection isn't the same as a live feature.** The frontend can subscribe to `socket.on('new_notification', ...)` correctly and still never receive anything, because the backend has to actually call `io.emit(...)` somewhere — and if that call lives in the wrong function (or nowhere at all), the symptom looks like "notifications are broken" when the real issue is "notifications were never wired up in the first place."

**Restyling doesn't have to mean rewriting.** Because every page already pulled its classes from one shared stylesheet, redoing the entire app's visual identity — twice, once for the initial pass and once after "too bright" feedback — meant editing one CSS file, not touching thirteen page components.

**Security fixes need proof, not just a plausible read.** Every fix in this project (the injection, the data exposure, a role field that let anyone self-register as admin) got exercised against a real database with disposable test data before being called done — register, attempt the exploit, confirm it's rejected, confirm the legitimate path still works, clean up.

**"Enumeration" is a real, specific bug shape.** A forgot-password endpoint that says "user not found" for one input and "email sent" for another is leaking who has an account, one guess at a time. The fix is to always return the same response regardless of whether the account exists — obvious once named, easy to ship by accident otherwise.

## Step by step: what the app actually does

1. **Register.** Someone signs up as either a client or a freelancer (never admin — that's only ever set by promoting an existing account directly). Registration hashes the password, creates the account, and emails a verification link (24h expiry, single-use, only a hash of the token is ever stored).

2. **Verify email / log in.** Clicking the verification link confirms the account. Logging in checks the password against the stored hash and issues an access token (1h) plus a refresh token (7d); the refresh token lets the frontend silently get a new access token instead of forcing a re-login every hour. Forgot a password? A reset link works the same way as verification — random token, hashed before storage, expires in 1h, and resetting a password invalidates every existing session.

3. **Browse or post a job.** Anyone can browse jobs — search, filter by category/budget, sort — shown as a card grid. A logged-in client can post a new job: title, description, category, budget range, fixed or hourly.

4. **Submit a proposal.** A freelancer applies to an open job with a cover letter and a bid. A job can collect any number of proposals while it's `open`.

5. **Accept a proposal.** The client reviews proposals and accepts one. That single action moves the job to `in_progress`, auto-rejects every other proposal on the job, and notifies both the accepted freelancer and everyone who got rejected — live, over the socket connection, not just written to the database.

6. **Work through milestones.** The client breaks the job into milestones (title, description, amount). The freelancer submits each one with a deliverable link; the client either approves it or sends it back for revision. Once every milestone on a job is approved, the job automatically flips to `completed` — no separate "mark as done" step.

7. **Message and get notified, in real time.** Once a job is `in_progress`, the client and the hired freelancer can message each other about it. Every accept, reject, submission, approval, and revision request also fires an in-app notification, pushed live to whichever of the two users is currently connected.

8. **Leave a review.** After a job wraps up, both sides can leave a rating and comment, visible on each other's public profile alongside their job history.

9. **Admin oversight.** An admin account gets a separate console: platform-wide stats (users, jobs, completed jobs), a searchable user list with ban/unban, and a job list with inline status moderation and the ability to remove a job once it's cancelled or completed.
