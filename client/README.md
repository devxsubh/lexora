# Lexora Frontend

AI-powered contract management frontend: create, edit, review, and collaborate on contracts with an intelligent editor and Lexora AI.

---

## Tech Stack

| Category        | Choice                |
|----------------|------------------------|
| Framework      | Next.js 14 (App Router)|
| Language       | TypeScript             |
| Styling        | Tailwind CSS           |
| Editor         | BlockNote              |
| Animations     | Framer Motion          |
| Icons          | Lucide React           |
| State          | Zustand                |
| HTTP           | Axios                  |

---

## Prerequisites

- **Node.js** 18+
- **npm** (or yarn / pnpm)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

---

## Environment Variables

Create `.env.local` in the project root. The frontend uses these to talk to your backend:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (no path) | `http://localhost:5000` |
| `NEXT_PUBLIC_BACKEND_URL` | Same as above (alternate) | `http://localhost:5000` |

**Important for backend:**

- All API requests use **base URL + `/api/v1`** (e.g. `http://localhost:5000/api/v1`).
- Authenticated requests send **`Authorization: Bearer <accessToken>`**.
- The client expects **refresh token** support at `POST /api/v1/auth/refresh-tokens` with body `{ refreshToken }` and response `{ data: { accessToken: { token }, refreshToken: { token } } }`.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing
│   ├── (auth)/             # signin, signup
│   ├── forgot-password/    # forgot, verify, reset
│   ├── dashboard/          # Dashboard
│   ├── profile/            # User profile
│   ├── contracts/          # Contract hub & editor
│   │   ├── page.tsx        # Hub (v0-style: sidebar, “Ask Lexora to build”)
│   │   ├── workspace/      # Chat + editor + outline/vars
│   │   └── [id]/page.tsx   # Full contract editor (single doc)
│   └── clause-library/     # Clause library
├── components/
│   ├── ui/                 # Buttons, inputs, cards, etc.
│   ├── layout/             # Sidebar, EditorSidebar, ContractsHub (sidebar, top nav, main)
│   ├── contract/           # ContractEditor (BlockNote), ShareDialog, VariablesPanel, AI panels
│   ├── auth/               # AuthGuard
│   └── user/               # UserProfileDropdown
├── services/
│   └── api/                # client, auth, contracts, clauses, ai, review
├── store/                  # Zustand (e.g. authStore)
├── types/                  # contract, ai, clause, etc.
└── utils/                  # helpers, constants
```

---

## Main Features & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing (hero, platform, testimonials, CTA) |
| `/signin`, `/signup` | Auth (protected by redirect) |
| `/forgot-password/*` | Forgot / verify / reset password |
| `/dashboard` | Dashboard (metrics, quick actions, contract list) |
| `/contracts` | **Contracts hub**: sidebar (New Chat, Home, Projects, Templates, Favorites, Recents), big input “Ask Lexora to build…”, agents & model selector |
| `/contracts/workspace?doc=...&q=...` | **Workspace**: left rail (Chat/Vars/Templates), chat panel, editor (Outline + Variables + BlockNote), focus mode, right-click AI menu, ShareDialog |
| `/contracts/[id]` | **Single-doc editor**: full editor with toolbar, outline, variables, AI review, e-sign, share |
| `/clause-library` | Clause library |
| `/profile` | User profile |

**Editor behaviour (contracts hub workspace & `/contracts/[id]`):**

- BlockNote rich editor, slash menu, outline, variables panel.
- Floating AI toolbar on text selection (Rewrite, Explain, Generate).
- Right-click context menu: Rewrite, Explain, Generate clause, Highlight risks.
- Focus mode: editor full-screen with optional left sidebar (outline/vars).
- Share via existing ShareDialog component.

---

## API Integration (for Backend)

- **Base:** `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:5000`).
- **Prefix:** All calls go to `{base}/api/v1/...`.
- **Auth:** JWT in `Authorization: Bearer <accessToken>`. Tokens stored in `localStorage` (`accessToken`, `refreshToken`). On 401, frontend calls `POST /api/v1/auth/refresh-tokens` and retries once.
- **Services:** `src/services/api/` — `client.ts` (axios instance, interceptors), `auth.ts`, `contracts.ts`, `clauses.ts`, `ai.ts`, `review.ts`. Use these as the source of truth for request/response shapes.
- **Contract content:** Editor uses BlockNote; API types and conversion (e.g. to/from blocks) are in `contracts.ts` (e.g. `convertContentToBlockNote`). Backend can store document as array of blocks or your own schema; frontend can adapt in that service.

See **FEATURES_ROADMAP.md** for what’s frontend-only vs backend-required. See **PROJECT_STRUCTURE.md** for a more detailed folder breakdown.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Run production build (port 3000) |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |

---

## Docs in Repo

- **PROJECT_STRUCTURE.md** – Detailed folder and feature layout.
- **FEATURES_ROADMAP.md** – Frontend-only vs backend-required features and status.

---

## License

MIT
