# Technical Design Document
## Project: CoWork — Freelance Job Marketplace

**Version:** 1.0 (Draft)
**Depends on:** CoWork-PRD.md
**Status:** Planning Phase — pending your user stories & state machine decisions before we finalize

> Note: Sections 4 (Database) and 5 (API) contain draft state machines and schemas based on reasonable assumptions. Once you send your user stories and proposed status flows, we'll revise this together before touching real code — this doc is a starting point for discussion, not a locked spec.

---

## 1. System Architecture Overview

```
┌─────────────────┐        HTTPS/REST         ┌──────────────────┐
│   React SPA      │ ─────────────────────────▶│  Express API      │
│  (Vite, Router)   │ ◀───────────────────────── │  (Node.js)         │
└─────────────────┘        JSON + JWT          └──────────────────┘
                                                          │
                                    ┌─────────────────────┼─────────────────────┐
                                    ▼                     ▼                     ▼
                            ┌─────────────┐       ┌──────────────┐     ┌───────────────┐
                            │  MongoDB     │       │ File Storage │     │  Email Service │
                            │  (Mongoose)   │       │ (local/S3)   │     │ (verification/  │
                            └─────────────┘       └──────────────┘     │  reset emails)  │
                                                                        └───────────────┘
```

**Request flow (typical):**
Client → React component calls API service → Express route → auth middleware → validation middleware → controller → service layer (business logic) → Mongoose model → MongoDB → response shaped and returned → error middleware catches failures centrally.

**Why this shape:** Separating routes/controllers/services keeps each layer testable and replaceable — e.g., you could swap MongoDB for Postgres later without touching controllers, if services own all data-access logic.

---

## 2. Backend Architecture

### 2.1 Folder Structure

```
server/
├── src/
│   ├── config/            # env loading, db connection, constants
│   ├── models/            # Mongoose schemas
│   ├── routes/            # route definitions per resource
│   ├── controllers/       # request/response handling only
│   ├── services/          # business logic, reusable across controllers
│   ├── middleware/         # auth, validation, error handling, rate limiting
│   ├── validators/         # request schema validation (Joi/express-validator)
│   ├── utils/              # helpers (token signing, pagination, etc.)
│   ├── uploads/            # local file storage (dev only)
│   └── app.js              # Express app setup
├── tests/
├── .env.example
└── server.js               # entry point
```

### 2.2 Layer Responsibilities

| Layer | Responsibility | Should NOT do |
|---|---|---|
| Route | Map HTTP verb+path → controller, attach middleware | Business logic |
| Middleware | Auth check, validation, rate limit, error catch | Talk to DB directly (except auth lookup) |
| Controller | Parse request, call service, shape response | Contain business rules |
| Service | Business logic, orchestration, ownership checks | Know about `req`/`res` |
| Model | Schema definition, instance/static methods, indexes | Business logic beyond data-level rules |

### 2.3 Middleware Pipeline (per protected request)
```
helmet → cors → rate-limiter (if sensitive route) → express.json()
   → authenticate (verify JWT, attach req.user)
   → authorize (role/ownership check)
   → validate (request body/params/query)
   → controller
   → centralized error handler (catches anything thrown above)
```

---

## 3. Frontend Architecture

### 3.1 Folder Structure

```
client/
├── src/
│   ├── api/                # axios instance + per-resource API calls
│   ├── components/         # reusable UI (Button, Input, JobCard, etc.)
│   ├── pages/               # route-level components
│   ├── layouts/             # shared page shells (auth layout, dashboard layout)
│   ├── context/             # AuthContext (current user, tokens)
│   ├── hooks/                # useAuth, useFetch, usePagination, etc.
│   ├── routes/               # route definitions, ProtectedRoute wrapper
│   ├── utils/                 # formatters, validators
│   └── App.jsx
```

### 3.2 Key Pages (MVP)

| Page | Access | Purpose |
|---|---|---|
| `/` | Public | Landing/browse jobs |
| `/login`, `/register` | Public | Auth |
| `/verify-email`, `/reset-password` | Public (token-based) | Account recovery flows |
| `/jobs` | Public | Search/filter/sort job listings |
| `/jobs/:id` | Public | Job detail + proposal form (if freelancer) |
| `/dashboard` | Protected | Role-aware: client sees their jobs, freelancer sees their proposals |
| `/jobs/:id/manage` | Protected (owner) | Client: view proposals, manage milestones |
| `/proposals/:id` | Protected (owner or job client) | Milestone submission/review |
| `/profile` | Protected | Edit profile, change password |
| `/profile/:userId` | Public | Public profile + reviews |
| `/messages/:jobId` | Protected (participants) | Threaded messaging |
| `/admin` | Protected (admin) | Dashboard: stats |
| `/admin/users`, `/admin/jobs` | Protected (admin) | Moderation tables |

