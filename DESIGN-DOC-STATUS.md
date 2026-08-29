# Design Doc vs. Actual Build

**Purpose:** section-by-section comparison of `CoWork-Design-Doc (1).md` against what's actually in `server/` and `client/` today. `PROJECT-STATUS.md` is now stale (it still says "frontend not started" and lists bugs already fixed) — this file supersedes it for "what's really built."

**Update:** the four items originally listed under "Worth fixing soonest" have since been fixed — `/` route, job auto-completion, the refresh-token interceptor, and the milestone list endpoint. Sections below are updated in place; a fresh "Worth fixing soonest" list is at the bottom.

Legend: ✅ matches doc · 🔄 built, but deviates from the doc · ❌ not built · ⚠️ partial

---

## 1. System Architecture

- React SPA + Express API + MongoDB — ✅ matches.
- File storage (local/S3) — ❌ not built. No multer, no `/uploads`. `profileImage`/`deliverableUrl` fields only ever hold a plain URL string you type in, never an uploaded file.
- Email service (verification/reset) — ❌ not built. No emails are ever sent.

## 2. Backend Architecture

- Folder structure (`config/`, `models/`, `routes/`, `controllers/`, `services/`, `middleware/`) — ✅ all present.
- `validators/` — ❌ doesn't exist. **No request validation anywhere** — every endpoint trusts `req.body` shape.
- `uploads/` — ❌ doesn't exist (consistent with no file upload).
- Doc wants a separate `src/app.js` (Express setup) + root `server.js` (entry point); actual code has one `server.js` doing both — 🔄 harmless structural simplification.
- Layer responsibilities (routes thin, controllers parse+call-one-service, services own business logic + ownership checks) — ✅ followed consistently across every vertical I checked (jobs, proposals, milestones, reviews, messages, notifications, admin, users).
- Middleware pipeline — doc wants `helmet → cors → rate-limiter → json → authenticate → authorize → validate → controller → errorHandler`. Actual: `json → cors → routes(authenticate/requireRole per-route) → errorHandler`.
  - `cors` — ✅ wired (you added this yourself, locked to `localhost:5173`, matches "not `*`").
  - `helmet` — ❌ it's in `package.json` but never `app.use()`'d. Dead dependency.
  - rate limiting — ❌ not installed at all, no package for it.
  - validation middleware — ❌ none, matches the `validators/` gap above.

## 3. Frontend Architecture

