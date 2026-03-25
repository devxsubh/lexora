'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PartialBlock } from '@blocknote/core'
import { AlertTriangle, Brain, FileText, Home, List, Maximize2, Send, Sparkles, Wand2, ArrowLeft, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/helpers'
import {
  ClauseFinder,
  ContractOutline,
  EditorToolbar,
  FloatingAIToolbar,
  ShareDialog,
  VariablesPanel,
  type Variable,
} from '@/components/contract/ContractEditor'

const RichContractEditor = dynamic(
  () => import('@/components/contract/ContractEditor').then((mod) => ({ default: mod.RichContractEditor })),
  { ssr: false }
)

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  clauseTitle?: string
  clauseText?: string
}

type ContextMenuState = {
  open: boolean
  x: number
  y: number
  selectedText: string
}

const defaultContent: PartialBlock[] = [
  {
    type: 'heading',
    props: { level: 1 },
    content: [{ type: 'text', text: 'Confidentiality Agreement', styles: { bold: true } }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'This agreement is entered into between [Company Name] and [Recipient Name] to protect confidential information shared between the parties.',
        styles: {},
      },
    ],
  },
  {
    type: 'heading',
    props: { level: 2 },
    content: [{ type: 'text', text: 'Limitation of Liability', styles: { bold: true } }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Except as required by law, liability shall be limited to fees paid under this agreement during the preceding twelve (12) months.',
        styles: {},
      },
    ],
  },
]

type RailTab = 'chat' | 'vars' | 'templates' | 'more' | 'home' | 'outline'

type MobileEditorPanel = 'none' | 'vars' | 'outline' | 'more'

function CollapsedWorkspaceRail({ active, onChange }: { active: RailTab; onChange: (next: RailTab) => void }) {
  const items: Array<{ id: RailTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'chat',
      label: 'Chat',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-orange-600" />
        </div>
      ),
    },
    {
      id: 'vars',
      label: 'Vars',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">{'{ }'}</span>
        </div>
      ),
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">T</span>
        </div>
      ),
    },
    {
      id: 'more',
      label: 'More',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">…</span>
        </div>
      ),
    },
    {
      id: 'home',
      label: 'Home',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <Home className="w-5 h-5 text-gray-700" />
        </div>
      ),
    },
    {
      id: 'outline',
      label: 'Outline',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <List className="w-5 h-5 text-gray-700" />
        </div>
      ),
    },
  ]

  return (
    <aside className="w-[72px] border-r border-gray-200 bg-white flex flex-col items-center py-4 gap-4 flex-shrink-0">
      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-3 pt-2 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition-colors w-full',
              active === item.id ? 'bg-orange-50' : 'hover:bg-gray-50'
            )}
            title={item.label}
          >
            {item.icon}
            <span className={cn('text-[10px] font-medium', active === item.id ? 'text-orange-700' : 'text-gray-600')}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}

function ClausePreviewCard({
  title,
  text,
  onOpenInEditor,
  onInsertIntoContract,
}: {
  title: string
  text: string
  onOpenInEditor?: () => void
  onInsertIntoContract?: () => void
}) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Clause suggestion</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900 truncate">{title}</p>
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-neutral-200 bg-white/60 px-3 py-2 font-mono text-xs leading-relaxed text-neutral-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
        {text}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenInEditor}
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          Open in editor
        </button>
        <button
          type="button"
          onClick={onInsertIntoContract}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
        >
          Insert into contract
        </button>
      </div>
    </div>
  )
}

