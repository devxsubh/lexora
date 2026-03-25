# Lexora Backend API Design Document

**Version:** 1.0  
**Base URL:** `{BACKEND_URL}/api/v1`  
**Purpose:** Backend API specification derived from the Lexora frontend codebase. Only features and data shapes actually used by the frontend are included. Authentication APIs are out of scope (handled separately).

---

## 1. System Overview

The Lexora frontend is a LegalTech app with:

- **Contract management:** Create, edit, autosave, and list contracts. Contract content is stored as **BlockNote-style blocks** (array of blocks with `type`, `props`, `content`).
- **AI features:** Chat per contract, contract review (risk/missing/suggestion issues), inline actions (rewrite, explain, summarize, generate clause, suggest clauses).
- **Editor:** TipTap/BlockNote editor with variables (`{{Name}}`), outline, clause finder, clause templates, and a floating AI toolbar on text selection.
- **Sharing & signatures:** Share dialog (collaborators, roles, copy link), request signatures (signer email/name, roles), e-signature panel (draw signature, submit).
- **Export:** PDF, DOCX, Markdown, HTML (ExportMenu); download contract as blob is already called.
- **Dashboard:** Metrics (total contracts, pending signatures, expiring soon, AI risk flags), contract table (rows with party, type, status, AI risk, lifecycle), recent activity, AI insights, templates list.
- **Clause library:** List/browse clauses; clause CRUD and clause templates for insertion.
- **Templates:** Start from template (e.g. NDA, Vendor, Consulting, Employment); generate contract from prompt; create contract from template.

The frontend uses **axios** with base URL `NEXT_PUBLIC_BACKEND_URL` or `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`), prefix **`/api/v1`**, and sends **Bearer token** via `Authorization` header. Responses are expected in a consistent shape (see per-API sections).

---

## 2. Data Models

These types are inferred from frontend types and API usage. Backend can use them as reference for persistence and response bodies.

### 2.1 Contract

| Field       | Type   | Notes |
|------------|--------|-------|
| id         | string | UUID or string ID; API may return `_id` (frontend maps to `id`) |
| title      | string | |
| content    | Block[]| BlockNote/PartialBlock format (see below) |
| createdAt  | string | ISO 8601 |
| updatedAt  | string | ISO 8601 |
| status     | enum   | `draft` \| `reviewing` \| `finalized` |
| metadata   | object | Optional: `parties`, `type`, etc. |
| userId     | string | Optional; used in mock |
| lexiId     | string | Optional; returned by generate |

**Block (content item):**  
`{ id?: string, type: string, props?: object, content?: Array<{ type: 'text', text: string, styles?: object }> }`  
Block types observed: `paragraph`, `heading`, `bulletListItem`, `numberedListItem`, etc. Headings use `props: { level: 1|2|3 }`.

### 2.2 ChatMessage (AI chat)

| Field     | Type   |
|----------|--------|
| id       | string |
| role     | `user` \| `assistant` |
| content  | string |
| timestamp| string | ISO 8601, optional |

### 2.3 AIReviewIssue

| Field       | Type   | Notes |
|------------|--------|-------|
| id         | string | |
| type       | enum   | `risk` \| `missing` \| `inconsistency` \| `suggestion` |
| severity   | enum   | `low` \| `medium` \| `high` |
| title      | string | |
| description| string | |
| location   | object | Optional: `{ blockId: string, line?: number }` |
| suggestion | string | Optional remediation text |

### 2.4 Clause (clause library)

| Field      | Type     | Notes |
|-----------|----------|-------|
| id        | string   | |
| title     | string   | |
| content   | string   | |
| category  | string   | |
| tags      | string[] | |
| usageCount| number   | Optional |
| createdAt | string   | ISO 8601 |
| updatedAt | string   | ISO 8601 |

### 2.5 ClauseTemplate (editor clause templates)

| Field       | Type   |
|------------|--------|
| id         | string |
| title      | string |
| description| string |
| category   | string |
| content    | string |

### 2.6 Variable (document variables)

| Field    | Type   | Notes |
|---------|--------|-------|
| id      | string | |
| name    | string | Placeholder name (e.g. `Company Name`) |
| value   | string | |
| category| `custom` \| `system` |
| type    | string | Optional: `text` \| `number` \| `date` \| `email` \| `phone` |

### 2.7 Collaborator (share dialog)

