# Implementation plan – Lexora audit changes

Ordered by dependency and impact. Do phases in sequence; within a phase, tasks can often be done in parallel.

---

## Phase 1: Quick wins (no refactor)

**Goal:** Low-risk improvements that don’t change architecture.

| # | Task | Files to touch | Deliverable |
|---|------|-----------------|-------------|
| 1.1 | **Token model indexes** – Add compound `{ token, type }` and TTL on `expiresAt` | `src/models/tokenModel.ts` | Faster lookups; auto-cleanup of expired tokens |
| 1.2 | **User model index** – Add index on `roles` for list/filter by role | `src/models/userModel.ts` | Better query performance |
| 1.3 | **Image response shape** – Return `{ success: true, data: { image } }` | `src/controllers/imageController.ts` | Consistent API |
| 1.4 | **Health in production** – Return minimal payload when `NODE_ENV === 'production'` | `src/routes/v1/healthRoute.ts` | No DB details leaked |
| 1.5 | **Paginate plugin** – Allowlist for `sortBy`; cap `limit` (e.g. max 100) | `src/models/plugins/paginatePlugin.ts` | Safer, bounded queries |

**Exit criteria:** All above done; existing tests pass; manual smoke test of auth + one user/role route.

---

## Phase 2: Domain errors (prepare for service layer)

**Goal:** Models and shared code stop using HTTP types; controllers/services own status codes and APIError.

| # | Task | Files to touch | Deliverable |
|---|------|-----------------|-------------|
| 2.1 | **Domain errors** – Add a small set of domain error types (e.g. `NotFoundError`, `ConflictError`, `ValidationError`) in `src/utils/` or `src/errors/` | New: `src/utils/domainErrors.ts` (or `src/errors/index.ts`) | Reusable domain errors without HTTP status |
| 2.2 | **Map domain → API in error middleware** – In converter or a new mapper: domain errors → APIError + status | `src/middlewares/error.ts`, optionally `src/utils/domainErrors.ts` | Single place to turn domain errors into HTTP |
| 2.3 | **User model** – Replace `APIError` in statics with domain errors (or return `null`/throw domain errors); keep controller calling model and mapping to APIError until Phase 3 | `src/models/userModel.ts` | No `APIError` in user model |
| 2.4 | **Role model** – Same as user | `src/models/roleModel.ts` | No `APIError` in role model |
| 2.5 | **Token model** – Same; e.g. throw `NotFoundError` instead of APIError | `src/models/tokenModel.ts` | No `APIError` in token model |
| 2.6 | **Controllers** – Where they catch model calls, map domain errors to APIError and set status | `src/controllers/*.ts` | All HTTP semantics in controllers (or later in services) |

**Exit criteria:** No model imports `APIError`; all existing integration/unit tests pass; behavior unchanged from API consumer’s perspective.

---

## Phase 3: Service layer

**Goal:** Business logic and DB access live in services; controllers only handle HTTP (params, body, status, response shape).

| # | Task | Files to touch | Deliverable |
|---|------|----------------|-------------|
| 3.1 | **Auth service** – Signup, signin, refresh, verify-email, reset-password, forgot-password, Google callback | New: `src/services/authService.ts` | All auth flows in one place |
| 3.2 | **Auth controller** – Call auth service; map results/errors to status and `res.json(...)` | `src/controllers/authController.ts` | Thin auth controller |
| 3.3 | **User service** – Create, getById, getList (paginated), update, delete; “last Super Admin” check inside service | New: `src/services/userService.ts` | User CRUD + rules in service |
| 3.4 | **User controller** – Delegate to user service; set pagination and response shape | `src/controllers/userController.ts` | Thin user controller |
| 3.5 | **Role service** – Create, getById, getList, update, delete; “roles in use” check inside service | New: `src/services/roleService.ts` | Role CRUD + rules in service |
| 3.6 | **Role controller** – Delegate to role service | `src/controllers/roleController.ts` | Thin role controller |
| 3.7 | **Image/service storage** – Move resize + upload (Cloudinary vs local) into a service; controller only calls service and returns response | New: `src/services/imageService.ts` (or `storageService.ts`) | Single place for upload logic |
| 3.8 | **Image controller** – Call image/storage service; return `{ success: true, data: { image } }` | `src/controllers/imageController.ts` | Thin image controller |

**Exit criteria:** Controllers have no direct model calls for these flows; services are unit-testable; existing integration tests still pass (adjust only if response shape changed intentionally).

---

## Phase 4: Observability and safety

**Goal:** Better tracing and configurable limits.

| # | Task | Files to touch | Deliverable |
|---|------|----------------|-------------|
| 4.1 | **Request ID** – Middleware that sets `req.id` (e.g. UUID); add to error response and logger where applicable | New: `src/middlewares/requestId.ts`, `src/app.ts`, `src/middlewares/error.ts`, `src/config/morgan.ts` (optional) | Every request and error has an ID |
| 4.2 | **Rate limits from env** – Read global and auth rate-limit values from config (with defaults) | `src/config/config.ts`, `src/middlewares/rateLimiter.ts`, `src/middlewares/authRateLimiter.ts` | Tunable without code change |
| 4.3 | **Image permission (optional)** – If only certain roles should upload: add permission e.g. `image:create`, seed it, and use `authenticate('image:create')` on upload route | `src/config/initialData.ts`, `src/routes/v1/imageRoute.ts` | Upload restricted by RBAC if you want it |

