# Lexora

Full-stack contract lifecycle management platform with AI-powered drafting, review, and analysis. Built as a **pnpm monorepo** with a **Next.js 14** frontend and an **Express 4** backend, backed by **MongoDB** and **Google Gemini** (with optional local Ollama fallback).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [JWT Keys (RS256)](#jwt-keys-rs256)
- [Running Locally](#running-locally)
- [AI Features](#ai-features)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Production & Deployment](#production--deployment)
- [Project Structure](#project-structure)
- [License](#license)

## Features

### Core
- **Contract CRUD** — Create, edit, view, and manage contracts with a rich BlockNote editor
- **Templates** — Start from reusable contract templates (NDA, Vendor Agreement, Consulting, Employment, MSA)
- **Clause Library** — Browse, search, and insert standard clauses into contracts
- **Variables** — Detect `{{placeholders}}` in contracts and fill them inline
- **Signatures** — Request and collect digital signatures on contracts
- **Export** — Download contracts as PDF, DOCX, Markdown, or HTML
- **Sharing** — Share contracts with collaborators via link or invitation

### AI-Powered
- **Chat with Contract** — Ask questions about any contract; answers are grounded with line-level citations using a PageIndex-style hierarchical tree index (no vector DB)
- **AI Review** — Scan contracts for risks, missing clauses, inconsistencies, and improvement suggestions with severity levels
- **Rewrite** — Rewrite selected text in formal, friendly, or concise tone
- **Explain Clause** — Get plain-language explanations of complex legal clauses
- **Summarize** — Generate structured contract summaries covering parties, obligations, terms, and key conditions
- **Generate Clause** — Create new clauses from natural language prompts (e.g., "Add a force majeure clause")
- **Suggest Clauses** — Analyze a contract and recommend missing clauses with reasoning and ready-to-insert text
- **Contract Generation** — Generate complete contracts from a prompt via streaming

### Platform
- **Auth** — Email/password signup, JWT access tokens (RS256), rotating refresh tokens, Google OAuth, forgot/reset password, email verification via Resend
- **RBAC** — Users, roles, and permissions with protected routes
- **Dashboard** — Aggregated metrics and activity feed
- **Notifications** — In-app notification system
- **Image Uploads** — Cloudinary or local storage fallback

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Monorepo** | pnpm workspaces |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Editor** | BlockNote (Tiptap-based rich text editor) |
| **Backend** | Node.js 20, Express 4, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Auth** | Passport (JWT RS256 + Google OAuth), bcrypt |
| **AI** | Google Gemini (`gemini-3-flash-preview`), optional Ollama for local dev |
| **AI Retrieval** | PageIndex-style hierarchical tree index (vectorless, reasoning-based) |
| **Email** | Resend |
| **Validation** | Joi |
| **API Docs** | Swagger UI + OpenAPI 3 |

## Prerequisites

- **Node.js 20.x**
- **pnpm** (`npm install -g pnpm`)
- **MongoDB** (local instance or Atlas URI)
- **Google Gemini API key** (for AI features) — or **Ollama** running locally for development

## Getting Started

1. **Clone and install**

   ```bash
   git clone <your-repo-url> lexora
   cd lexora
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` — at minimum set: `DATABASE_URI`, JWT keys, and `GEMINI_API_KEY` (or `OLLAMA_MODEL` for local AI).

3. **Generate JWT keys** (if you don't have them)

   ```bash
   ssh-keygen -t rsa -P "" -b 2048 -m PEM -f jwt.key
   ssh-keygen -e -m PEM -f jwt.key > jwt.key.pub
   base64 < jwt.key | tr -d '\n'      # → JWT_ACCESS_TOKEN_SECRET_PRIVATE
   base64 < jwt.key.pub | tr -d '\n'   # → JWT_ACCESS_TOKEN_SECRET_PUBLIC
   ```

4. **Start development**

   ```bash
   pnpm dev
   ```

   This starts both the server (`:8080`) and client (`:3000`) in parallel.

5. **Open the app**

   - Frontend: `http://localhost:3000`
   - API docs: `http://localhost:8080/api-docs`

## Environment Variables

All variables are validated at startup via `server/src/config/config.ts`. See `.env.example` for the full annotated template.

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URI` | MongoDB connection string |
| `JWT_ACCESS_TOKEN_SECRET_PRIVATE` | Base64-encoded PEM private key (RS256) |
| `JWT_ACCESS_TOKEN_SECRET_PUBLIC` | Base64-encoded PEM public key (RS256) |

### AI Configuration

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key — enables all AI features |
| `OLLAMA_BASE_URL` | Ollama server URL (default `http://localhost:11434`) |
| `OLLAMA_MODEL` | Ollama model name (e.g., `qwen3:4b`) — used as fallback when Gemini is unavailable |

When both `GEMINI_API_KEY` and `OLLAMA_MODEL` are set, Gemini is used first with automatic fallback to Ollama. If only `OLLAMA_MODEL` is set, all AI features use the local model.

### Other Optional

| Variable | Description |
|----------|-------------|
| `APP_NAME` | Shown in emails; default `App Name` |
| `HOST` / `PORT` | Server bind address (default `0.0.0.0:8080`) |
| `FRONTEND_URL` | Used in verification/reset email links |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for the Next.js client |
| `CORS_ORIGIN` | `*` or comma-separated origins |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email via Resend |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth sign-in |
| `CLOUDINARY_*` | Image CDN (falls back to local storage) |
| `SEED_DATABASE` | Seed permissions, roles, templates, and clauses on startup |

## JWT Keys (RS256)

Access tokens are signed with RS256. Store keys as single-line base64 of the PEM files in `.env`.

```bash
ssh-keygen -t rsa -P "" -b 2048 -m PEM -f jwt.key
ssh-keygen -e -m PEM -f jwt.key > jwt.key.pub
base64 < jwt.key | tr -d '\n'      # → JWT_ACCESS_TOKEN_SECRET_PRIVATE
base64 < jwt.key.pub | tr -d '\n'   # → JWT_ACCESS_TOKEN_SECRET_PUBLIC
```

## Running Locally

### Monorepo Commands (from root)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start both client and server in development mode |
| `pnpm dev:client` | Start only the Next.js frontend |
| `pnpm dev:server` | Start only the Express backend |
| `pnpm build` | Build both client and server |
| `pnpm lint` | Lint both workspaces |
| `pnpm test` | Run server tests (Jest) |
| `pnpm clean` | Remove all `node_modules`, `dist`, `.next` |

### Server Commands (from `server/`)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server with nodemon + ts-node |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm lint` | ESLint on `src/**/*.ts` |
| `pnpm test` | Jest |

### Client Commands (from `client/`)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm type-check` | TypeScript type checking |

## AI Features

### Architecture

Lexora uses a **PageIndex-style vectorless retrieval** approach inspired by [VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex). Instead of chunking documents and embedding them in a vector database, it:

1. **Builds a hierarchical tree index** from the contract's BlockNote blocks, mapping headings to tree nodes with precise line ranges
2. **Selects relevant nodes** via an LLM reasoning step (the model navigates the tree like a human would use a table of contents)
3. **Generates grounded answers** using only the selected source lines, with validated citations (`startLine`, `endLine`, `quote`)
4. **Validates citations server-side** — ensures quoted text is an exact substring of the cited lines and falls within selected source nodes

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/chat/:contractId` | POST | Chat with a contract — grounded answers with citations |
| `/ai/review/:contractId` | POST | AI review — risks, missing clauses, suggestions |
| `/ai/editor/rewrite` | POST | Rewrite selected text in a given tone |
| `/ai/editor/explain` | POST | Plain-language clause explanation |
| `/ai/editor/summarize` | POST | Structured contract summary |
| `/ai/editor/generate-clause` | POST | Generate a clause from a prompt |
| `/ai/editor/suggest-clauses` | POST | Suggest missing clauses with reasoning |

### LLM Fallback Chain

```
Gemini (gemini-3-flash-preview)
  ↓ if unavailable or GEMINI_API_KEY not set
Ollama (configurable model, e.g. qwen3:4b)
  ↓ if neither configured
ValidationError thrown
```

Retry logic handles both 429 (rate limit) and 503 (service unavailable) errors with exponential backoff.

## API Endpoints

All routes are prefixed with `/api/v1`. Authentication is via `Authorization: Bearer <accessToken>`.

| Route Group | Path | Description |
|------------|------|-------------|
| Health | `/health` | Liveness, readiness, and external dependency probes |
| Auth | `/auth` | Signup, signin, tokens, Google OAuth, verification, password reset |
| Users | `/users` | User CRUD (RBAC-protected) |
| Roles | `/roles` | Role management |
| Contracts | `/contracts` | Contract CRUD, generation stream, search |
| Templates | `/templates` | Template listing and contract creation from templates |
| Clauses | `/clauses` | Clause library CRUD |
| AI | `/ai` | All AI-powered features (see [AI Features](#ai-features)) |
| Dashboard | `/dashboard` | Aggregated metrics and activity |
| Signatures | `/signatures` | Signature requests and signing flows |
| Notifications | `/notifications` | In-app notifications |
| Images | `/images` | Image uploads (Cloudinary or local) |
| Jobs | `/jobs` | Background job triggers and status |

Full API documentation is available at `http://localhost:8080/api-docs` (Swagger UI).

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signin` | Sign in |
| `/signup` | Sign up |
| `/forgot-password` | Password reset flow |
| `/dashboard` | Dashboard with metrics and activity |
| `/contracts` | Contract list and management |
| `/contracts/[id]` | Individual contract view |
| `/contracts/workspace` | Full contract workspace — editor, chat, AI tools, variables, templates, outline |
| `/clause-library` | Browse and manage reusable clauses |
| `/profile` | User profile settings |

### Contract Workspace

The workspace (`/contracts/workspace`) is the main editing environment with:

- **Left rail** — Chat, Variables, Templates, Outline, AI Tools (More tab), Home
- **Rich editor** — BlockNote-based contract editor with immersive/focus mode
- **Floating AI toolbar** — Appears on text selection: Rewrite, Explain, Generate
- **Right-click context menu** — Rewrite, Explain, Generate Clause, Highlight Risks
- **AI Tools panel** — AI Review, Summarize, Suggest Clauses, Generate Clause
- **Result modals** — Each AI action opens a modal with loading state, results, and copy/insert actions

## Production & Deployment

### Docker

```bash
docker build -t lexora-api .
docker run --env-file .env -p 8080:8080 lexora-api
```

### Render

`render.yaml` defines a web service:

- **Build:** `npm ci && npm run build`
- **Start:** `npm run render:start`
- **Health check:** `/api/v1/health`

Set secrets in the Render dashboard: `DATABASE_URI`, JWT keys, `GEMINI_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL`.

## Project Structure

```
lexora/
├── client/                     # Next.js 14 frontend
│   └── src/
│       ├── app/                # App router pages
│       │   ├── (auth)/         # Sign in, sign up
│       │   ├── contracts/      # Contract list, detail, workspace
│       │   ├── clause-library/ # Clause library
│       │   ├── dashboard/      # Dashboard
│       │   ├── forgot-password/# Password reset flow
│       │   └── profile/        # User profile
│       ├── components/         # React components
│       │   ├── ai/             # AI sidebar, floating chat
│       │   ├── auth/           # Auth forms
│       │   ├── contract/       # Editor, toolbar, outline, share, variables
│       │   ├── landing/        # Landing page sections
│       │   ├── layout/         # Shell, navigation, sidebar
│       │   └── ui/             # Shared UI primitives (button, dialog, etc.)
│       ├── services/api/       # API client (auth, contracts, ai, templates, etc.)
│       └── types/              # TypeScript interfaces
│
├── server/                     # Express 4 backend
│   └── src/
│       ├── config/             # Config (Joi env), logger, passport, swagger, seeds
│       ├── controllers/        # HTTP handlers
│       ├── docs/               # OpenAPI document, paths, components
│       ├── middlewares/         # Auth, validation, rate limiting, error handling
│       ├── models/             # Mongoose schemas (contract, user, ai sessions, etc.)
│       ├── routes/
│       │   ├── v1/             # Version 1 routes
│       │   └── v2/             # Version 2 routes
│       ├── services/           # Business logic
│       │   ├── aiService.ts    # All AI features + LLM adapter (Gemini/Ollama)
│       │   ├── pageIndex/      # Hierarchical tree index for contract retrieval
│       │   ├── emailService/   # Resend email with templates
│       │   └── ...             # Auth, contracts, templates, signatures, etc.
│       ├── validations/        # Joi request schemas
│       └── utils/              # Helpers, domain errors, Gemini retry, graceful shutdown
│
├── package.json                # Root workspace scripts
├── pnpm-workspace.yaml         # pnpm workspace config
├── pnpm-lock.yaml
├── render.yaml                 # Render deployment config
└── LICENSE                     # MIT
```

## License

[MIT](LICENSE)