| Field | Type   |
|-------|--------|
| id    | string |
| name  | string |
| email | string |
| role  | `Owner` \| `Editor` \| `Viewer` |
| avatar| string | Optional URL |
| avatarColor | string | Optional hex |

### 2.8 SuggestedClause (AI suggest clauses)

| Field       | Type   |
|------------|--------|
| id         | string |
| title      | string |
| description| string |
| reason     | string | Why it was suggested |
| content    | string |

### 2.9 Dashboard contract row (table)

| Field          | Type   | Notes |
|----------------|--------|-------|
| id             | string | |
| name           | string | Contract title |
| party          | string | Counterparty |
| contractType   | string | e.g. NDA, Vendor, Employment, MSA |
| status         | string | e.g. Draft, Sent, Signed, Pending Signature |
| aiRiskScore   | number | 0–100 |
| lastUpdated   | string | |
| lastActivity  | string | |
| riskLevel     | string | Low / Medium / High |
| hasRiskFlag   | boolean| |
| lifecycleStage| number | 0–5 (Draft … Expiry) |
| effectiveDate | string | |
| summary       | string | Optional |

---

## 3. API Endpoints (Contracts)

All under `/api/v1`. Request/response bodies are JSON unless noted.

### 3.1 List contracts

**Route:** `GET /contracts`  
**Purpose:** Paginated list for dashboard and contract list views.

**Query:**

| Param   | Type   | Default | Description |
|--------|--------|--------|-------------|
| page   | number | 1      | |
| limit  | number | 10     | |
| sortBy | string | —      | Optional |
| sortOrder | string | —    | `asc` \| `desc` |

**Response (wrapped):**

```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "uuid",
        "title": "string",
        "content": [],
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "status": "draft"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

**Tables:** contracts (with optional joins for favorites/counts).

---

### 3.2 Get contract

**Route:** `GET /contracts/:id`  
**Purpose:** Load a single contract for the editor.

**Response (wrapped):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "_id": "uuid",
    "title": "string",
    "content": [ { "type": "paragraph", "props": {}, "content": [ { "type": "text", "text": "...", "styles": {} } ] } ],
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "status": "draft",
    "userId": "string",
    "lexiId": "string"
  }
}
```

Frontend accepts either `{ success, data }` or a direct contract object with `_id` or `id`. It converts `content` to BlockNote `PartialBlock[]` (normalizing block content and mapping `_id` → `id`).

**Tables:** contracts.

---

### 3.3 Create contract

**Route:** `POST /contracts`  
**Purpose:** Create a new contract (e.g. from “New contract” or before first autosave).

**Request:**

```json
{
  "title": "Untitled Agreement",
  "content": [],
  "status": "draft"
}
```

**Response (wrapped):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "content": [],
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "status": "draft"
  }
}
```

**Tables:** contracts.

---

### 3.4 Update contract

**Route:** `PUT /contracts/:id`  
**Purpose:** Full or partial update (e.g. title, status).

**Request:**

```json
{
  "title": "string",
  "content": [ /* Block[] */ ],
  "status": "draft"
}
```

**Response (wrapped):** Same shape as Get contract.

**Tables:** contracts.

---

### 3.5 Autosave contract

**Route:** `PATCH /contracts/:id/autosave`  
**Purpose:** Debounced save of editor content (called every ~600 ms after changes).

**Request:**

```json
{
  "content": [ /* Block[] */ ],
  "lastModified": "ISO8601"
}
```

**Response (wrapped):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "content": [ /* Block[] */ ],
    "updatedAt": "ISO8601",
    "status": "draft"
  }
}
```

If the backend is unavailable, the frontend treats autosave as best-effort and can continue with local state.

**Tables:** contracts.

---

### 3.6 Delete contract

**Route:** `DELETE /contracts/:id`  
**Purpose:** Delete a contract.

**Response (wrapped):**

```json
{
  "success": true,
  "data": null
}
```

**Tables:** contracts (and any dependent rows if applicable).

---

### 3.7 Generate contract from prompt

**Route:** `POST /contracts/generate`  
**Purpose:** AI-generated contract from a single prompt (Contracts hub / workspace).

**Request:**

```json
{
  "prompt": "Create an NDA between Acme Corp and John Doe"
}
```

**Response (wrapped):**

