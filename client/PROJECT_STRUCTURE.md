# Lexora Frontend - Project Structure

## 📁 Complete Folder Structure

```
frontend/
├── public/                          # Static assets
│   ├── images/                      # Image assets
│   ├── icons/                       # Icon files
│   └── fonts/                       # Custom fonts
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout with Sidebar
│   │   ├── page.tsx                 # Home page (redirects to contracts/new)
│   │   ├── contracts/
│   │   │   ├── page.tsx             # Contracts list page
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Contract Generator (Main Feature)
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Contract editor page
│   │   └── clause-library/
│   │       └── page.tsx             # Clause library page
│   │
│   ├── components/                  # React Components
│   │   ├── ui/                      # Base UI Components (Reusable)
│   │   │   ├── Button/              # Button component
│   │   │   ├── Input/               # Input component
│   │   │   ├── Card/                # Card component
│   │   │   └── Loading/             # Loading spinner
│   │   │
│   │   ├── layout/                  # Layout Components
│   │   │   └── Sidebar/             # Navigation sidebar
│   │   │
│   │   └── contract/                # Contract-specific Components
│   │       └── ContractGenerator/   # Generator components
│   │           ├── PromptInput.tsx  # AI prompt input with auto-resize
│   │           ├── TemplateCard.tsx # Template selection cards
│   │           └── QuickActionCard.tsx # Quick action buttons
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useContract.ts           # Contract management hook
│   │   └── useDebounce.ts           # Debounce utility hook
│   │
│   ├── services/                    # API & Services
│   │   ├── api/
│   │   │   ├── client.ts            # Axios client with interceptors
│   │   │   ├── contracts.ts         # Contract API service
│   │   │   ├── ai.ts                # AI chat service
│   │   │   ├── clauses.ts           # Clause library service
│   │   │   └── review.ts            # Contract review service
│   │   └── storage/
│   │       └── localStorage.ts      # Local storage utility
│   │
│   ├── store/                       # State Management
│   │   └── index.ts                 # Zustand store setup
│   │
│   ├── types/                       # TypeScript Types
│   │   ├── contract.ts              # Contract types
│   │   ├── ai.ts                    # AI/Chat types
│   │   ├── clause.ts                # Clause types
│   │   └── index.ts                 # Type exports
│   │
│   ├── utils/                       # Utility Functions
│   │   ├── helpers.ts               # General helpers (cn, formatDate, debounce)
│   │   └── constants.ts             # App constants (templates, etc.)
│   │
│   ├── styles/                      # Global Styles
│   │   └── globals.css              # Tailwind + custom styles
│   │
│   └── lib/                         # Third-party Configs
│       └── queryClient.ts           # React Query setup (if needed)
│
├── .env.example                     # Environment variables template
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore rules
├── .prettierrc                      # Prettier configuration
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies & scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project documentation
```

## 🎨 Key Features Implemented

### 1. **Contract Generator Page** (`/contracts/new`)
- ✨ Beautiful gradient background with animated elements
- 💬 Large, auto-resizing prompt input with sparkle icon
- 🎯 6 popular contract templates with hover animations
- ⚡ Quick actions (Blank page, Import PDF)
- 📱 Fully responsive design
- 🎭 Smooth Framer Motion animations

### 2. **Reusable Components**
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Input**: With label and error states
- **Card**: Hover effects and customizable
- **Loading**: Spinner component
- **Sidebar**: Collapsible navigation with active states

### 3. **Design System**
- Primary color: Indigo/Purple gradient
- Modern, clean UI with subtle shadows
- Smooth transitions and animations
- Accessible focus states
- Custom scrollbar styling

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📦 Dependencies

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### Styling & UI
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Utilities
- **Axios** - HTTP client
- **Zustand** - State management
- **clsx** + **tailwind-merge** - Class name utilities

## 🎯 Next Steps

To complete the application, you'll need to:

1. **Contract Editor** - Implement Notion-style block editor
2. **AI Chat Interface** - Build chat component for contract Q&A
3. **Contract Reviewer** - Create review panel with risk analysis
4. **Clause Library** - Build clause browsing and management UI
5. **Authentication** - Add user auth if needed
6. **Export Functionality** - PDF/DOCX export features

## 🏗️ Architecture Decisions

- **App Router**: Using Next.js 14 App Router for modern routing
- **Component Structure**: Feature-based + shared UI components
- **Type Safety**: Full TypeScript coverage
- **Styling**: Tailwind CSS for rapid development
- **State Management**: Zustand for lightweight global state
- **API Layer**: Axios with interceptors for auth/error handling

## 📝 Code Quality

- ✅ TypeScript strict mode enabled
- ✅ ESLint configured
- ✅ Prettier for code formatting
- ✅ Consistent component structure
- ✅ Reusable utility functions
- ✅ Proper error handling patterns

