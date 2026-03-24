# Lexora Backend Context

## Overview

Lexora is a Node.js + Express + TypeScript backend for contract lifecycle workflows, including:
- authentication and authorization
- contract drafting and template generation
- clause library management
- AI-assisted chat/review/editor helpers
- signature request and signing flows
- dashboard metrics and activity tracking

## Stack

- Runtime: Node.js 20
- Framework: Express 4
- Language: TypeScript
- Database: MongoDB with Mongoose
- Auth: JWT (RS256) and Google OAuth (Passport)
- AI: Google Gemini
- Email: Resend
- File/Media: Multer, Sharp, optional Cloudinary
- Docs: Swagger UI (`/api-docs`) with a full OpenAPI 3 spec in `src/docs/`

## Project Structure

- `src/index.ts`: process bootstrap, MongoDB connection, server lifecycle
- `src/app.ts`: middleware and route wiring
- `src/config`: configuration, logger, passport, swagger entry (`swagger.ts` → OpenAPI doc)
- `src/docs`: **authoritative API reference** — `openapi.document.ts`, `openapi.paths.ts`, `openapi.components.ts` (edit these to change Swagger)
- `src/routes/v1`: route definitions by domain
- `src/controllers`: request handlers
- `src/services`: business logic
- `src/models`: Mongoose schemas/models and plugins
- `src/validations`: Joi request validation schemas
- `src/middlewares`: auth, validation, error handling, limits, upload
- `src/utils`: generic helpers and domain error classes

## Request Flow

1. Request enters route in `src/routes/v1/*`
2. Optional auth middleware (`authenticate`) and payload validation (`validate`)
3. Controller method executes (`src/controllers/*`)
4. Controller calls service (`src/services/*`)
5. Service reads/writes model (`src/models/*`)
6. Response emitted, or domain errors normalized by error middleware

## API Response Contract

- Success responses use a consistent envelope: `{ success: true, data: ... }`
- List endpoints may include metadata (for example, `pagination`, `unreadCount`)
- Error responses use: `{ status, errors, requestId? }`
- Binary downloads (for example, contract exports) return file bytes instead of JSON

## Key Models

- `users`, `roles`, `permissions`, `tokens`
- `contracts`, `templates`, `clauses`
- `signature_requests`
- `ai_chat_sessions`, `ai_messages`
- `activities`, `notifications`

## API Groups

Base paths: `/api/v1` (frozen contract; deprecation headers optional via env) and `/api/v2` (currently mirrors v1; use for new clients before future breaking changes).

- `/health` (liveness: `GET /health`, deep probes: `GET /health/external`, readiness: `GET /health/ready`)
- `/auth`
- `/users`
- `/roles`
- `/images`
- `/notifications`
- `/contracts`
- `/templates`
- `/clauses`
- `/ai`
- `/dashboard`
- `/signatures`

Swagger UI: `/api-docs`

## Environment Notes

All environment keys are defined in `.env.example` and validated by `src/config/config.ts`.

Important deployment keys:
- `NODE_ENV`
- `HOST`
- `PORT`
- `DATABASE_URI`
- JWT keys (`JWT_ACCESS_TOKEN_SECRET_PRIVATE`, `JWT_ACCESS_TOKEN_SECRET_PUBLIC`, optional `JWT_ACCESS_TOKEN_KEY_ID`, optional `JWT_ACCESS_TOKEN_PUBLIC_KEYS_JSON` for multi-`kid` rotation)
- `CORS_ORIGIN`
- Email keys (`RESEND_API_KEY`, `EMAIL_FROM`)
- Optional: `RENDER_EXTERNAL_URL` (used as an external server URL option in Swagger docs)
- Optional: `API_V1_DEPRECATION_LINK`, `API_V1_SUNSET` — add `Deprecation` / `Link` / `Sunset` on all `/api/v1` responses when steering clients to v2
- Optional: `METRICS_ENABLED=true` — Prometheus metrics at `GET /metrics` (latency histogram + request counter by route template and status)
- Optional: `SENTRY_DSN` — 5xx exceptions reported with `requestId` tag (from `x-request-id` middleware)

### Auth tokens

- Access JWTs may include a `kid` header when `JWT_ACCESS_TOKEN_KEY_ID` is set; Passport resolves the public key via `jwtPublicKeys.ts` (primary + `JWT_ACCESS_TOKEN_PUBLIC_KEYS_JSON`).
- Refresh tokens use rotation: each use consumes the previous refresh; presenting a consumed refresh revokes the whole refresh family for that user (reuse detection).

## Render Deployment

Render blueprint is defined in `render.yaml`.

- Build: `npm ci && npm run build`
- Start: `npm run render:start`
- Health (liveness): `/api/v1/health`
- Readiness (Mongo + Email + Cloudinary when configured): `/api/v1/health/ready`
- Memory option set via `NODE_OPTIONS=--max-old-space-size=512`

### Uptime Monitoring

Use an external monitor instead of in-app self-ping:

- UptimeRobot or Better Stack monitor type: `HTTP(s)`
- URL: `https://<your-render-service>.onrender.com/api/v1/health`
- Interval: every 5-10 minutes
- Expected status code: `200`

## Security and Operational Conventions

- Never commit `.env` or private key files
- Use role/permission-based access checks via `authenticate(...)`
- Keep validation schemas aligned with route payloads
- Use `catchAsync` for async controllers to centralize error handling
- Keep model output normalized via `toJSON` plugin