```json
{
  "success": true,
  "message": "optional",
  "data": {
    "_id": "uuid",
    "id": "uuid",
    "lexiId": "string",
    "title": "string",
    "content": [ /* Block[] */ ],
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "status": "draft"
  }
}
```

Frontend expects long-running generation; consider longer timeout or streaming. Content must be valid BlockNote block array.

**Tables:** contracts (insert), optional AI/usage logs.

---

### 3.8 Download contract (export file)

**Route:** `GET /contracts/:id/download`  
**Purpose:** Export contract as file (PDF/DOCX). Used by ExportMenu and `contractService.downloadContract(id)`.

**Query:**

| Param  | Type   | Default | Description |
|--------|--------|--------|-------------|
| format | string | pdf    | `pdf` \| `docx` |

**Response:** Binary (e.g. `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).  
Frontend uses `responseType: 'blob'` and expects body as blob.

**Tables:** contracts (read content).

---

### 3.9 Favorite / Unfavorite contract

**Route:** `PATCH /contracts/:id/favorite`  
**Purpose:** Mark contract as favorite (sidebar “Favorites”).

**Response (wrapped):** Contract object or `{ success, data: contract }`.

**Route:** `PATCH /contracts/:id/unfavorite`  
**Purpose:** Remove favorite.

**Response (wrapped):** Contract object or `{ success, data: contract }`.

**Tables:** contracts (e.g. `isFavorite` flag) or user_contract_favorites.

---

## 4. AI System APIs

### 4.1 Send chat message (contract-scoped)

**Route:** `POST /ai/chat/:contractId`  
**Purpose:** Send a user message and get assistant reply (Contract Copilot / AI sidebar).

**Request:**

```json
{
  "message": "Add a limitation of liability clause"
}
```

**Response:** Frontend expects a **single ChatMessage** (assistant) or a structure that can be mapped to it. Example:

```json
{
  "id": "uuid",
  "role": "assistant",
  "content": "I've added a Limitation of Liability clause...",
  "timestamp": "ISO8601"
}
```

If the backend returns a wrapped envelope, frontend should receive at least `id`, `role`, `content`, and optionally `timestamp`. Session may be implicit by `contractId` or passed in headers/body.

**Tables:** ai_chat_sessions (optional), ai_messages.

---

### 4.2 Contract review (AI issues)

**Route:** `POST /ai/review/:contractId`  
**Purpose:** Run AI review and return issues (risk, missing, inconsistency, suggestion).  
Also called via **`POST /review/:contractId`** in `reviewService`; recommend a single implementation (e.g. `/ai/review/:contractId`).

**Request:** No body (contract content loaded server-side by contractId).

**Response:** Array of **AIReviewIssue** (or wrapped in `data`):

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "risk",
      "severity": "high",
      "title": "Missing Termination Clause",
      "description": "The agreement does not specify termination rights...",
      "location": { "blockId": "block-5", "line": 1 },
      "suggestion": "Add a termination clause that outlines notice periods..."
    }
  ]
}
```

**Tables:** contracts (read), optional review_results cache.

---

### 4.3 AI rewrite selection (inline / Cursor-style)

**Route:** `POST /ai/editor/rewrite`  
**Purpose:** Rewrite selected text with a chosen tone (AIRewritePanel: formal, friendly, concise).

**Request:**

```json
{
  "contractId": "uuid",
  "selection": "selected text in editor",
  "tone": "formal"
}
```

**Response:**

```json
{
  "rewrittenText": "string"
}
```

**Tables:** Optional usage/log.

---

### 4.4 AI explain clause (inline)

**Route:** `POST /ai/editor/explain`  
**Purpose:** Explain selected clause in plain language (AIExplainPanel).

**Request:**

```json
{
  "contractId": "uuid",
  "clauseText": "selected clause text"
}
```

**Response:**

```json
{
  "explanation": "string (markdown or plain text)"
}
```

---

### 4.5 AI summarize contract

**Route:** `POST /ai/editor/summarize`  
**Purpose:** Generate a short summary of the full contract (AISummarizePanel).

**Request:**

```json
{
  "contractId": "uuid",
  "content": [ /* Block[] */ ]
}
```

Either `contractId` or `content` (or both) can be used; frontend passes `content` from editor state.

**Response:**

```json
{
  "summary": "string (markdown or plain text)"
}
```

---

### 4.6 AI generate clause (from prompt)

**Route:** `POST /ai/editor/generate-clause`  
**Purpose:** Generate a single clause from a natural-language prompt (AIClauseGenerator).

**Request:**

```json
{
  "contractId": "uuid",
  "prompt": "Create a confidentiality clause for a software development agreement"
}
```

**Response:**

```json
{
  "clause": "string (generated clause text)"
}
```

---

### 4.7 AI suggest missing clauses

**Route:** `POST /ai/editor/suggest-clauses`  
**Purpose:** Analyze contract and return suggested clauses to add (AISuggestClauses).

**Request:**

```json
{
  "contractId": "uuid",
  "content": [ /* Block[] */ ]
}
```

**Response:**

```json
{
  "suggestions": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "reason": "string",
      "content": "string"
    }
  ]
}
```

**Tables:** contracts (read).

---

## 5. Editor APIs

- **Load contract:** Covered by **GET /contracts/:id** (see 3.2).  
- **Autosave:** **PATCH /contracts/:id/autosave** (see 3.5).  
- **Insert clause:** No dedicated “insert clause” API; frontend inserts blocks locally. Optional: **POST /contracts/:id/clauses** that accepts a clause body and returns updated content or block range (not required by current UI).  
- **Variables:** Stored in frontend state only; no variables API observed. Optional: store variables per contract (e.g. in metadata or separate table) and add `GET/PATCH /contracts/:id/variables` if needed later.  
- **Version history / restore:** Not present in frontend; omit from v1. Add later if UI supports it (e.g. `GET /contracts/:id/versions`, `POST /contracts/:id/restore`).

---

## 6. Template APIs

- **List templates:** Dashboard and workspace need a list of templates (e.g. NDA, Vendor, Consulting, Employment) with id and label/link.

**Route:** `GET /templates`  
**Purpose:** List available contract templates.

**Response (wrapped):**

```json
{
  "success": true,
  "data": [
    {
      "id": "nda",
      "label": "Mutual NDA",
      "description": "Standard mutual non-disclosure agreement for evaluations and discussions.",
      "category": "Confidentiality"
    },
    {
      "id": "vendor-agreement",
      "label": "Vendor Agreement",
      "description": "Master vendor agreement for supply of components or services.",
      "category": "Commercial"
    },
    {
      "id": "consulting-agreement",
      "label": "Consulting Agreement",
      "description": "Engagement terms for independent consultants or agencies.",
      "category": "Services"
    },
    {
      "id": "employment-offer",
      "label": "Employment Offer",
      "description": "Offer letter template for full‑time roles.",
      "category": "Employment"
    },
    {
      "id": "msa-logistics",
      "label": "MSA – Logistics Partner",
      "description": "Master service agreement for logistics and fulfillment partners.",
      "category": "Commercial"
    }
  ]
}
```

- **Create contract from template:** Frontend navigates to `/contracts/workspace?template=nda`. Backend can expose:

**Route:** `POST /contracts/from-template`  
**Purpose:** Create a new contract from a template.

**Request:**

```json
{
  "templateId": "nda",
  "title": "optional override"
}
```

**Response (wrapped):** Same as Create contract (3.3), with `content` pre-filled from template.

**Tables:** templates, contracts.

---

## 7. Dashboard APIs

Dashboard currently uses static data. These endpoints support the existing UI structure.

### 7.1 Dashboard metrics

**Route:** `GET /dashboard/metrics`  
**Purpose:** Aggregate counts for metric cards (total contracts, pending signatures, expiring soon, AI risk flags).

**Response (wrapped):**

```json
{
  "success": true,
  "data": {
    "totalContracts": 128,
    "pendingSignatures": 7,
    "expiringSoon": 5,
    "aiRiskFlags": 3
  }
}
```

Optional: deltas (e.g. “+12% this month”) and labels; frontend can derive or accept per-metric objects.

### 7.2 Dashboard contract list (table)

**Route:** `GET /dashboard/contracts` or reuse **GET /contracts** with extended fields.  
**Purpose:** Table rows with party, type, status, AI risk, lifecycle, etc.

**Query:** Same as list contracts; response items should include at least:  
`id`, `name` (title), `party`, `contractType`, `status`, `aiRiskScore`, `lastUpdated`, `lastActivity`, `riskLevel`, `hasRiskFlag`, `lifecycleStage`, `effectiveDate`, `summary`.

**Response (wrapped):**

```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "1",
        "name": "Vendor Agreement - Acme Pvt Ltd",
        "party": "Acme Pvt Ltd",
        "contractType": "Vendor",
        "status": "Sent",
        "aiRiskScore": 42,
        "lastUpdated": "2026-02-26T10:15:00.000Z",
        "lastActivity": "Edited by you",
        "riskLevel": "Medium",
        "hasRiskFlag": true,
        "lifecycleStage": 2,
        "effectiveDate": "2026-03-01",
        "summary": "Master vendor agreement for supply of components."
      },
      {
        "id": "2",
        "name": "NDA - Investor Round",
        "party": "Blue Ocean Ventures",
        "contractType": "NDA",
        "status": "Signed",
        "aiRiskScore": 18,
        "lastUpdated": "2026-02-24T08:00:00.000Z",
        "lastActivity": "Signed by all parties",
        "riskLevel": "Low",
        "hasRiskFlag": false,
        "lifecycleStage": 4,
        "effectiveDate": "2026-02-24",
        "summary": "Mutual NDA for investor discussions."
      },
      {
        "id": "3",
        "name": "Employment Offer - Product Lead",
        "party": "Priya Sharma",
        "contractType": "Employment",
        "status": "Pending Signature",
        "aiRiskScore": 25,
        "lastUpdated": "2026-02-25T12:30:00.000Z",
        "lastActivity": "Sent for signature",
        "riskLevel": "Low",
        "hasRiskFlag": false,
        "lifecycleStage": 3,
        "effectiveDate": null,
        "summary": "Offer letter for Product Lead role."
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10
  }
}
```

### 7.3 Recent activity

**Route:** `GET /dashboard/activity`  
**Purpose:** Recent activity feed (e.g. “Priya Sharma signed Employment Offer”, “AI flagged indemnity clause”).

**Query:** `limit` (e.g. 10).

**Response (wrapped):**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "text": "Priya Sharma signed Employment Offer",
      "time": "2 hours ago",
      "contractId": "3",
      "type": "signature"
    },
    {
      "id": "2",
      "text": "AI flagged indemnity clause in Vendor Agreement - Acme Pvt Ltd",
      "time": "5 hours ago",
      "contractId": "1",
      "type": "ai-review"
    },
    {
      "id": "3",
      "text": "Contract renewed with SwiftShip Logistics",
      "time": "1 day ago",
      "contractId": "4",
      "type": "lifecycle"
    },
    {
      "id": "4",
      "text": "You edited NDA - Investor Round",
      "time": "1 day ago",
      "contractId": "2",
      "type": "edit"
    }
  ]
}
```

### 7.4 AI insights (actionable)

**Route:** `GET /dashboard/ai-insights`  
**Purpose:** Short list of actionable AI suggestions (e.g. “NDA missing jurisdiction clause”, “Apply Fix”).

**Response (wrapped):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "NDA missing jurisdiction clause",
      "fix": "Add: \"This agreement shall be governed by the laws of India.\"",
      "action": "apply-fix",
      "actionLabel": "Apply fix",
      "href": "/contracts/2",
      "contractId": "2"
    },
    {
      "id": 2,
      "title": "Indemnity clause deviates 20% from template",
      "fix": "Align cap with standard template or add explicit justification.",
      "action": "compare-clause",
      "actionLabel": "Compare clause",
      "href": "/contracts/1",
      "contractId": "1"
    },
    {
      "id": 3,
      "title": "Contract with SwiftShip Logistics expires in 7 days",
      "fix": "Prepare renewal draft and notify counterparty.",
      "action": "send-renewal",
      "actionLabel": "Send renewal draft",
      "href": "/contracts/4",
      "contractId": "4"
    }
  ]
}
```