- Folder structure — `api/`, `components/`, `pages/`, `context/`, `routes/`, `utils/` all present.
- `layouts/` — ❌ doesn't exist (no shared page shells; each page repeats its own `.container` wrapper).
- `hooks/` — ❌ doesn't exist (no `useFetch`/`usePagination` extraction; each page has its own inline `useState`/`useEffect` fetch boilerplate).
- **Key Pages table** (doc's suggested routes vs. what actually exists):

| Doc's route | Status | Actual |
|---|---|---|
| `/` | ✅ | fixed — new `Home.jsx`: intro + login/register links when logged out, redirects to `/jobs` when logged in |
| `/login`, `/register` | ✅ | as specified |
| `/verify-email`, `/reset-password` | ❌ | correctly out of scope (you explicitly excluded these) |
| `/jobs` | ⚠️ | built, but search/filter/sort/pagination are all done **client-side** against up to 1000 fetched rows — the backend `GET /jobs` still only supports `page`/`limit` |
| `/jobs/:id` | ✅ | detail + proposal form, plus proposals/milestones/review/messages-link all folded in |
| `/dashboard` (role-aware) | 🔄 | split into separate `/my-jobs` (client) and `/my-proposals` (freelancer) instead of one unified page |
| `/jobs/:id/manage` | 🔄 | folded into `/jobs/:id` itself (conditionally shown to the owner) rather than a separate route |
| `/proposals/:id` | ❌ | no per-proposal detail page; milestone review happens inline on `/jobs/:id` instead |
| `/profile` | ✅ | plus `/profile/change-password` as its own sub-route |
| `/profile/:userId` | 🔄 | built as `/users/:id` instead |
| `/messages/:jobId` | 🔄 | built as `/messages?job=<id>` — and expanded into a real inbox (conversation list + thread) that the doc never speced, which is more complete than the draft |
| `/admin`, `/admin/users`, `/admin/jobs` | ❌ | not built (explicitly excluded by you) |

- State management: Auth via Context ✅ matches. Server state via plain per-page `useEffect`/`useState`, no React Query — ✅ this is literally the doc's own stated MVP fallback ("we'll evaluate whether plain hooks are sufficient"), so no deviation.

## 4. Database Design

| Collection | Match? | Notes |
|---|---|---|
| `users` | 🔄 | doc's `isBanned` is actually named `isBlocked`. Everything else (`bio`, `skills`, `profileImage`, `isVerified`, `refreshTokens`) matches. |
| `jobs` | ✅ | field names match doc exactly, including `client`, `budget{min,max,type}`, `status` enum, `acceptedProposal` |
| `proposals` | 🔄 | doc's `job`/`freelancer` are actually `jobId`/`freelancerId` (already documented in `CLAUDE.md`). Status enum matches. |
| `milestones` | 🔄 | same `jobId` drift. Status enum matches exactly. Doc's `submittedAt` field doesn't actually exist (only `approvedAt` + `updatedAt` timestamp). `deliverableUrl` exists and is now wired up (was dead before this session). |
| `reviews` | 🔄 | `jobId` drift again; `reviewer`/`reviewee` match |
| `messages` | 🔄 | doc's `sender`/`recipient` are actually `senderId`/`receiverId`; `isRead` + `readAt` both present (doc only asked for `readAt`) |
| `notifications` | 🔄 | doc's `user` is actually `userId`. Type enum has more values than the doc's abbreviated list (fine, doc used "..."). `link` field exists but nothing ever sets it. |

- References-not-embedding strategy — ✅ followed throughout.
- `.populate()` used for read-heavy views — ✅ used in reviews, and now in the new `my-conversations` endpoint.
- **Indexes (§4.3)** — ⚠️ only `users.email` has one (via `unique: true`). The compound indexes the doc calls for on `jobs.status+category`, `proposals.jobId+freelancerId`, `notifications.userId+isRead` don't exist. Not urgent at current data volume, but `JobList.jsx` pulling up to 1000 jobs client-side makes this worth revisiting before real scale.

### State machines (§4.4)

- **Proposal status** — ✅ fully matches: `pending→accepted` auto-flips the job to `in_progress` and auto-rejects sibling proposals; `pending→rejected`; `pending→withdrawn` (freelancer-only, pending-only guard). This is the best-implemented part of the whole doc.
- **Job status** — ✅ `open→in_progress` automated (via proposal accept). `in_progress→completed` is now also automated: `approveMilestone` (in `MilestonesServices.js`) checks after every approval whether the job has at least one milestone and all of them are `approved`, and if so flips `job.status` to `completed` and saves. The frontend refetches the job right after an approve so this shows up without a reload. The review feature is now reachable through normal use. `cancelled` is still ⚠️ unreached — no cancel action exists anywhere in the UI, only via a raw `PATCH /jobs/:id`.

## 5. API Design

Verticals not called out below (Proposals, Reviews, Notifications, Admin) match the doc's endpoint map exactly, including HTTP methods and auth requirements.

- **Auth**: register/login ✅. `logout` — ❌ still not built (no way to invalidate a refresh token). `refresh` — ✅ now actually used: `axios.js` has a response interceptor that catches a 401, calls `refresh` with the stored refresh token, retries the original request once with the new access token, and clears storage + redirects to `/login` if the refresh itself fails. Access tokens are still 1hr (not the doc's "~15 min" — `CLAUDE.md` also has that number wrong). `verify-email`/`forgot-password`/`reset-password` — ❌ correctly out of scope.
- **Users**: all doc'd capabilities exist, just under different paths: `/api/users/profile` (not `/me`), `/api/users/change-password` (not `/me/password`), `/api/users/avatar` (not `/me/avatar` — also accepts a raw URL string, no real upload), `/api/users/public/:userId` (not bare `/api/users/:id`). Bonus: `DELETE /api/users/account` exists, wasn't in the doc.
- **Jobs**: all 5 doc'd endpoints exist. Bonus: `GET /api/jobs/my-conversations` (Messages inbox) and `GET /api/jobs/:jobId/milestones` (see below), neither in the doc.
- **Milestones**: `submit` is `PATCH` not the doc's `POST`; `request-revision` is actually `PATCH /milestones/:id/revision` (no "request-" prefix). Functionally present either way. **A `GET /api/jobs/:jobId/milestones` now exists** (public, same access as viewing the job) — this gap existed in the design doc itself too, not just the implementation. `JobDetail.jsx`'s milestones list now fetches from it on load instead of only showing what was created/updated in the current browser session.

## 6. Auth & Authorization

- Access token JWT, `{userId, role}` payload, `Authorization: Bearer` — ✅.
- Access token lifetime — 🔄 actually **1 hour**, not the doc's (and `CLAUDE.md`'s) documented ~15 min.
- Refresh token — 🔄 **stored in `localStorage`, returned in the JSON response body** — not the doc's httpOnly cookie design. This is a real security gap (XSS-readable) versus what was speced; kept as-is deliberately (accepted tradeoff) while wiring up its actual usage. It's now functional at least: the axios response interceptor uses it to silently refresh an expired access token on a 401, retrying the original request once.
- `authenticate` + `requireRole` middleware — ✅ matches.
- Ownership checks living in the service layer, not middleware — ✅ followed with zero exceptions across every vertical checked.
- Not doc-specified, but worth noting: `AuthContext` gained an `updateUser()` method (updates the cached user object only, not the token) so `ProfileEdit.jsx` stops re-writing `localStorage`'s access token from a stale copy held in React state — a bug the refresh interceptor above would otherwise have silently reintroduced.

## 7. Security

- bcrypt, cost factor 10 — ✅ (within doc's 10–12 range).
- Rate limiting — ❌ not implemented.
- Request validation — ❌ not implemented.
- CORS locked to frontend origin — ✅.
- Helmet — ❌ installed, never wired.
- Consistent error shape `{success, message}` — ✅ for errors. For **successful** responses the doc doesn't mandate an envelope, but the actual code is internally inconsistent about it anyway: some return raw objects/arrays, some wrap `{success, data}`, milestones wrap `{status: 'success', data}` (different key than everywhere else).

## 8. Error Handling

- `AppError` class + centralized `errorHandler` — ✅ used everywhere.
- Bonus: `errorHandler` also special-cases Mongoose `ValidationError`/`CastError` into clean 400s — nice addition the doc didn't ask for.

## 9. File Upload

- ❌ Not built, by design — you explicitly deferred this ("Feature 1" of an earlier request was a plain URL field specifically *instead of* file upload).

## 10. Notifications

- Generated server-side inside services (not a polling job) — ✅ matches exactly; `proposalService` and `MilestonesServices` both call `createNotification` at the right trigger points.
- Frontend fetches on page load — ✅ (doc offered "polls or fetches on load" as two valid options; you chose fetch-on-load, no interval polling — both are sanctioned by the doc).
- Real-time push — ❌ correctly deferred (doc calls this a Phase 9 stretch goal).

## Progress Tracker — actual state

| Phase | Doc's status | Actual |
|---|---|---|
| 1 — Planning | "in progress" | ✅ Done |
| 2 — Project Setup | — | ✅ Done |
| 3 — Database | — | ⚠️ Schemas done, indexes missing |
| 4 — Backend | — | ⚠️ Mostly done — missing validation, rate limiting, helmet, uploads, logout endpoint |
| 5 — Authentication | — | ⚠️ Partial — no verify/reset/logout; refresh token still insecurely stored (localStorage), but now actually used via the axios interceptor |
| 6 — Core Features | — | ✅ End-to-end functional — jobs now reach `completed` automatically, milestones are listable and persist across reloads |
| 7 — Frontend | "not started" (stale) | ✅ Done — 14 pages, shared components, full design system, `/` route fixed. No `layouts/`/`hooks/` split |
| 8 — Admin | — | ⚠️ Backend done, frontend not built (by your choice) |
| 9 — Advanced Features | — | ❌ Not started (expected) |
| 10 — Testing | — | ❌ Not started, `tests/` is empty |
| 11 — Deployment | — | ❌ Not started |
| 12 — Documentation | — | ⚠️ `CLAUDE.md` current, `PROJECT-STATUS.md` stale |

## Fixed since the first pass

1. ✅ **`/` route** — `Home.jsx` added.
2. ✅ **Jobs reach `completed`** — automated in `approveMilestone`, review feature now reachable.
3. ✅ **Refresh token now used** — axios response interceptor retries once on 401.
4. ✅ **Milestone list endpoint** — `GET /api/jobs/:jobId/milestones`, public, `JobDetail.jsx` fetches from it on load.

## Worth fixing next

1. **Request validation layer** — still nothing between routes and services; every endpoint trusts `req.body`/`req.params` shape as-is.
2. **`helmet` wired but unused** — it's a dependency, never `app.use()`'d.
3. **No rate limiting** — `/auth/*` and proposal submission are unprotected against spam/brute force, matching the doc's own called-out concern.
4. **`logout` endpoint missing** — refresh tokens are never invalidated server-side, so a stolen one stays valid until it expires on its own (7d).
5. **No indexes beyond `users.email`** — `jobs.status+category`, `proposals.jobId+freelancerId`, `notifications.userId+isRead` are all still full collection scans. Not urgent yet, but `JobList.jsx` already pulls up to 1000 jobs client-side, so this is the next thing to feel slow.
6. **Job `cancelled` status is still unreachable** through any UI — same shape of gap as `completed` was, just not fixed yet.
