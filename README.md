# Lexora Backend

REST API for **Lexora**—contract lifecycle workflows: drafting, templates, clauses, signatures, dashboard metrics, and AI-assisted features backed by Google Gemini. Built with **Node.js 20**, **Express 4**, **TypeScript**, and **MongoDB** (Mongoose).

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [JWT keys (RS256)](#jwt-keys-rs256)
- [Running locally](#running-locally)
- [Production & deployment](#production--deployment)
- [API documentation](#api-documentation)
- [Authentication](#authentication)
- [Email (Resend)](#email-resend)
- [Health & observability](#health--observability)
- [Background jobs](#background-jobs)
- [Testing & CI](#testing--ci)
- [Project structure](#project-structure)
- [License](#license)

## Features

- **Auth** — Email/password signup and sign-in, JWT access tokens (RS256), rotating refresh tokens, optional **Google OAuth** (`GET /api/v1/auth/google`), forgot/reset password, email verification (Resend).
- **Users & RBAC** — Users, roles, permissions; protected routes via `authenticate(...)`.
- **Contracts** — Contract CRUD and related flows (see OpenAPI).
- **Templates & clauses** — Reusable templates and clause library.
- **Signatures** — Signature request and signing flows.
- **AI** — Chat/editor helpers using **Google Gemini** when `GEMINI_API_KEY` is set.
- **Dashboard** — Aggregated metrics and activity-oriented endpoints.
- **Notifications** — In-app notifications.
- **Images** — Upload with optional **Cloudinary**; falls back to local storage when Cloudinary is unset.
- **API versioning** — `/api/v1` (stable contract; optional deprecation headers) and `/api/v2` (forward path for new clients).

## Tech stack

| Layer | Choice |
|--------|--------|
| Runtime | Node.js **20.x** |
| Framework | Express 4 |
| Language | TypeScript |
| Database | MongoDB + Mongoose 6 |
| Auth | Passport (JWT + Google OAuth20), bcrypt |
| Email | Resend |
| AI | `@google/generative-ai` (Gemini) |
| Validation | Joi |
| Docs | Swagger UI + OpenAPI 3 (`src/docs/`) |
| Errors / logs | Custom API errors, Winston, optional Sentry |

## Prerequisites

- **Node.js 20.x** (matches `package.json` `engines` and Docker image)
- **MongoDB** (local or Atlas URI)
- Optional: **Resend** account (transactional email), **Cloudinary** (media), **Google Cloud** OAuth + Gemini keys for those features

## Getting started

1. **Clone and install**

   ```bash
   git clone <your-repo-url> lexora
   cd lexora
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` (see [Environment variables](#environment-variables)). At minimum you need: `NODE_ENV`, `DATABASE_URI`, and base64-encoded RS256 JWT keys.

3. **Generate JWT keys** (if you do not have them yet) — see [JWT keys (RS256)](#jwt-keys-rs256).

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   The app listens on `HOST`/`PORT` from `.env` (defaults `0.0.0.0:8080` per `.env.example`).

5. **Open API docs**

   - Swagger UI: `http://localhost:8080/api-docs` (adjust host/port)

## Environment variables

All variables are validated at startup in `src/config/config.ts`. **`.env.example`** is the authoritative template with comments.

### Required (typical)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` \| `production` \| `test` |
| `DATABASE_URI` | MongoDB connection string |
| `JWT_ACCESS_TOKEN_SECRET_PRIVATE` | Base64-encoded **PEM private key** (RS256) |
| `JWT_ACCESS_TOKEN_SECRET_PUBLIC` | Base64-encoded **PEM public key** (RS256) |

### Common optional

| Variable | Description |
|----------|-------------|
| `APP_NAME` | Shown in emails and templates; default `App Name` |
| `HOST` / `PORT` | Bind address and port |
| `FRONTEND_URL` | Used in verification/reset links (`/verify-email`, `/reset-password`) |
| `IMAGE_URL` | Base URL for resolving relative avatar/image paths |
| `CORS_ORIGIN` | `*` or comma-separated origins (prefer explicit origins in production) |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender, e.g. `noreply@yourdomain.com` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Enable Google sign-in when both set |
| `CLOUDINARY_*` | Optional image CDN |
| `GEMINI_API_KEY` | Enables AI routes that need Gemini |
| `GEMINI_HEALTH_LIVE_PROBE` | If `true`, `/api/v1/health/external` may call Gemini (uses quota) |
| `SEED_DATABASE` | Seed permissions/roles (and dev users in dev/test only)—never with default passwords in production |
| `JWT_ACCESS_TOKEN_KEY_ID` | Optional `kid` for JWT header |
| `JWT_ACCESS_TOKEN_PUBLIC_KEYS_JSON` | Optional map of past public keys for rotation |
| `API_V1_DEPRECATION_LINK` / `API_V1_SUNSET` | RFC-style deprecation hints on `/api/v1` |
| `METRICS_ENABLED` | Expose `GET /metrics` (Prometheus) |
| `SENTRY_DSN` | Error reporting |
| `SHUTDOWN_GRACE_MS` / `SHUTDOWN_BACKGROUND_DRAIN_MS` | Graceful shutdown tuning |

For full comments and defaults, open **`.env.example`**.

## JWT keys (RS256)

Access tokens are signed with RS256. Store keys as **single-line base64** of the PEM files in `.env`.

Example (macOS/Linux):

```bash
ssh-keygen -t rsa -P "" -b 2048 -m PEM -f jwt.key
ssh-keygen -e -m PEM -f jwt.key > jwt.key.pub
# PEM → base64 single line (no newlines in the env value)
base64 < jwt.key | tr -d '\n'    # → JWT_ACCESS_TOKEN_SECRET_PRIVATE
base64 < jwt.key.pub | tr -d '\n' # → JWT_ACCESS_TOKEN_SECRET_PUBLIC
```

Paste the outputs into `.env` (no quotes required unless your tooling needs them).

## Running locally

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development: nodemon + ts-node, watches `src/` |
| `npm start` | Alias to `npm run dev` |
| `npm run build` | Compile TypeScript to `dist/` and rewrite paths (`tsc-alias`) |
| `npm run prod` | Run compiled app with PM2 (`ecosystem.config.js`) |
| `npm run render:start` | Production entry for Render: `node dist/index.js` |
| `npm run lint` | ESLint on `src/**/*.ts` |
| `npm test` | Jest |
| `npm run smoke` | Build + smoke script (`scripts/smoke.mjs`) |
| `npm run ci` | `lint` + `test` + `smoke` |

## Production & deployment

### Docker

Multi-stage `Dockerfile`: builds with `npm ci` + `npm run build`, runs `node dist/index.js` as non-root user.

```bash
docker build -t lexora-api .
docker run --env-file .env -p 8080:8080 lexora-api
```

Ensure `PORT` inside the container matches the published port if you override it.

### Render

`render.yaml` defines a web service:

- **Build:** `npm ci && npm run build`
- **Start:** `npm run render:start`
- **Health check path:** `/api/v1/health`

Set secrets in the Render dashboard: `DATABASE_URI`, JWT keys, `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL`, etc. Render injects `PORT`; keep `HOST=0.0.0.0` and `NODE_ENV=production`.

### Process managers

`Procfile` uses `npm run prod` (PM2). Alternatively run `node dist/index.js` after `npm run build` and `npm ci --omit=dev`.

## API documentation

- **Swagger UI:** `GET /api-docs`
- **OpenAPI source of truth:** `src/docs/` (`openapi.document.ts`, `openapi.paths.ts`, `openapi.components.ts`)

API base paths:

- **`/api/v1`** — Primary version; optional deprecation headers when env vars are set
- **`/api/v2`** — Mounted for forward-compatible clients (implementation lives under `src/routes/v2/`)

### Route groups (v1)

| Mount | Domain |
|-------|--------|
| `/api/v1/health` | Liveness, readiness, external probes |
| `/api/v1/auth` | Signup, sign-in, tokens, OAuth, verification, password reset |
| `/api/v1/users` | Users |
| `/api/v1/roles` | Roles |
| `/api/v1/images` | Uploads |
| `/api/v1/notifications` | Notifications |
| `/api/v1/contracts` | Contracts |
| `/api/v1/templates` | Templates |
| `/api/v1/clauses` | Clauses |
| `/api/v1/ai` | AI endpoints (Gemini) |
| `/api/v1/dashboard` | Dashboard |
| `/api/v1/signatures` | Signatures |
| `/api/v1/jobs` | Job triggers / status (see handlers in `src/config/jobHandlers.ts`) |

Exact paths and schemas are in Swagger—prefer `/api-docs` over duplicating every route here.

## Authentication

1. **Signup** — `POST /api/v1/auth/signup` returns user + access/refresh tokens. If Resend is configured, a **verification email** is sent automatically (HTML template + link to `FRONTEND_URL/verify-email?token=...`).
2. **Sign-in** — `POST /api/v1/auth/signin`
3. **Refresh** — `POST /api/v1/auth/refresh-tokens` with refresh token body (see OpenAPI)
4. **Bearer access token** — Send `Authorization: Bearer <accessToken>` for protected routes (`authenticate()` middleware).
5. **Google** — `GET /api/v1/auth/google` → callback `GET /api/v1/auth/google/callback` (requires OAuth env vars).

Refresh tokens use **rotation**; reuse of a consumed refresh token revokes the family for that user.

## Email (Resend)

- Set `RESEND_API_KEY` and `EMAIL_FROM` (must be allowed by your Resend account—verified domain or onboarding rules).
- **From** header format: `{APP_NAME} <{EMAIL_FROM}>`.
- If Resend is not configured, signup still succeeds but transactional email calls are skipped (with logs).
- Manual resend: `POST /api/v1/auth/send-verification-email` (authenticated).

## Health & observability

| Route | Role |
|-------|------|
| `GET /api/v1/health` | Liveness (responds; DB state in non-production JSON) |
| `GET /api/v1/health/ready` | Readiness: MongoDB ping, email config probe, Cloudinary when configured |
| `GET /api/v1/health/external` | External deps (e.g. Gemini key / optional live probe) |
| `GET /metrics` | Prometheus scrape endpoint when `METRICS_ENABLED=true` |

## Background jobs

In-process queue with handlers registered in `src/config/jobHandlers.ts`. Job-related routes under `/api/v1/jobs`. See OpenAPI and service code for available operations.

## Testing & CI

```bash
npm run test        # Jest
npm run test:watch  # Watch mode
npm run ci          # lint + test + smoke
```

- Many **unit-style** tests need no MongoDB.
- **Auth integration** tests may require a `.env` with valid JWT-derived keys or are skipped if unset.
- **`SEED_DATABASE`:** use only in safe environments; never enable in production with default dev passwords.

## Project structure

```
src/
  app.ts              # Express app: middleware, /api/v1, /api/v2, Swagger, errors
  index.ts            # Mongo connect, listen, graceful shutdown hooks
  config/             # config (Joi env), logger, passport, swagger, initialData, jobs, sentry
  controllers/        # HTTP handlers
  docs/               # OpenAPI document + paths + components
  middlewares/        # auth, validate, rate limits, metrics, errors, request id, ...
  models/             # Mongoose schemas
  routes/
    v1/               # Version 1 routers
    v2/               # Version 2 router
  services/           # Business logic (auth, email/Resend, AI, contracts, …)
  validations/        # Joi schemas for requests
  utils/              # Helpers, domain errors, graceful shutdown, …
public/               # Static files
scripts/              # smoke.mjs and tooling
storage/              # Local uploads / assets as configured
```

## License

[MIT](LICENSE)