### 3.3 State Management Approach
- **Auth state:** React Context (`AuthContext`) holding current user + access token; refresh token handled via httpOnly cookie.
- **Server state (jobs, proposals, etc.):** fetched per-page with loading/error states; we'll evaluate in Phase 7 whether plain `useEffect` + hooks is sufficient or whether React Query earns its complexity (it solves caching/refetching — we'll decide once you feel the pain of *not* having it).

---

## 4. Database Design (Draft)

### 4.1 Collections & Schemas

**users**
```
{
  _id, name, email (unique), password,
  role: "client" | "freelancer" | "admin",
  bio, skills: [String], profileImage,
  isVerified: Boolean,
  isBanned: Boolean,

  refreshTokens: [String],       // or hashed, rotated
  createdAt, updatedAt
}
```

**jobs**
```
{
  _id, client: ObjectId(users), title, description,
  category, budget: { min, max, type: "fixed"|"hourly" },
  status: "open" | "in_progress" | "completed" | "cancelled",
  acceptedProposal: ObjectId(proposals) | null,
  createdAt, updatedAt
}
```

**proposals**
```
{
  _id, job: ObjectId(jobs), freelancer: ObjectId(users),
  coverLetter, bidAmount,
  status: "pending" | "accepted" | "rejected" | "withdrawn",
  createdAt, updatedAt
}
```

**milestones**
```
{
  _id, job: ObjectId(jobs), title, description, amount,
  status: "pending" | "submitted" | "approved" | "revision_requested",
  submittedAt, approvedAt,
  deliverableUrl,
  createdAt, updatedAt
}
```

**reviews**
```
{
  _id, job: ObjectId(jobs),
reviewer: ObjectId(users), reviewee: ObjectId(users),
  rating: Number (1-5), comment,
  createdAt
}
```

**messages**
```
{
  _id, job: ObjectId(jobs),
  sender: ObjectId(users), recipient: ObjectId(users),
  content, readAt,
  createdAt
}
```

**notifications**
```
{
  _id, user: ObjectId(users),
  type: "new_proposal" | "proposal_accepted" | "milestone_submitted" | ...,
  message, link, isRead: Boolean,
  createdAt
}
```

### 4.2 Relationships Strategy
- Mongo is document-based, but this app is *relational by nature* — we use **references (ObjectId)** rather than embedding, because:
  - Proposals/milestones/reviews/messages grow independently of their parent job (unbounded arrays inside a `job` document would hit the 16MB doc limit and make querying "all proposals by this freelancer" awkward).
  - We need to query these collections independently (e.g., "all proposals for freelancer X across all jobs").
- We'll use Mongoose `.populate()` for read-heavy views (e.g., job detail with client info) rather than manual joins.

### 4.3 Draft Indexes (to refine in Phase 3)
- `users.email` — unique index (login lookups)
- `jobs.status`, `jobs.category` — compound index (search/filter)
- `proposals.job`, `proposals.freelancer` — compound index (ownership checks, "my proposals" queries)
- `notifications.user + isRead` — compound index (unread count queries)

### 4.4 Draft State Machines (needs your input)

**Job status:**
```
open ──(proposal accepted)──▶ in_progress ──(all milestones approved)──▶ completed
  │                                                                          
  └──(client cancels)──▶ cancelled
```

**Proposal status:**
```
pending ──▶ accepted   (triggers: job → in_progress, other proposals → auto-rejected)
        └─▶ rejected
        └─▶ withdrawn   (freelancer-initiated)
```

*These are my starting proposals — you should challenge them. E.g., should a client be able to cancel a job that's already `in_progress`? What happens to an accepted freelancer's milestones if so? This is exactly the kind of edge case Phase 3 will force you to resolve.*

---

## 5. API Design (Draft Specification)

> Full request/response bodies and error codes will be finalized in Phase 3/4. This is the endpoint map.

### Auth
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Get access + refresh token |
| POST | `/api/auth/logout` | Protected | Invalidate refresh token |
| POST | `/api/auth/refresh` | Public (cookie) | Rotate access token |
| POST | `/api/auth/verify-email/:token` | Public | Confirm email |
| POST | `/api/auth/forgot-password` | Public | Send reset link |
| POST | `/api/auth/reset-password/:token` | Public | Set new password |

