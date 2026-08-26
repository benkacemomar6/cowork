# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CoWork is a freelance job marketplace (clients post jobs, freelancers submit proposals, hired freelancers deliver work through milestones, both sides leave reviews). Only the backend (`server/`) exists so far — `client/` is an empty placeholder for a React (Vite) frontend that hasn't been started.

Full product/architecture spec lives in the repo root:
- `CoWork-PRD (1).md` — features, personas, entities, phase roadmap
- `CoWork-Design-Doc (1).md` — architecture, DB schema, API endpoint map, state machines (marked as a draft the docs themselves say to revise against real user stories — don't treat it as gospel over what the code actually does)
- `PROJECT-STATUS.md` — living snapshot of what's implemented, what's broken, and what's not started; check this before assuming a feature is done

## Commands

```bash
cd server
npm install
node server.js          # runs on process.env.PORT, requires .env (see .env.example: PORT, MONGO_URI, JWT_SECRET)
```

There is no lint, build, or test setup — `npm test` is an unconfigured stub (`"Error: no test specified"`) and `server/tests/` is empty. Don't assume a test runner exists; verify changes by requiring the module directly (`node -e "require('./path/to/file')"`) or `node --check <file>` for a syntax pass.

## Architecture

Strict layering, enforced by convention (not by tooling) throughout `server/src/`:

```
route → authenticate/requireRole middleware → controller → service → Mongoose model
```

- **Routes** (`routes/`) only map HTTP verb+path to a controller function and attach middleware. No logic.
- **Controllers** (`controllers/`) parse `req`, call exactly one service function, shape the HTTP response. No business rules, no direct model access.
- **Services** (`services/`) hold all business logic **and ownership/authorization checks** — e.g. "is this user the client who owns this job?" is checked in `jobService.updateJob`, not in middleware. `requireRole` middleware only gates by *role* (client/freelancer/admin); resource-level ownership is always a service-layer check that throws `AppError` (404/403) when it fails.
- **Models** (`models/`) are plain Mongoose schemas, one collection per entity, all timestamped, referencing each other by ObjectId (no embedding) — see Design Doc §4.2 for why.

Errors: every service throws `new AppError(message, statusCode)` (`utils/AppError.js`); every controller wraps its body in try/catch and calls `next(error)`; a single `errorHandler` middleware at the end of the Express pipeline in `server.js` formats the final `{success, message}` response. Follow this pattern for any new endpoint rather than introducing a different error shape.

**Nested resource routing pattern**: some resources are reachable under two different mount points with `{ mergeParams: true }` routers — e.g. proposals are both `POST /api/jobs/:jobId/proposals` (`routes/jobProposalRoutes.js`) and `PATCH /api/proposals/:id/accept` (`routes/proposalRoutes.js`), both backed by the same `controllers/proposalControllers.js`. Same pattern for milestones (`jobMilestoneRoutes.js` + `milestoneRoutes.js`). When adding a route to one of these resources, check both route files — the controller function needed may already exist and just need wiring, or you may need to add it to both mount points depending on whether it's job-scoped or resource-scoped.

**Auth**: JWT access token only right now (`Authorization: Bearer <token>`, 15 min expiry, payload `{ userId, role }`, verified in `middleware/authMiddleware.js`). No refresh tokens, email verification, or password reset yet despite being in the PRD — don't assume they exist.

**Field naming quirk**: the Design Doc's schema draft uses `job`/`freelancer` as reference field names; the actual models use `jobId`/`freelancerId` instead (see `models/proposalModel.js`, `models/milestoneModel.js`). This is consistent within the code — just don't cross-reference the design doc's field names literally when writing queries.

Check `PROJECT-STATUS.md` for the current list of known bugs and unfinished verticals (notifications, messaging, validation layer, rate limiting/helmet/CORS wiring) before building on top of a service — some functions in `services/` are stubs or have open correctness issues that are already tracked there rather than repeated here.