### 7.5 Metric drill-down (dropdowns)

**Route:** `GET /dashboard/metrics/:metricId/items`  
**Purpose:** Lists for metric card dropdowns (e.g. contracts for “total-contracts”, pending for “pending-signatures”, expiring for “expiring-soon”, risk items for “ai-risk-flags”).

**Response (wrapped):** Array of items; shape can match the sample structures in the frontend (e.g. `id`, `name`, `party`, `awaiting`, `expires`, `severity`, `issue`).

---

## 8. Signature APIs

### 8.1 Request signatures

**Route:** `POST /contracts/:contractId/signatures/request`  
**Purpose:** Send contract for signature (collects signer email, name, roles in UI).

**Request:**

```json
{
  "signers": [
    {
      "email": "string",
      "name": "string",
      "roleId": "string",
      "roleName": "string"
    }
  ],
  "message": "optional"
}
```

**Response (wrapped):**

```json
{
  "success": true,
  "data": {
    "requestId": "uuid",
    "status": "pending",
    "sentTo": [ "email" ]
  }
}
```

### 8.2 List signature requests

**Route:** `GET /contracts/:contractId/signatures` or `GET /signatures?contractId=:id`  
**Purpose:** List pending/completed signature requests for a contract or user.

**Response (wrapped):** List of signature request objects (id, contractId, signers, status, createdAt, etc.).

