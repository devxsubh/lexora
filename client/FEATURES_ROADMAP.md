# Lexora Features Roadmap

This document categorizes all planned features into **Frontend-Only** (can be implemented now) and **Backend-Required** (will be implemented later).

---

## ✅ Frontend-Only Features (Can Implement Now)

### 1. Core Editing Experience

- ✅ **Rich Text Formatting** (bold, italic, underline, color)
  - Status: Already supported by BlockNote
  - Implementation: Use BlockNote's formatting toolbar

- ✅ **Custom Block Types** (clauses, signatures, party info blocks)
  - Status: Can be implemented with BlockNote custom blocks
  - Implementation: Create custom block schemas

- ✅ **Smart Auto-formatting** (auto-numbering clauses, bullet nesting)
  - Status: Frontend logic
  - Implementation: Add auto-numbering logic to heading blocks

- ✅ **Section & Subsection Templates**
  - Status: Frontend templates
  - Implementation: Create template library with pre-defined structures

- ✅ **Contract Outline Sidebar** (auto-generated from headings)
  - Status: Frontend parsing
  - Implementation: Parse document structure and generate outline

- ✅ **Cross-reference linking** (e.g., "see clause 5.2")
  - Status: Frontend linking
  - Implementation: Add custom link handler for clause references

- ✅ **Inline Comments & Suggestions**
  - Status: BlockNote supports comments
  - Implementation: Enable BlockNote's comments feature

- ✅ **Drag & Drop Blocks** (reorder sections easily)
  - Status: Already supported by BlockNote
  - Implementation: Use BlockNote's drag handle

### 2. Visual & UI Enhancements

- ✅ **Minimalistic Toolbar** with subtle hover animations
  - Status: Frontend UI
  - Implementation: Custom toolbar styling with CSS animations

- ✅ **Floating AI Toolbar** (appears on text selection)
  - Status: Frontend UI
  - Implementation: Show toolbar on text selection

- ✅ **/Slash Command Menu** with smooth animations
  - Status: Already working
  - Implementation: Enhance with custom animations

- ✅ **Custom Cursor Indicator** (for collaboration view)
  - Status: Frontend UI
  - Implementation: Add cursor indicators (will be functional when backend is ready)

- ✅ **Theme Customizer** (Light, Dark, Legal Gold, Midnight Blue)
  - Status: Frontend CSS
  - Implementation: CSS variables and theme switcher

- ✅ **Section Color Bands** (each clause visually distinct)
  - Status: Frontend styling
  - Implementation: Add background colors to clause blocks

- ✅ **Collapsible Clause Sections**
  - Status: Frontend UI
  - Implementation: Add collapse/expand functionality to headings

- ✅ **Smart Clause Finder** (search by topic, clause name, or keyword)
  - Status: Frontend search
  - Implementation: Client-side search through document content

- ✅ **Animated Transitions** for adding/removing blocks
  - Status: Frontend animations
  - Implementation: CSS transitions and Framer Motion

- ✅ **Signature Font Mode** (handwritten-style signature input)
  - Status: Frontend styling
  - Implementation: Custom font for signature blocks

### 3. Smart Editor Intelligence (Frontend-Only Parts)

- ✅ **Inline Clause Tags** (mark as mandatory, optional, risky)
  - Status: Frontend UI
  - Implementation: Add tag system to blocks

- ✅ **Suggest Formatting Rules** (e.g., "use consistent numbering style")
  - Status: Frontend validation
  - Implementation: Client-side formatting checks

### 4. Collaboration & Export (Frontend-Only Parts)

- ✅ **Export to PDF, DOCX, Markdown, HTML**
  - Status: Frontend libraries
  - Implementation: Use libraries like `jsPDF`, `docx`, etc.

- ✅ **E-signature Integration** (UI only - mock signatures)
  - Status: Frontend UI
  - Implementation: Create signature input UI (actual signing needs backend)

### 5. Premium Touches

- ✅ **Gentle micro-animations** for block focus / AI actions
  - Status: Frontend
  - Implementation: CSS animations and Framer Motion

- ✅ **Floating "Navigator" button** → quickly jump to any section
  - Status: Frontend
  - Implementation: Scroll spy and navigation menu

- ✅ **Immersive Writing Mode** (hides sidebars, focus on content)
  - Status: Frontend UI toggle
  - Implementation: Toggle sidebar visibility

- ✅ **Smart Clause Library** (favorites & saved templates)
  - Status: Frontend with localStorage
  - Implementation: Store templates in localStorage (migrate to backend later)

- ✅ **Mirror Mode** — split-view original vs AI-revised version
  - Status: Frontend split view
  - Implementation: Side-by-side editor view (AI revision will need backend)

- ✅ **Onboarding Tour** (interactive tutorial on first use)
  - Status: Frontend
  - Implementation: Use library like `react-joyride` or custom tour

---

## 🔄 Backend-Required Features (Will Be Implemented Later)

### 1. Core Editing Experience