**Exit criteria:** Request ID in error JSON and logs; rate limits configurable via env; image permission only if you chose to add it.

---

## Phase 5: Tests

**Goal:** Cover critical auth flows, RBAC, and main CRUD.

| # | Task | Files to touch | Deliverable |
|---|------|----------------|-------------|
| 5.1 | **Auth integration** – Refresh tokens, signout, verify-email, reset-password, forgot-password | `src/__tests__/auth.integration.test.ts` (or new auth flows file) | All main auth paths tested |
| 5.2 | **RBAC integration** – Requests to user/role routes with missing permission return 403 | New or extend: `src/__tests__/rbac.integration.test.ts` | RBAC behavior documented and guarded |
| 5.3 | **User CRUD integration** – Create, get, list, update, delete (with proper auth) | e.g. `src/__tests__/user.integration.test.ts` | User API covered |
| 5.4 | **Role CRUD integration** – Same for roles | e.g. `src/__tests__/role.integration.test.ts` | Role API covered |
| 5.5 | **Image upload** – Success and failure (no file, invalid type) | e.g. `src/__tests__/image.integration.test.ts` | Upload behavior covered |
| 5.6 | **Service unit tests (optional)** – tokenService, jwtService | New: `src/services/__tests__/tokenService.test.ts`, `jwtService.test.ts` | Critical services unit-tested |

**Exit criteria:** New integration tests pass; run full suite before releases.

---

## Phase 6: Polish

**Goal:** Validation hardening, seed safety, CI.

| # | Task | Files to touch | Deliverable |
|---|------|----------------|-------------|
| 6.1 | **Validation** – Max lengths for name/description; consistent password rules (signup vs user create/update) | `src/validations/authValidation.ts`, `src/validations/userValidation.ts`, `src/validations/roleValidation.ts` | Bounded input; same password rules everywhere |
| 6.2 | **Seed data** – Strong default passwords or env-based when seeding users (non-production only) | `src/config/initialData.ts`, optionally `src/config/config.ts` | Safer local/dev seeds |
| 6.3 | **CI script** – Build + health-check smoke test (e.g. `npm run build && node dist/index.js` in background, curl GET health, kill) | `package.json` (e.g. `scripts.ci` or `scripts.smoke`), optional CI config | CI can run build + smoke test |

**Exit criteria:** Validations updated; seed behavior documented; CI (or local) can run build + smoke.

---

## Dependency overview

```
Phase 1 (quick wins)     →  no dependency
Phase 2 (domain errors)  →  no dependency on Phase 1, but doing 1 first is simpler
Phase 3 (services)      →  best after Phase 2 (so services throw domain errors, not APIError)
Phase 4 (observability) →  independent; can run after 1 or in parallel with 2/3
Phase 5 (tests)         →  after 2 and 3 (test services + controllers)
Phase 6 (polish)        →  any time after 1; validation/seed before or with 5
```

**Suggested order:**  
**1 → 2 → 3 → 5** (then 4 and 6 as you have time), or **1 → 4 → 2 → 3 → 5 → 6** if you want request ID and configurable limits early.

---

## Checklist (copy and tick as you go)

**Phase 1**  
- [x] 1.1 Token indexes  
- [x] 1.2 User index on roles  
- [x] 1.3 Image response shape  
- [x] 1.4 Health minimal in production  
- [x] 1.5 Paginate allowlist + limit cap  

**Phase 2**  
- [x] 2.1 Domain errors module  
- [x] 2.2 Map domain → APIError in middleware  
- [x] 2.3 User model no APIError  
- [x] 2.4 Role model no APIError  
- [x] 2.5 Token model no APIError  
- [x] 2.6 Controllers map domain errors  

**Phase 3**  
- [x] 3.1 Auth service  
- [x] 3.2 Auth controller thin  
- [x] 3.3 User service  
- [x] 3.4 User controller thin  
- [x] 3.5 Role service  
- [x] 3.6 Role controller thin  
- [x] 3.7 Image/storage service  
- [x] 3.8 Image controller thin  

**Phase 4**  
- [x] 4.1 Request ID middleware  
- [x] 4.2 Rate limits from env  
- [x] 4.3 Image permission (optional)  

**Phase 5**  
- [x] 5.1 Auth flows integration tests  
- [x] 5.2 RBAC integration tests  
- [x] 5.3 User CRUD integration tests  
- [x] 5.4 Role CRUD integration tests  
- [x] 5.5 Image upload tests  
- [x] 5.6 Service unit tests (optional)  

**Phase 6**  
- [x] 6.1 Validation max lengths + password consistency  
- [x] 6.2 Seed data safety  
- [x] 6.3 CI build + smoke script  
