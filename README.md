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

### Vectorless RAG — PageIndex-Style Retrieval

Traditional RAG systems chunk documents into fixed-size pieces, embed them in a vector database, and retrieve by cosine similarity. Lexora takes a fundamentally different approach inspired by [VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex) — **no vector database, no embeddings, no chunking**. Instead, it uses the document's own structure (headings, sections) as a navigable index and lets the LLM reason about which sections to read, exactly like a human uses a table of contents.

The core implementation lives in **`server/src/services/pageIndex/contractTree.ts`**.

#### Why Vectorless?

| | Traditional Vector RAG | Lexora's PageIndex Approach |
|---|---|---|
| **Retrieval** | Cosine similarity on embeddings | LLM reasons over a heading tree |
| **Infrastructure** | Requires vector DB (Pinecone, Chroma, etc.) | Zero extra infrastructure |
| **Citations** | Approximate chunk references | Exact line numbers, verifiable quotes |
| **Accuracy** | Semantic drift from embedding noise | LLM reads the actual structure |
| **Latency** | Embedding + vector search + LLM | Two LLM calls (selection + answer) |
| **Maintenance** | Re-embed on every edit | Tree rebuilt on the fly per request |

#### How It Works — Step by Step

**Step 1: Build the Hierarchical Tree Index**

`buildContractTreeIndex()` converts the contract's BlockNote blocks into a tree mirroring the document's heading hierarchy. Each node tracks exact 1-based line ranges.

```
Document (root)                          lines 1-12
├── Mutual Non-Disclosure Agreement      lines 1-2   (H1)
├── 1. Definition of Confidential Info   lines 3-4   (H2)
├── 2. Obligations of Receiving Party    lines 5-6   (H2)
├── 3. Term and Termination              lines 7-8   (H2)
├── 4. Limitation of Liability           lines 9-10  (H2)
└── 5. Governing Law                     lines 11-12 (H2)
```

Key data structures:

```typescript
type ContractTreeNode = {
  nodeId: string       // e.g. "n-0", "n-1"
  parentId?: string    // parent node for hierarchy
  title: string        // heading text
  level: number        // heading depth (1=H1, 2=H2, ...)
  startLine: number    // 1-based inclusive
  endLine: number      // 1-based inclusive
  summary: string      // first ~300 chars of node content
  children: ContractTreeNode[]
}

type ContractTreeIndex = {
  root: ContractTreeNode
  nodesById: Record<string, ContractTreeNode>
  nodesInOrder: ContractTreeNode[]
  lines: string[]      // flat array of all document lines
}
```

Block types (paragraph, heading, bullet list, numbered list) are converted to stable text lines. Headings become `## Heading Text`, bullets become `• Item text`. This gives every piece of content a deterministic line number for citation.

**Step 2: LLM-Driven Node Selection (Reasoning-Based Retrieval)**

`collectNodesForPrompt()` performs a BFS traversal to select up to 45 candidate nodes (higher-level structure first, deeper nodes after). These candidates are sent to the LLM in a structured prompt:

```
You are a reasoning-based document retriever.
Given the user question, select up to 6 nodeIds that most likely contain the answer.

Tree nodes:
- n-0 (parent: root)
  title: 1. Definition of Confidential Information
  level: 2
  summary: "Confidential Information" means any non-public...
  lines: 3-4
- n-1 (parent: root)
  title: 2. Obligations of Receiving Party
  ...
```

The LLM returns `{ "selectedNodeIds": ["n-1", "n-2"], "notes": "..." }` — it *reasons* about which sections are relevant rather than relying on embedding similarity.

**Step 3: Source Extraction with Line Numbers**

`formatSourceLines()` takes each selected node and formats its content with numbered lines:

```
Source:
nodeId: n-1
title: 2. Obligations of Receiving Party
lines: 5-6
content:
[5] ## 2. Obligations of Receiving Party
[6] The Receiving Party shall: (a) hold Confidential Information in strict confidence; (b) not disclose it to any third party...
```

These numbered sources are injected into the final answer prompt, forcing the LLM to ground its response in specific lines.

**Step 4: Grounded Answer Generation**

The LLM is instructed to respond in structured JSON with explicit citations:

```json
{
  "reply": "The Receiving Party must keep information confidential, cannot share it without consent, may only use it for evaluating the relationship, and must return or destroy it on request.",
  "editedContract": null,
  "citations": [
    {
      "startLine": 6,
      "endLine": 6,
      "quote": "(a) hold Confidential Information in strict confidence; (b) not disclose it to any third party without prior written consent"
    }
  ]
}
```

**Step 5: Server-Side Citation Validation**

Every citation is validated before reaching the frontend:

1. `startLine` and `endLine` must be valid numbers within document bounds
2. The `quote` must be an **exact substring** of the text at those line numbers
3. The cited line range must fall within one of the LLM-selected source nodes
4. If all citations fail validation, a minimal fallback citation to the first selected node is generated

This means **every citation the user sees is cryptographically verifiable** against the actual document — no hallucinated references.

#### Key Functions in `contractTree.ts`

| Function | Purpose |
|----------|---------|
| `buildContractTreeIndex(blocks)` | Converts BlockNote blocks into a hierarchical tree with line mappings |
| `collectNodesForPrompt(index, maxNodes, maxDepth)` | BFS traversal to select candidate nodes for the LLM |
| `formatSourceLines(index, node, maxLinesPerNode)` | Formats a node's content as `[LINE_NUM] text` for the prompt |
| `blockToLines(block)` | Converts a single BlockNote block into stable text lines |
| `getBlockText(block)` | Extracts raw text from a block's inline content array |

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/chat/:contractId` | POST | Chat with a contract — grounded answers with line-level citations |
| `/ai/review/:contractId` | POST | AI review — risks, missing clauses, suggestions with severity |
| `/ai/editor/rewrite` | POST | Rewrite selected text in formal/friendly/concise tone |
| `/ai/editor/explain` | POST | Plain-language clause explanation |
| `/ai/editor/summarize` | POST | Structured contract summary |
| `/ai/editor/generate-clause` | POST | Generate a new clause from a natural language prompt |
| `/ai/editor/suggest-clauses` | POST | Analyze contract and suggest missing clauses with reasoning |

### LLM Fallback Chain

```
Gemini (gemini-3-flash-preview)
  ↓ if unavailable or GEMINI_API_KEY not set
Ollama (configurable model, e.g. qwen3:4b)
  ↓ if neither configured
ValidationError thrown
```

Retry logic handles 429 (rate limit), 503 (service unavailable), and "high demand" errors with exponential backoff (up to 4 attempts, max 32s delay).

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