function ChatPanel({
  title,
  initialPrompt,
  onOpenInEditor,
  onOpenClauseInEditor,
  onInsertClauseIntoContract,
}: {
  title: string
  initialPrompt?: string
  onOpenInEditor?: () => void
  onOpenClauseInEditor?: (payload: { title: string; text: string }) => void
  onInsertClauseIntoContract?: (payload: { title: string; text: string }) => void
}) {
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const base: ChatMessage[] = [
      {
        id: 'a1',
        role: 'assistant',
        content:
          'Share what you want to build or paste a clause. I can draft, review, highlight risks, and suggest safe edits.',
      },
      {
        id: 'a-clause-1',
        role: 'assistant',
        content: 'Here is a Limitation of Liability clause you can use.',
        clauseTitle: 'Limitation of Liability',
        clauseText:
          'Except as required by law, liability shall be limited to fees paid under this agreement during the preceding twelve (12) months.',
      },
    ]
    if (initialPrompt?.trim()) {
      base.push({ id: 'u1', role: 'user', content: initialPrompt.trim() })
      base.push({
        id: 'a2',
        role: 'assistant',
        content:
          'Got it. I’ll generate a first draft in the editor and highlight any risky language. Want this in Indian jurisdiction or US?',
      })
    }
    return base
  })

  const send = () => {
    const v = text.trim()
    if (!v) return
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: v },
      {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        content:
          'Understood. I’ll update the draft and surface risks + suggested fixes in the review panel (backend integration coming next).',
      },
    ])
    setText('')
  }

  return (
    <section className="border-r border-gray-200 bg-white flex flex-col w-full max-w-full lg:w-[420px]">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chat</div>
            <div className="text-base font-semibold text-gray-900 truncate">{title}</div>
          </div>
          <button
            onClick={onOpenInEditor}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            Open
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={cn('max-w-[92%]', m.role === 'assistant' ? '' : 'ml-auto')}>
            {m.role === 'assistant' && m.clauseTitle && m.clauseText ? (
              <ClausePreviewCard
                title={m.clauseTitle}
                text={m.clauseText}
                onOpenInEditor={
                  onOpenClauseInEditor
                    ? () => onOpenClauseInEditor({ title: m.clauseTitle!, text: m.clauseText! })
                    : undefined
                }
                onInsertIntoContract={
                  onInsertClauseIntoContract
                    ? () => onInsertClauseIntoContract({ title: m.clauseTitle!, text: m.clauseText! })
                    : undefined
                }
              />
            ) : (
              <div
                className={cn(
                  'rounded-2xl px-3 py-2 text-sm leading-relaxed border',
                  m.role === 'assistant'
                    ? 'bg-gray-50 text-gray-700 border-gray-200'
                    : 'bg-orange-50 text-gray-900 border-orange-200'
                )}
              >
                {m.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            placeholder="Ask Lexora…"
            className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={send}
            className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default function ContractsWorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const doc = searchParams.get('doc')?.trim()
  const q = searchParams.get('q')?.trim()

  const title = useMemo(() => doc || 'New contract chat', [doc])
  const initialPrompt = useMemo(() => q || doc || '', [q, doc])

  const [activeRail, setActiveRail] = useState<RailTab>('chat')
  const [focusEditor, setFocusEditor] = useState(false)
  const [workspaceView, setWorkspaceView] = useState<'chat' | 'editor'>('chat')
  const [mobileEditorPanel, setMobileEditorPanel] = useState<MobileEditorPanel>('none')

  const [editorTitle, setEditorTitle] = useState(title)
  const [contractContent, setContractContent] = useState<PartialBlock[]>(defaultContent)
  const [selectedText, setSelectedText] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    selectedText: '',
  })

  const editorAreaRef = useRef<HTMLDivElement>(null)

  const variablesInitial: Variable[] = useMemo(
    () => [
      { id: 'var-company', name: 'Company Name', value: 'Acme Corp', category: 'custom', type: 'text' },
      { id: 'var-recipient', name: 'Recipient Name', value: 'John Doe', category: 'custom', type: 'text' },
      { id: 'var-date', name: 'Effective Date', value: 'Feb 28, 2026', category: 'custom', type: 'date' },
    ],
    []
  )
  const [variables, setVariables] = useState<Variable[]>(variablesInitial)

  useEffect(() => {
    setEditorTitle(title)
  }, [title])

  useEffect(() => {
    const handleSelection = () => {
      const s = window.getSelection()?.toString() || ''
      setSelectedText(s.trim())
    }
    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [])


  useEffect(() => {
    if (!contextMenu.open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu((p) => ({ ...p, open: false }))
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [contextMenu.open])

  const openContextMenu = (e: React.MouseEvent) => {
    const s = window.getSelection()?.toString()?.trim() || ''
    if (!s) return
    e.preventDefault()
    setContextMenu({ open: true, x: e.clientX, y: e.clientY, selectedText: s })
  }

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      {/* subtle grid like landing */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Focus editor mode - same rail + single panel + editor */}
      {focusEditor ? (
        <div className="relative z-10 h-full w-full flex">
          <CollapsedWorkspaceRail active={activeRail} onChange={setActiveRail} />

          {activeRail === 'chat' && (
            <ChatPanel
              title={title}
              initialPrompt={initialPrompt}
              onOpenInEditor={() => setFocusEditor(false)}
            />
          )}
          {activeRail === 'vars' && (
            <section className="w-[420px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vars</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">Document variables</div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <VariablesPanel
                  variables={variables}
                  onVariableChange={(variableId, value) => {
                    setVariables((prev) => prev.map((v) => (v.id === variableId ? { ...v, value } : v)))
                  }}
                  onAddVariable={(name) => {
                    const newVariable: Variable = {
                      id: `var-${Date.now()}`,
                      name,
                      value: '',
                      category: 'custom',
                      type: 'text',
                    }
                    setVariables((prev) => [newVariable, ...prev])
                  }}
                  onDeleteVariable={(variableId) => setVariables((prev) => prev.filter((v) => v.id !== variableId))}
                />
              </div>
            </section>
          )}
          {activeRail === 'outline' && (
            <section className="w-[380px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Outline</h3>
                <div className="mt-3">
                  <ClauseFinder content={contractContent} onNavigate={() => {}} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ContractOutline content={contractContent} onNavigate={() => {}} />
              </div>
            </section>
          )}
          {activeRail === 'home' && (
            <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Home</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">Back to contracts</div>
              </div>
              <div className="flex-1 p-4">
                <button
                  onClick={() => router.push('/contracts')}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <Home className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Open Contracts hub</span>
                </button>
              </div>
            </section>
          )}
          {activeRail === 'templates' && (
            <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Templates</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">Start from a template</div>
              </div>
              <div className="flex-1 p-4 text-sm text-gray-500">Templates panel — coming soon.</div>
            </section>
          )}
          {activeRail === 'more' && (
            <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">More</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">More options</div>
              </div>
              <div className="flex-1 p-4 text-sm text-gray-500">More options — coming soon.</div>
            </section>
          )}

          <section className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
            <EditorToolbar
              title={editorTitle}
              onTitleChange={setEditorTitle}
              onAiReview={() => {}}
              onExport={() => {}}
              onShare={() => setShowShareDialog(true)}
              onRequestSignatures={() => {}}
              content={contractContent}
            />
            <div className="flex-1 min-w-0 overflow-hidden relative" onContextMenu={openContextMenu}>
              <div className="h-full w-full overflow-y-auto scrollbar-hide bg-gray-50">
                <div className="max-w-4xl mx-auto min-h-[calc(100vh-200px)] px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-12">
                  <RichContractEditor
                    initialContent={contractContent}
                    onChange={(c) => setContractContent(c)}
                    onRequestSignature={() => {}}
                    onRequestClauseLibrary={() => {}}
                    onRequestAIGenerator={() => {}}
                    onRequestAISummarize={() => {}}
                    onRequestAISuggest={() => {}}
                    isImmersiveMode={true}
                    onToggleImmersiveMode={() => setFocusEditor(false)}
                  />
                </div>
              </div>
              <FloatingAIToolbar selectedText={selectedText} onRewrite={() => {}} onExplain={() => {}} onGenerate={() => {}} />
            </div>
          </section>
        </div>
      ) : (
        <div className="relative z-10 h-full w-full flex">
          <CollapsedWorkspaceRail active={activeRail} onChange={setActiveRail} />

          {/* Single panel: only the active one is shown on the left; editor is responsive on the right */}
          {activeRail === 'chat' && (
            <ChatPanel
              title={title}
              initialPrompt={initialPrompt}
              onOpenInEditor={() => setWorkspaceView('editor')}
              onOpenClauseInEditor={({ title: clauseTitle, text }) => {
                setContractContent((prev) => [
                  ...prev,
                  {
                    type: 'heading',
                    props: { level: 2 },
                    content: [{ type: 'text', text: clauseTitle, styles: { bold: true } }],
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text, styles: {} }],
                  },
                ] as PartialBlock[])
                setWorkspaceView('editor')
              }}
              onInsertClauseIntoContract={({ title: clauseTitle, text }) => {
                setContractContent((prev) => [
                  ...prev,
                  {
                    type: 'heading',
                    props: { level: 2 },
                    content: [{ type: 'text', text: clauseTitle, styles: { bold: true } }],
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text, styles: {} }],
                  },
                ] as PartialBlock[])
              }}
            />
          )}
          {activeRail === 'vars' && (
            <section className="w-[420px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variables</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">Document variables</div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <VariablesPanel
                  variables={variables}
                  onVariableChange={(variableId, value) => {
                    setVariables((prev) => prev.map((v) => (v.id === variableId ? { ...v, value } : v)))
                  }}
                  onAddVariable={(name) => {
                    const newVariable: Variable = {
                      id: `var-${Date.now()}`,
                      name,
                      value: '',
                      category: 'custom',
                      type: 'text',
                    }
                    setVariables((prev) => [newVariable, ...prev])
                  }}
                  onDeleteVariable={(variableId) => setVariables((prev) => prev.filter((v) => v.id !== variableId))}
                />
              </div>
            </section>
          )}
          {activeRail === 'outline' && (
            <section className="w-[380px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Outline</h3>
                <div className="mt-3">
                  <ClauseFinder content={contractContent} onNavigate={() => {}} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ContractOutline content={contractContent} onNavigate={() => {}} />
              </div>
            </section>
          )}
          {activeRail === 'home' && (
            <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Home</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">Back to contracts</div>
              </div>
              <div className="flex-1 p-4">
                <button
                  onClick={() => router.push('/contracts')}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <Home className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Open Contracts hub</span>
                </button>
              </div>
            </section>
          )}
          {activeRail === 'templates' && (
            <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Templates</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">Start from a template</div>
              </div>
              <div className="flex-1 p-4 text-sm text-gray-500">Templates panel — coming soon.</div>
            </section>
          )}
          {activeRail === 'more' && (
            <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">More</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">More options</div>
              </div>
              <div className="flex-1 p-4 text-sm text-gray-500">More options — coming soon.</div>
            </section>
          )}

          {/* Editor area - responsive: side-by-side on desktop, slide-in on mobile */}
          <section
            className={cn(
              'flex-1 min-w-0 bg-white flex flex-col',
              'fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
              workspaceView === 'editor' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            )}
            ref={editorAreaRef}
          >
            {/* Mobile header with back icon only */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white lg:hidden">
              <button
                type="button"
                onClick={() => setWorkspaceView('chat')}
                className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100"
                aria-label="Back to chat"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contract editor</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMobileEditorPanel('vars')}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100',
                    mobileEditorPanel === 'vars' && 'bg-gray-100 text-gray-900'
                  )}
                  aria-label="Variables"
                >
                  <span className="text-[11px] font-semibold">{'{ }'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileEditorPanel('outline')}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100',
                    mobileEditorPanel === 'outline' && 'bg-gray-100 text-gray-900'
                  )}
                  aria-label="Outline"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileEditorPanel('more')}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100',
                    mobileEditorPanel === 'more' && 'bg-gray-100 text-gray-900'
                  )}
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            <EditorToolbar
              title={editorTitle}
              onTitleChange={setEditorTitle}
              onAiReview={() => {}}
              onExport={() => {}}
              onShare={() => setShowShareDialog(true)}
              onRequestSignatures={() => {}}
              content={contractContent}
            />
            <div className="flex-1 min-w-0 overflow-hidden relative" onContextMenu={openContextMenu}>
              <div className="h-full w-full overflow-y-auto scrollbar-hide bg-gray-50">
                <div className="min-h-[calc(100vh-200px)] px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-12">
                  <RichContractEditor
                    initialContent={contractContent}
                    onChange={(c) => setContractContent(c)}
                    onRequestSignature={() => {}}
                    onRequestClauseLibrary={() => {}}
                    onRequestAIGenerator={() => {}}
                    onRequestAISummarize={() => {}}
                    onRequestAISuggest={() => {}}
                  />
                </div>
              </div>
              <div className="hidden lg:block absolute top-4 right-4 z-20">
                <button
                  onClick={() => setFocusEditor(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Maximize2 className="w-4 h-4" />
                  Focus
                </button>
              </div>
              <FloatingAIToolbar selectedText={selectedText} onRewrite={() => {}} onExplain={() => {}} onGenerate={() => {}} />

              {/* Mobile overlays for Variables / Outline / More */}
              {mobileEditorPanel !== 'none' && (
                <>
                  <div
                    className="fixed inset-0 z-[40] bg-black/30 lg:hidden"
                    onClick={() => setMobileEditorPanel('none')}
                  />
                  <div className="fixed inset-x-0 bottom-0 z-[50] rounded-t-2xl border border-gray-200 bg-white shadow-2xl pb-safe lg:hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-10 rounded-full bg-gray-200" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {mobileEditorPanel === 'vars' && 'Variables'}
                          {mobileEditorPanel === 'outline' && 'Outline'}
                          {mobileEditorPanel === 'more' && 'More'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileEditorPanel('none')}
                        className="text-xs font-medium text-gray-500 hover:text-gray-800"
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
                      {mobileEditorPanel === 'vars' && (
                        <VariablesPanel
                          variables={variables}
                          onVariableChange={(variableId, value) => {
                            setVariables((prev) => prev.map((v) => (v.id === variableId ? { ...v, value } : v)))
                          }}
                          onAddVariable={(name) => {
                            const newVariable: Variable = {
                              id: `var-${Date.now()}`,
                              name,
                              value: '',
                              category: 'custom',
                              type: 'text',
                            }
                            setVariables((prev) => [newVariable, ...prev])
                          }}
                          onDeleteVariable={(variableId) =>
                            setVariables((prev) => prev.filter((v) => v.id !== variableId))
                          }
                        />
                      )}
                      {mobileEditorPanel === 'outline' && (
                        <div className="space-y-4">
                          <ClauseFinder content={contractContent} onNavigate={() => {}} />
                          <ContractOutline content={contractContent} onNavigate={() => {}} />
                        </div>
                      )}
                      {mobileEditorPanel === 'more' && (
                        <div className="text-sm text-gray-500 space-y-2">
                          <p>Additional editor options coming soon.</p>
                          <p className="text-xs text-gray-400">
                            On desktop, use the left rail for templates and more tools.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {contextMenu.open && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setContextMenu((p) => ({ ...p, open: false }))} />
          <div
            className="fixed z-[90] w-56 rounded-xl border border-gray-200 bg-white shadow-2xl py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              AI actions
            </div>
            {[
              { icon: Wand2, label: 'Rewrite with AI' },
              { icon: Brain, label: 'Explain clause' },
              { icon: FileText, label: 'Generate clause' },
              { icon: AlertTriangle, label: 'Highlight risks' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => setContextMenu((p) => ({ ...p, open: false }))}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                <Icon className="w-4 h-4 text-orange-500" />
                {label}
              </button>
            ))}
            <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100 truncate">
              “{contextMenu.selectedText}”
            </div>
          </div>
        </>
      )}

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        documentTitle={editorTitle}
      />
    </div>
  )
}