### 8.3 Sign document (submit signature)

**Route:** `POST /contracts/:contractId/sign` or `POST /signatures/:requestId/sign`  
**Purpose:** Submit e-signature (ESignaturePanel sends signature as data URL or blob).

**Request:**

```json
{
  "signature": "data:image/png;base64,...",
  "signerName": "string",
  "requestId": "optional"
}
```

**Response (wrapped):** Updated signature request or contract status.

### 8.4 Webhook for signature completion

**Route:** Backend-defined (e.g. `POST /webhooks/signature-complete`).  
**Purpose:** Notify frontend or refresh state when a signer completes (e.g. via polling or real-time channel). Frontend does not call this; backend may call external systems or push updates.

---

## 9. Export APIs

- **Download contract:** **GET /contracts/:id/download?format=pdf|docx** (see 3.8).  
- **Export as Markdown/HTML:** Frontend currently mocks these; backend can extend download with `format=md` or `format=html` and return appropriate content type.  
- **Share link:** Share dialog “Copy link” uses `window.location.href`. Backend can provide a shareable link (e.g. read-only token) via a **GET /contracts/:id/share-link** or **POST /contracts/:id/share** that returns a URL; frontend can be updated to use it when available.

---

## 10. Clause Library APIs

**Route:** `GET /clauses`  
**Purpose:** List clauses for clause library and pickers.

