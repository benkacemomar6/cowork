# Product Requirements Document (PRD)
## Project: CoWork — Freelance Job Marketplace

**Version:** 1.0 (Draft)
**Status:** Planning Phase
**Owner:** [Your Name]
**Last Updated:** August 2026

---

## 1. Overview

### 1.1 Problem Statement
Independent clients and freelancers need a trustworthy platform to connect, negotiate scope and price, track work through completion, and build a reputation — without relying on informal channels (email, spreadsheets, social media DMs) that offer no structure, accountability, or dispute resolution.

### 1.2 Product Summary
CoWork is a full-stack web application connecting **Clients**, who post jobs and hire talent, with **Freelancers**, who browse jobs, submit proposals, and deliver work through a structured milestone system. **Admins** moderate the platform, resolve disputes, and monitor platform health.

### 1.3 Goals
- Provide a clear, low-friction workflow from job posting → proposal → hire → delivery → review.
- Enforce ownership and permission rules so users can only act on data they're authorized to touch.
- Demonstrate production-grade full-stack architecture (auth, security, admin tooling, notifications) suitable for a professional portfolio.

### 1.4 Non-Goals (for MVP)
- Real payment processing (Stripe/PayPal integration) — MVP will simulate payment status only.
- Real-time chat via WebSockets — MVP will use polling or simple REST-based messaging; live sockets can be a Phase 9 "advanced feature" stretch goal.
- Mobile app — web-responsive only.

---

## 2. Target Users & Personas

| Role | Description | Primary Goals |
|---|---|---|
| **Client** | Individual or business posting work | Post jobs, review proposals, hire freelancers, track milestones, pay, leave reviews |
| **Freelancer** | Individual offering services | Find relevant jobs, submit proposals, communicate with clients, deliver work, get reviewed |
| **Admin** | Platform operator | Moderate content, resolve disputes, manage users, monitor platform stats |

---

## 3. Core Entities & Relationships (High Level)

> Full schema design happens in Phase 3. This is the conceptual model.

- **User** — base account (role: client / freelancer / admin), profile, auth data
- **Job** — posted by a Client; has category, budget, description, status
- **Proposal** — submitted by a Freelancer against a Job; has price, cover letter, status
- **Milestone** — belongs to a Job (once a Proposal is accepted); tracks deliverable stages
- **Review** — left by Client → Freelancer or Freelancer → Client after job completion
- **Message** — belongs to a conversation thread tied to a Job/Proposal
- **Notification** — system-generated, belongs to a User

**Key relationships:**
- One Client → many Jobs
- One Job → many Proposals (from different Freelancers)
- One Job → one accepted Proposal → many Milestones
- One Job → one Review pair (client-side + freelancer-side)
- One Job → one Message thread (between the hired Freelancer and Client)

---

## 4. Feature Scope

### 4.1 MVP (Must-Have) Features

**Authentication & Users**
- Register / Login / Logout
- Password hashing (bcrypt)
- JWT auth with refresh tokens
- Email verification
- Password reset flow
- Role-based accounts (client / freelancer / admin)
- Profile management (bio, skills, profile image, edit info, change password)

**Job Marketplace (Core Feature)**
- Clients: create, edit, close, delete job postings
- Freelancers: browse/search/filter/sort jobs (by category, budget, date, keyword)
- Pagination on job listings
- Freelancers: submit proposals (cover letter + bid price)
- Clients: view proposals per job, accept/reject
- Ownership enforcement (only job owner can manage their job/proposals)

**Milestones & Delivery**
- Once hired, job moves to "in progress"
- Milestone creation (client defines stages, or system defaults to single milestone)
- Freelancer submits work per milestone
- Client approves/requests revision per milestone
- Job marked "completed" once all milestones approved

**Messaging**
- Simple threaded messaging tied to a job/proposal between client and hired freelancer

**Reviews & Reputation**
- Post-completion, two-sided review/rating system
- Reviews visible on public profiles

**Notifications**
- In-app notifications for: new proposal, proposal accepted/rejected, milestone submitted/approved, new message, job completed

