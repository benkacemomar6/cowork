# CoWork — Project Status & Handoff

**Purpose of this file:** a snapshot of the CoWork backend as of 2026-08-18 (updated same day after a bugfix pass), meant to be pasted into a fresh Claude conversation so work can continue without losing context. Reference docs already in the repo root: `CoWork-PRD (1).md`, `CoWork-Design-Doc (1).md`.

---

## 1. Progress vs. the PRD phase tracker

| Phase | Status |
|---|---|
| 1 — Planning | Done (PRD + Design Doc drafted) |
| 2 — Project Setup | Done (Express + Mongoose skeleton running) |
| 3 — Database | Models exist for all 7 entities, some field names drifted from the design doc (see §3) |
| 4 — Backend | Auth / Jobs / Proposals / Milestones / Admin / Reviews are all wired end-to-end now |
| 5 — Authentication | Partial: register/login only, no refresh tokens, no email verification, no password reset |
| 6 — Core Features | Jobs, Proposals, Milestones functional. Messaging and Notifications not started |
| 7 — Frontend | **Not started** — `client/` is an empty folder |
| 8 — Admin | Fixed and reachable at `/api/admin/*` (see §3) |
| 9–12 | Not started |

---

## 2. What works today

- **Auth** (`authService.js`, `authController.js`, `authRoutes.js`): register (bcrypt hash, dupe-email check) and login (JWT, 15 min expiry, `{userId, role}` payload). `GET /api/auth/me` for a quick auth check.
- **Jobs** (`jobService.js` / `jobController.js` / `jobRoutes.js`): create, paginated list, get-by-id, update, delete — ownership enforced in the service layer (matches the design doc's "ownership lives in services, not middleware" rule).
- **Proposals** (`proposalService.js` / `proposalControllers.js` / `proposalRoutes.js` + `jobProposalRoutes.js`): submit, list-for-job (owner only), list-mine, accept (auto-rejects sibling proposals + flips job to `in_progress`), reject, withdraw. Status machine matches the PRD draft.
- **Milestones** (`MilestonesServices.js` / `milestoneControllers.js` / `milestoneRoutes.js` + `jobMilestoneRoutes.js`): create (client, job must be `in_progress`), submit (hired freelancer only), approve, request-revision. Ownership/status checks all present.
- **Error handling**: `AppError` + centralized `errorHandler` middleware, consistent `{success, message}` shape.
- **Admin** (`adminService.js` / `adminControllers.js` / `adminRoutes.js`, mounted at `/api/admin`, admin-role only): `GET /stats`, `GET /users`, `GET /users/:userId`, `PATCH /users/:userId/ban`, `GET /jobs`, `PATCH /jobs/:jobId/moderate`, `DELETE /jobs/:jobId`.
- **Reviews** (`ReviewsService.js` / `rewieontroler.js` / `reviewRoutes.js`, mounted at `/api/reviews`): `GET /me` (reviews received by the current user), `POST /:jobId` (leave a review, participant-only check enforced in the service).

---

## 3. Bugs found in this review

**Fixed (2026-08-18, bugfix pass):**

1. ~~`server/src/controllers/rewieontroler.js` — `create()` unfinished, no `module.exports`~~ → finished (`jobId` from params, `reviewerId` from `req.user`, `revieweeId`/`rating`/`comment` from body) and exports added.
2. ~~`server/src/services/ReviewsService.js` — `createReview()` recursively called itself, field-name mismatch, returned nothing~~ → recursion removed, now creates against `reviewer`/`reviewee` (matching the model) and returns the created review. Also fixed a related authorization bug while in there: the freelancer-side check compared `job.acceptedProposal` (a Proposal id) directly to the reviewer's user id, which could never match — it now loads the accepted proposal and compares its `freelancerId`.
3. ~~Case-sensitive `require('../utils/appError')` in `ReviewsService.js` / `adminService.js`~~ → corrected to `AppError` in both files.
4. ~~`adminService.js` — `jobModel` used but never imported~~ → import added.
5. ~~`adminService.js` — `platfomStat()` unfinished stub~~ → implemented, returns `{ totalUsers, totalJobs, completedJobs }`.
6. ~~`adminControllers.js` — no `module.exports`~~ → added, plus a new `stats` handler wired to `platfomStat()`.
7. ~~No routes wired for Admin or Reviews~~ → `adminRoutes.js` and `reviewRoutes.js` created and mounted in `server.js` (`/api/admin`, `/api/reviews`).

All of the above were verified with `node --check` and by requiring each touched module directly (no runtime import errors). Not yet committed to git.

**Still open (user will review separately):**

8. **`authMiddleware.js`** — `authenticate()` does `req.headers.authorization.split(" ")[1]` without checking the header exists. A request with no `Authorization` header throws a `TypeError`, which Express forwards to the generic error handler — client gets a `500 "something went wrong"` instead of a clean `401 "not token provided"`.
9. **Naming drift vs. design doc**: the schema doc specifies `job`/`freelancer` reference fields on proposals/milestones; the actual models use `jobId`/`freelancerId`. Internally consistent, but worth reconciling before writing more docs/tests against the design doc as written.

---

## 4. Not started yet (per PRD §4.1 / Design Doc)

- Email verification, password reset, refresh-token rotation (only bare register/login exist)
- Messaging (`messageModel.js` exists; no service/controller/routes)
- Notifications (`notificationModel.js` exists; nothing currently *creates* a notification — design doc §10 expects e.g. `proposalService.accept()` to create one)
- Rate limiting, `helmet`, CORS config (Design Doc §7) — none present in `server.js`
- Request validation layer (Joi/express-validator) — no `validators/` folder, no validation running anywhere
- File uploads (profile image, milestone deliverable) — no `multer` setup
- Frontend — entirely unstarted
- Tests — `server/tests/` is empty

---

## 5. Uncommitted work (as of now)

Last commit: `de6c4ff Add proposal service layer: submit, list, accept, reject, withdraw`. Everything below is **uncommitted** (includes the bugfix pass):

- Modified: `server.js`, `proposalControllers.js`, `proposalRoutes.js`, `proposalService.js`
- Untracked: `adminControllers.js`, `milestoneControllers.js`, `rewieontroler.js`, `jobMilestoneRoutes.js`, `jobProposalRoutes.js`, `milestoneRoutes.js`, `adminRoutes.js`, `reviewRoutes.js`, `MilestonesServices.js`, `ReviewsService.js`, `adminService.js`, `PROJECT-STATUS.md`

---

## 6. Suggested next steps

1. Review/decide on the two still-open items in §3 (auth header check, `job`/`freelancer` naming drift).
2. Add the validation middleware layer (Design Doc §2.3 pipeline expects it).
3. Add notification-creation calls where the design doc specifies (proposal accept/reject, milestone submit/approve).
4. Add rate limiting / `helmet` / CORS config to `server.js` (Design Doc §7).
5. Commit current work — nothing since `de6c4ff` is saved, and it now includes a full bugfix pass on top of the new Admin/Milestone/Review verticals.
6. Only after the above: start Phase 7 (frontend), which hasn't begun.