**Response (wrapped, with 5 mock clauses):**

```json
{
  "success": true,
  "data": [
    {
      "id": "confidentiality-standard",
      "title": "Confidentiality",
      "content": "Both parties agree to maintain the confidentiality of all proprietary information shared under this Agreement for a period of three (3) years after termination.",
      "category": "Confidentiality",
      "tags": ["nda", "mutual"],
      "usageCount": 24,
      "createdAt": "2026-01-10T09:00:00.000Z",
      "updatedAt": "2026-02-20T12:00:00.000Z"
    },
    {
      "id": "limitation-of-liability-standard",
      "title": "Limitation of Liability",
      "content": "Except as required by law, each party’s aggregate liability shall be limited to the fees paid under this Agreement in the twelve (12) months preceding the claim.",
      "category": "Liability",
      "tags": ["cap", "commercial"],
      "usageCount": 17,
      "createdAt": "2026-01-12T09:00:00.000Z",
      "updatedAt": "2026-02-18T12:00:00.000Z"
    },
    {
      "id": "termination-for-convenience",
      "title": "Termination for Convenience",
      "content": "Either party may terminate this Agreement for convenience upon thirty (30) days’ prior written notice to the other party.",
      "category": "Termination",
      "tags": ["termination"],
      "usageCount": 9,
      "createdAt": "2026-01-15T09:00:00.000Z",
      "updatedAt": "2026-02-16T12:00:00.000Z"
    },
    {
      "id": "governing-law-india",
      "title": "Governing Law (India)",
      "content": "This Agreement shall be governed by and construed in accordance with the laws of India and the courts at New Delhi shall have exclusive jurisdiction.",
      "category": "Governing Law",
      "tags": ["india", "jurisdiction"],
      "usageCount": 11,
      "createdAt": "2026-01-20T09:00:00.000Z",
      "updatedAt": "2026-02-10T12:00:00.000Z"
    },
    {
      "id": "dispute-resolution-arbitration",
      "title": "Dispute Resolution – Arbitration",
      "content": "Any dispute arising out of or in connection with this Agreement shall be finally settled by binding arbitration in accordance with the rules of the chosen arbitration institution.",
      "category": "Dispute Resolution",
      "tags": ["arbitration"],
      "usageCount": 14,
      "createdAt": "2026-01-22T09:00:00.000Z",
      "updatedAt": "2026-02-08T12:00:00.000Z"
    }
  ]
}
```