**Admin Dashboard**
- View/manage all users (suspend/ban)
- View/manage all jobs (remove flagged/inappropriate listings)
- View platform statistics (total users, jobs, completed projects, revenue simulated)
- Basic dispute view (flagged jobs/messages)

**Security & Quality**
- Input validation (client + server side)
- Centralized error handling
- Rate limiting on sensitive routes (auth, proposal submission)
- CORS configuration
- Secure headers (helmet)
- No sensitive data leakage in API responses

### 4.2 Stretch / Later-Phase Features (Phase 9: Advanced Features)
- Real-time messaging via WebSockets
- Payment integration (Stripe test mode)
- Advanced search (full-text search, tag-based skill matching)
- Freelancer availability calendar
- Saved/favorited jobs
- Email notifications (not just in-app)
- Dispute resolution workflow with admin arbitration steps

---

## 5. Functional Requirements Summary

| Area | Requirement |
|---|---|
| Auth | Users must verify email before posting jobs or submitting proposals |
| Authorization | Only the job's client can accept/reject proposals for that job |
| Authorization | Only the hired freelancer can submit milestone deliverables |
| Data integrity | A job cannot have more than one "accepted" proposal at a time |
| Data integrity | A review can only be left once per completed job, per direction |
| UX | All list views (jobs, proposals, users) must support pagination |
| UX | Search/filter must not require full page reload (client-side fetch) |

---

## 6. Non-Functional Requirements

- **Security:** Passwords hashed with bcrypt; JWTs short-lived with refresh rotation; all admin routes protected by role middleware.
- **Performance:** Paginated queries; indexed fields for common search/filter/sort operations (defined in Phase 3).
- **Reliability:** Centralized error handling returns consistent, safe error shapes (no stack traces to client in production).
- **Maintainability:** Clear separation of routes / controllers / services / models in backend; reusable component structure in frontend.
- **Usability:** Responsive UI; clear loading and error states on every data-fetching view.

---

## 7. Tech Stack (with rationale — to be reinforced per-feature as we build)

| Layer | Technology | Problem it Solves |
|---|---|---|
| Frontend | React | Component-based UI, state-driven rendering |
| Frontend routing | React Router | Client-side navigation, protected routes |
| State/data fetching | Context API / React Query (TBD when we reach Phase 7) | Auth state, server-state caching |
| Backend | Node.js + Express | REST API layer, middleware pipeline |
| Database | MongoDB + Mongoose | Flexible schema for evolving relational-ish data, easy relationship modeling via references |
| Auth | JWT (access + refresh) | Stateless authentication across API requests |
| Validation | Joi or express-validator (TBD Phase 4) | Server-side input validation |
| Security | helmet, express-rate-limit, cors | Standard Express hardening |

*(We'll justify each choice again, briefly, at the point we actually introduce it — per your original ground rules.)*

---

## 8. Success Criteria (What "Done" Looks Like for MVP)

- A client can register, verify email, post a job, review proposals, hire a freelancer, track milestones, and mark the job complete.
- A freelancer can register, browse/search/filter jobs, submit a proposal, get hired, submit milestone work, and get reviewed.
- An admin can log in, view platform stats, manage users, and remove a flagged job.
- All protected routes correctly reject unauthorized/unauthenticated access.
- The app is deployed (frontend + backend + MongoDB) and publicly accessible.

---

## 9. Open Items (To Be Defined By You)

These are intentionally left for you to complete as part of the learning process — we'll review them together before moving to Phase 2:

- [ ] Full user story list (10–15 stories, as assigned)
- [ ] Any MVP feature you think should be cut or added, with reasoning
- [ ] Job status state machine (draft the full lifecycle: e.g., `open → in_progress → completed / cancelled`)
- [ ] Proposal status state machine (e.g., `pending → accepted / rejected / withdrawn`)

---

## Progress Tracker

```text
PHASE 1  — Planning              ◄ IN PROGRESS
PHASE 2  — Project Setup
PHASE 3  — Database
PHASE 4  — Backend
PHASE 5  — Authentication
PHASE 6  — Core Features
PHASE 7  — Frontend
PHASE 8  — Admin
PHASE 9  — Advanced Features
PHASE 10 — Testing
PHASE 11 — Deployment
PHASE 12 — Documentation
```