- 🔄 **Autosave & Version History**
  - Reason: Needs backend storage for document versions
  - Backend Requirements: Database, versioning system, API endpoints

### 2. AI-Powered Features (All Require Backend)

- 🔄 **"Chat with your Contract" sidebar** (context-aware legal assistant)
  - Reason: Needs AI API integration
  - Backend Requirements: AI service integration (OpenAI, Anthropic, etc.)

- 🔄 **Rewrite Clause with AI** (tone: formal, friendly, concise)
  - Reason: Needs AI API
  - Backend Requirements: AI service with prompt engineering

- 🔄 **AI Clause Generator** (prompt-based clause insertion)
  - Reason: Needs AI API
  - Backend Requirements: AI service for clause generation

- 🔄 **Clause Reviewer** — highlights ambiguous or risky language
  - Reason: Needs AI API for legal analysis
  - Backend Requirements: AI service with legal knowledge

- 🔄 **Explain Clause** — AI breaks down complex legal terms
  - Reason: Needs AI API
  - Backend Requirements: AI service with legal terminology

- 🔄 **Suggest Missing Clauses** (e.g., add indemnity or NDA clause)
  - Reason: Needs AI API
  - Backend Requirements: AI service with contract analysis

- 🔄 **Summarize Contract** (short overview for quick review)
  - Reason: Needs AI API
  - Backend Requirements: AI service for summarization

- 🔄 **Compare Versions** (AI highlights legal differences)
  - Reason: Needs backend storage + AI API
  - Backend Requirements: Version storage + AI diff analysis

- 🔄 **Legal Term Glossary Pop-ups** (hover definitions)
  - Reason: Better with backend for dynamic updates
  - Backend Requirements: Legal term database/API
  - Note: Can be implemented frontend-only with static data

- 🔄 **Voice Command Editing**
  - Reason: Needs speech-to-text API
  - Backend Requirements: Speech recognition service (or client-side API)

### 3. Smart Editor Intelligence (Backend-Required Parts)

- 🔄 **Clause Type Detection** (detects NDA, liability, payment terms)
  - Reason: Better accuracy with AI/ML
  - Backend Requirements: ML model or AI service
  - Note: Can have basic frontend detection, but AI is better

- 🔄 **Smart Templates** (auto-fill company name, party info, date)
  - Reason: Needs backend data storage
  - Backend Requirements: User data, company database

- 🔄 **Contract Consistency Checker** (ensures all references match)
  - Reason: Needs backend processing for complex analysis
  - Backend Requirements: Document analysis service

- 🔄 **Document Readability Scoring** (grade legal complexity)
  - Reason: Needs AI/ML analysis
  - Backend Requirements: AI service for readability analysis

### 4. Collaboration & Export (Backend-Required Parts)

- 🔄 **Real-time Collaboration** (via Y.js or Liveblocks)
  - Reason: Needs backend for synchronization
  - Backend Requirements: WebSocket server, conflict resolution

- 🔄 **Comment Threads per Clause**
  - Reason: Needs backend storage
  - Backend Requirements: Database for comments, API endpoints

- 🔄 **E-signature Integration** (actual signing)
  - Reason: Needs backend for signature verification
  - Backend Requirements: Signature service (DocuSign, HelloSign, etc.)

- 🔄 **Clause Approval Workflow** (mark as "Reviewed," "Pending")
  - Reason: Needs backend for workflow state
  - Backend Requirements: Workflow engine, state management

- 🔄 **Activity Log** (who edited what and when)
  - Reason: Needs backend storage
  - Backend Requirements: Audit log database, API endpoints

### 5. Premium Touches (Backend-Required Parts)

- 🔄 **AI Notifications** ("You might want to add a dispute clause")
  - Reason: Needs backend for AI analysis
  - Backend Requirements: AI service + notification system

- 🔄 **"Smart Blocks"** (dynamic clauses — auto-update based on input data)
  - Reason: Needs backend for data processing
  - Backend Requirements: Data processing service, template engine

---

## 📋 Implementation Priority

### Phase 1: Core Frontend Features (Current)
- Rich text formatting ✅
- Custom block types
- Drag & drop
- Slash commands ✅
- Basic toolbar
- Theme customizer
- Export functionality

### Phase 2: Enhanced Frontend Features
- Contract outline sidebar
- Collapsible sections
- Clause finder
- Cross-reference linking
- Inline comments
- Signature UI
- Onboarding tour

### Phase 3: Backend Integration (Future)
- Autosave & version history
- AI features
- Real-time collaboration
- E-signature integration
- Activity logging

---

## 🎯 Quick Reference

**Total Features:** 50+
- **Frontend-Only:** ~35 features
- **Backend-Required:** ~15 features

**Current Status:**
- ✅ Basic editor working
- ✅ Slash commands working
- ✅ Side menu working
- 🔄 Custom blocks (in progress)
- ⏳ AI features (pending backend)
- ⏳ Collaboration (pending backend)