**Route:** `GET /clauses/:id`  
**Purpose:** Single clause (e.g. for preview or edit).

**Route:** `POST /clauses`  
**Purpose:** Create clause (body: Partial<Clause>).

**Route:** `PATCH /clauses/:id`  
**Purpose:** Update clause.

**Route:** `DELETE /clauses/:id`  
**Purpose:** Delete clause.

**Tables:** clauses.

---

## 11. Share / Collaboration APIs (optional for v1)

ShareDialog shows collaborators, roles, and “Copy link”. If backend supports sharing:

- **GET /contracts/:id/collaborators** — list collaborators (id, name, email, role, avatar, avatarColor).  
- **POST /contracts/:id/collaborators** — add by email; body `{ email, role }`.  
- **PATCH /contracts/:id/collaborators/:userId** — update role (`Editor` / `Viewer`).  
- **GET /contracts/:id/share-link** or **POST /contracts/:id/share** — return shareable URL (optional token/expiry).

---

## 12. Suggested Database Schema (high level)

- **users** — (out of scope; auth handled separately.)  
- **contracts** — id, user_id, title, content (JSONB), status, created_at, updated_at, metadata (JSONB), is_favorite.  
- **templates** — id, name, label, description, content (JSONB), created_at.  
- **clauses** — id, title, content, category, tags (array), usage_count, created_at, updated_at, user_id (optional).  
- **clause_templates** — id, title, description, category, content (for editor dropdown; can merge with clauses with a type flag).  
- **ai_chat_sessions** — id, contract_id, user_id, created_at.  
- **ai_messages** — id, session_id, role, content, created_at.  
- **contract_reviews** — id, contract_id, created_at; **review_issues** — id, review_id, type, severity, title, description, location (JSONB), suggestion.  
- **signature_requests** — id, contract_id, status, created_at; **signature_request_signers** — id, request_id, email, name, role_id, role_name, status, signed_at, signature_data (e.g. blob/URL).  
- **contract_collaborators** — contract_id, user_id, role, created_at (if sharing is implemented).  
- **dashboard_activity** or derived from contracts + signatures + reviews for **dashboard/activity** and **ai-insights**.

Indexes: contract_id on all contract-scoped tables; user_id where needed; created_at for sorting and “recent” queries.

---

## 13. Recommended Backend Architecture

- **API layer:** REST over HTTP; base path `/api/v1`; consistent wrapped responses `{ success: boolean, data?: T, message?: string }` and standard HTTP status codes.  
- **Auth:** Validate Bearer token on protected routes; attach user id to requests (no auth APIs in this doc).  
- **Contract content:** Store block array as JSON/JSONB; validate structure to avoid invalid BlockNote content.  
- **AI:** Implement chat, review, rewrite, explain, summarize, generate-clause, and suggest-clauses via an AI provider (e.g. OpenAI/Anthropic); consider queue + webhook or polling for long-running jobs.  
- **Export:** Use a library (e.g. pdf-lib, docx, or headless HTML→PDF) to generate PDF/DOCX from contract content (and variables if provided).  
- **Signatures:** Store signature image/data and metadata; integrate with an e-sign provider or custom flow; optional webhook to notify on completion.  
- **Idempotency:** Consider idempotency keys for create/autosave if clients retry.  
- **Rate limiting:** Apply to AI and export endpoints.  
- **CORS:** Allow frontend origin (and env-based BACKEND_URL) for browser requests.

---

## Appendix: Frontend API Client Reference

- **Base URL:** `process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`  
- **Prefix:** `/api/v1`  
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <accessToken>`  
- **Token storage:** `localStorage` (`accessToken`, `refreshToken`); refresh flow uses `POST .../auth/refresh-tokens` (out of scope).  
- **Services:**  
  - `contractService`: getContracts, getContract, createContract, updateContract, autoSaveContract, deleteContract, generateContract, downloadContract (blob), favoriteContract, unfavoriteContract.  
  - `aiService`: sendMessage(contractId, message), reviewContract(contractId).  
  - `reviewService`: reviewContract(contractId) → AIReviewIssue[].  
  - `clauseService`: getClauses, getClause, createClause, updateClause, deleteClause.

All other AI editor features (rewrite, explain, summarize, generate clause, suggest clauses) are currently mocked in the frontend and are candidates for the AI endpoints in Section 4.