### Users
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/users/me` | Protected | Current user profile |
| PATCH | `/api/users/me` | Protected | Update profile |
| PATCH | `/api/users/me/password` | Protected | Change password |
| POST | `/api/users/me/avatar` | Protected | Upload profile image |
| GET | `/api/users/:id` | Public | Public profile + reviews |

### Jobs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/jobs` | Public | List/search/filter/sort/paginate |
| GET | `/api/jobs/:id` | Public | Job detail |
| POST | `/api/jobs` | Client only | Create job |
| PATCH | `/api/jobs/:id` | Owner only | Edit job |
| DELETE | `/api/jobs/:id` | Owner only | Cancel/delete job |

### Proposals
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/jobs/:jobId/proposals` | Freelancer only | Submit proposal |
| GET | `/api/jobs/:jobId/proposals` | Job owner only | List proposals for a job |
| GET | `/api/proposals/me` | Freelancer only | My submitted proposals |
| PATCH | `/api/proposals/:id/accept` | Job owner only | Accept proposal |
| PATCH | `/api/proposals/:id/reject` | Job owner only | Reject proposal |
| DELETE | `/api/proposals/:id` | Proposal owner only | Withdraw proposal |

### Milestones
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/jobs/:jobId/milestones` | Job owner only | Define milestone |
| POST | `/api/milestones/:id/submit` | Hired freelancer only | Submit deliverable |
| PATCH | `/api/milestones/:id/approve` | Job owner only | Approve milestone |
| PATCH | `/api/milestones/:id/request-revision` | Job owner only | Request changes |

### Reviews
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/jobs/:jobId/reviews` | Participant only | Leave review (post-completion) |
| GET | `/api/users/:id/reviews` | Public | List reviews for a user |

### Messages
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/jobs/:jobId/messages` | Participant only | Thread history |
| POST | `/api/jobs/:jobId/messages` | Participant only | Send message |

### Notifications
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/notifications` | Protected | List (paginated) |
| PATCH | `/api/notifications/:id/read` | Owner only | Mark read |

### Admin
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin only | Platform statistics |
| GET | `/api/admin/users` | Admin only | List/search all users |
| PATCH | `/api/admin/users/:id/ban` | Admin only | Ban/unban user |
| GET | `/api/admin/jobs` | Admin only | List/moderate all jobs |
| DELETE | `/api/admin/jobs/:id` | Admin only | Remove flagged job |

---

## 6. Authentication & Authorization Design

- **Access token:** short-lived JWT (~15 min), sent in `Authorization: Bearer` header, holds `{ userId, role }`.
- **Refresh token:** longer-lived, stored as httpOnly secure cookie + hashed copy in `users.refreshTokens`, rotated on every use (prevents replay).
- **Authorization layers:**
  1. `authenticate` middleware — verifies JWT, loads user, attaches `req.user`.
  2. `requireRole(role)` middleware — for admin-only routes.
  3. **Ownership checks** live in the *service layer*, not middleware — e.g., "is `req.user._id` the client who owns this job?" — because ownership rules are resource-specific business logic, not a generic gate.

---

## 7. Security Considerations
- Passwords: bcrypt, cost factor 10-12.
- Rate limiting: stricter limits on `/auth/*` and proposal submission (prevent spam/brute force).
- Validation: every write endpoint validates body shape/types before touching the service layer.
- CORS: locked to frontend origin(s) only, not `*`.
- Helmet: standard secure headers.
- Error responses: never leak stack traces, DB errors, or internal paths in production; use consistent `{ success, message, errors }` shape.

---

## 8. Error Handling Design
- Custom `AppError` class (statusCode + message) thrown from services.
- Centralized error middleware at the end of the Express pipeline catches all errors (including unexpected ones) and formats a consistent JSON response.
- Validation errors return `400` with field-level messages; auth errors `401`/`403`; not found `404`; server errors `500` (generic message to client, full detail logged server-side).

---

## 9. File Upload Design
- Multer for handling multipart uploads (profile images, milestone deliverables).
- MVP: local disk storage under `/uploads`, served statically — noted in PRD as fine for now, with S3 swap-in as a documented "production consideration" in Phase 11.
- File type/size validation at middleware level before hitting disk.

---

## 10. Notification Design
- Notifications are generated server-side inside services (e.g., `proposalService.accept()` creates a `notification` doc for the freelancer) — not a separate polling job.
- MVP: in-app only, fetched via `/api/notifications`; frontend polls or fetches on page load/interval. Real-time push (WebSocket/SSE) is a Phase 9 stretch feature.

---

## Progress Tracker

```text
PHASE 1  — Planning              ◄ IN PROGRESS (Design Doc drafted, pending your review)
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
