'use client'

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PartialBlock } from '@blocknote/core'
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronDown,
  FileText,
  Home,
  LayoutGrid,
  Lightbulb,
  List,
  Loader2,
  Maximize2,
  Plus,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Wand2,
  X,
  ArrowLeft,
  MoreHorizontal,
  Copy,
} from 'lucide-react'
import { cn } from '@/utils/helpers'
import { aiService, type ReviewIssue, type ClauseSuggestion } from '@/services/api/ai'
import { contractService } from '@/services/api/contracts'
import { templateService, type Template } from '@/services/api/templates'
import type { ChatMessage } from '@/types/ai'
import {
  ClauseFinder,
  ContractOutline,
  EditorToolbar,
  FloatingAIToolbar,
  ShareDialog,
  VariableFillPopover,
  VariablesPanel,
  type Variable,
} from '@/components/contract/ContractEditor'

const RichContractEditor = dynamic(
  () => import('@/components/contract/ContractEditor').then((mod) => ({ default: mod.RichContractEditor })),
  { ssr: false }
)

type ContextMenuState = {
  open: boolean
  x: number
  y: number
  selectedText: string
}

const defaultContent: PartialBlock[] = [{ type: 'paragraph', content: [{ type: 'text', text: '', styles: {} }] }]

type RailTab = 'chat' | 'vars' | 'templates' | 'more' | 'home' | 'outline'

type MobileEditorPanel = 'none' | 'vars' | 'outline' | 'more'

function CollapsedWorkspaceRail({
  active,
  onChange,
  onNavigateDashboard,
}: {
  active: RailTab
  onChange: (next: RailTab) => void
  onNavigateDashboard?: () => void
}) {
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
      <button
        type="button"
        onClick={onNavigateDashboard}
        className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition-colors w-full hover:bg-gray-50"
        title="Dashboard"
      >
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-gray-700" />
        </div>
        <span className="text-[10px] font-medium text-gray-600">Dashboard</span>
      </button>
    </aside>
  )
}


function blocksFromMarkdown(text: string): PartialBlock[] {
  const lines = text
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)

  return lines.map((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      return {
        id: `h1-${idx}`,
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: trimmed.replace(/^#\s+/, ''), styles: {} }],
      } as PartialBlock
    }
    if (trimmed.startsWith('## ')) {
      return {
        id: `h2-${idx}`,
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: trimmed.replace(/^##\s+/, ''), styles: {} }],
      } as PartialBlock
    }
    if (trimmed.startsWith('### ')) {
      return {
        id: `h3-${idx}`,
        type: 'heading',
        props: { level: 3 },
        content: [{ type: 'text', text: trimmed.replace(/^###\s+/, ''), styles: {} }],
      } as PartialBlock
    }
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return {
        id: `b-${idx}`,
        type: 'bulletListItem',
        props: {},
        content: [{ type: 'text', text: trimmed.replace(/^[•\-*]\s+/, ''), styles: {} }],
      } as PartialBlock
    }
    return {
      id: `p-${idx}`,
      type: 'paragraph',
      props: {},
      content: [{ type: 'text', text: trimmed, styles: {} }],
    } as PartialBlock
  })
}

const severityColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
}

const typeIcons: Record<string, React.ReactNode> = {
  risk: <ShieldAlert className="w-4 h-4" />,
  missing: <AlertTriangle className="w-4 h-4" />,
  inconsistency: <AlertTriangle className="w-4 h-4" />,
  suggestion: <Lightbulb className="w-4 h-4" />,
}

function ChatPanel({
  title,
  messages,
  inputValue,
  onInputChange,
  onSend,
  isProcessing,
  disabled,
  onOpenInEditor,
}: {
  title: string
  messages: ChatMessage[]
  inputValue: string
  onInputChange: (next: string) => void
  onSend: () => void
  isProcessing: boolean
  disabled?: boolean
  onOpenInEditor?: () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing])

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
            type="button"
          >
            Open
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={cn('max-w-[92%]', m.role === 'assistant' ? '' : 'ml-auto')}>
            <div
              className={cn(
                'rounded-2xl px-3 py-2 text-sm leading-relaxed border whitespace-pre-wrap',
                m.role === 'assistant' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-orange-50 text-gray-900 border-orange-200'
              )}
            >
              {m.content}
              {m.role === 'assistant' && m.citations && m.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-[11px] text-gray-500">
                  <div className="font-medium text-gray-600 mb-1">Sources</div>
                  {m.citations.map((c, idx) => (
                    <div key={`${c.startLine}-${c.endLine}-${idx}`} className="leading-snug">
                      Lines {c.startLine}-{c.endLine}: {c.quote}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="max-w-[92%]">
            <div className="rounded-2xl px-3 py-2 text-sm leading-relaxed border bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100">
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500/20',
            disabled ? 'border-gray-200 opacity-60' : 'border-gray-200 focus-within:border-orange-500'
          )}
        >
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSend()
            }}
            placeholder={disabled ? 'Generating contract…' : 'Ask Lexora…'}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 placeholder-gray-400"
            disabled={disabled}
          />
          <button
            onClick={onSend}
            className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50"
            title="Send"
            type="button"
            disabled={disabled || !inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

function AIResultModal({
  title,
  icon,
  isOpen,
  onClose,
  isLoading,
  children,
}: {
  title: string
  icon: React.ReactNode
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
  children: React.ReactNode
}) {
  if (!isOpen) return null
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[10%] z-[70] mx-auto max-w-2xl max-h-[75vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">{icon}</div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Analyzing…</span>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  )
}

export default function ContractsWorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const doc = searchParams.get('doc')?.trim()
  const q = searchParams.get('q')?.trim()
  const view = searchParams.get('view')?.trim()
  const templateParam = searchParams.get('template')?.trim()

  const title = useMemo(() => doc || 'New contract chat', [doc])
  const initialPrompt = useMemo(() => q || doc || '', [q, doc])

  const [activeRail, setActiveRail] = useState<RailTab>('chat')
  const [focusEditor, setFocusEditor] = useState(false)
  const [workspaceView, setWorkspaceView] = useState<'chat' | 'editor'>('chat')
  const [mobileEditorPanel, setMobileEditorPanel] = useState<MobileEditorPanel>('none')

  const [editorTitle, setEditorTitle] = useState(title)
  const [contractContent, setContractContent] = useState<PartialBlock[]>(defaultContent)
  const [contractId, setContractId] = useState<string | null>(null)
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'streaming' | 'ready'>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'a1',
      role: 'assistant',
      content: 'Share what you want to build. I\'ll draft a contract and keep it updated while we chat.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatProcessing, setIsChatProcessing] = useState(false)
  const streamedTextRef = useRef<string>('')
  const streamControllerRef = useRef<AbortController | null>(null)
  const startedRef = useRef(false)
  const [selectedText, setSelectedText] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    selectedText: '',
  })

  const editorAreaRef = useRef<HTMLDivElement>(null)

  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  const [variables, setVariables] = useState<Variable[]>([])
  const [variablePopover, setVariablePopover] = useState<{ variableName: string; anchorEl: HTMLElement } | null>(null)

  // --- AI Feature State ---
  const [reviewIssues, setReviewIssues] = useState<ReviewIssue[]>([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const [rewriteOpen, setRewriteOpen] = useState(false)
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [rewriteResult, setRewriteResult] = useState<string | null>(null)
  const [rewriteTone, setRewriteTone] = useState<'formal' | 'friendly' | 'concise'>('formal')
  const [rewriteSource, setRewriteSource] = useState('')

  const [explainOpen, setExplainOpen] = useState(false)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainResult, setExplainResult] = useState<string | null>(null)
  const [explainSource, setExplainSource] = useState('')

  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryResult, setSummaryResult] = useState<string | null>(null)

  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [generateResult, setGenerateResult] = useState<string | null>(null)
  const [generatePrompt, setGeneratePrompt] = useState('')

  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestResults, setSuggestResults] = useState<ClauseSuggestion[]>([])

  useEffect(() => {
    setEditorTitle(title)
  }, [title])

  useEffect(() => {
    const regex = /\{\{([^}]+)\}\}/g
    const detected = new Set<string>()
    for (const block of contractContent || []) {
      const parts = Array.isArray((block as any)?.content) ? (block as any).content : []
      for (const part of parts) {
        const text = typeof part?.text === 'string' ? part.text : ''
        if (!text.includes('{{')) continue
        regex.lastIndex = 0
        let m
        while ((m = regex.exec(text)) !== null) {
          const name = (m[1] || '').trim()
          if (name) detected.add(name)
        }
      }
    }
    if (detected.size === 0) return
    setVariables((prev) => {
      const existing = new Set(prev.map((v) => v.name))
      const next = [...prev]
      for (const name of detected) {
        if (existing.has(name)) continue
        next.push({ id: `var-${Date.now()}-${name}`, name, value: '', category: 'custom', type: 'text' })
      }
      return next
    })
  }, [contractContent])

  const applyVariableValueToContent = (variableName: string, value: string) => {
    const esc = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`\\{\\{\\s*${esc}\\s*\\}\\}`, 'g')
    setContractContent((prev) => {
      const list = prev || []
      return list.map((block: any) => {
        const raw = Array.isArray(block?.content) ? block.content : null
        if (!raw) return block
        const nextContent = raw.map((p: any) => {
          if (p?.type !== 'text' || typeof p.text !== 'string') return p
          return { ...p, text: p.text.replace(re, value) }
        })
        return { ...block, content: nextContent }
      })
    })
  }

  useEffect(() => {
    if (view === 'templates') {
      setActiveRail('templates')
      setWorkspaceView('editor')
    }
  }, [view])

  useEffect(() => {
    if (activeRail !== 'templates') return
    if (templatesLoading) return
    if (templates.length > 0) return

    let alive = true
    setTemplatesLoading(true)
    setTemplatesError(null)
    templateService
      .listTemplates()
      .then((res) => {
        if (!alive) return
        setTemplates(res || [])
      })
      .catch((e) => {
        if (!alive) return
        setTemplatesError(e instanceof Error ? e.message : 'Failed to load templates')
      })
      .finally(() => {
        if (!alive) return
        setTemplatesLoading(false)
      })

    return () => {
      alive = false
    }
  }, [activeRail, templatesLoading, templates.length])

  useEffect(() => {
    if (startedRef.current) return
    if (!initialPrompt?.trim()) return

    startedRef.current = true
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: initialPrompt.trim() },
      { id: `a-${Date.now() + 1}`, role: 'assistant', content: 'Generating a first draft now…' },
    ])
    setGenerationPhase('streaming')
    setWorkspaceView('editor')

    streamControllerRef.current = aiService.generateContractStream(initialPrompt.trim(), {
      onChunk: (text) => {
        streamedTextRef.current += text
        const next = blocksFromMarkdown(streamedTextRef.current)
        setContractContent(next.length ? next : defaultContent)
      },
      onDone: ({ contractId, title: generatedTitle, content }) => {
        setContractId(contractId)
        setGenerationPhase('ready')
        if (generatedTitle) setEditorTitle(generatedTitle)
        if (Array.isArray(content) && content.length > 0) setContractContent(content as any)
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: 'Draft ready. Keep chatting — I can update the document as you go.' },
        ])
      },
      onError: (message) => {
        setGenerationPhase('idle')
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: message }])
      },
    }) as unknown as AbortController

    return () => {
      streamControllerRef.current?.abort()
      streamControllerRef.current = null
    }
  }, [initialPrompt])

  useEffect(() => {
    if (!templateParam) return
    if (contractId) return
    if (generationPhase === 'streaming') return

    const ensureTemplates = async (): Promise<Template[]> => {
      if (templates.length > 0) return templates
      const res = await templateService.listTemplates()
      setTemplates(res || [])
      return res || []
    }

    ;(async () => {
      try {
        setWorkspaceView('editor')
        setActiveRail('templates')
        setGenerationPhase('streaming')

        const list = await ensureTemplates()
        const found =
          list.find((t) => t.id === templateParam) ||
          list.find((t) => (t.title || '').toLowerCase().includes(templateParam.toLowerCase()))

        if (!found) {
          setGenerationPhase('idle')
          setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: 'Template not found.' }])
          return
        }

        const created = await templateService.createFromTemplate(found.id)
        setContractId(created.id)
        setGenerationPhase('ready')
        setEditorTitle(created.title || found.title || 'Untitled Agreement')
        if (Array.isArray(created.content) && created.content.length > 0) {
          setContractContent(created.content as any)
        }
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: `Started from template: ${found.title || 'Template'}.` },
        ])
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to create contract from template'
        setGenerationPhase('idle')
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: msg }])
      }
    })()
  }, [templateParam, contractId, generationPhase, templates])

  const sendChat = async () => {
    const v = chatInput.trim()
    if (!v) return
    if (!contractId) return
    if (isChatProcessing) return

    setChatInput('')
    setIsChatProcessing(true)
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: v }])

    try {
      const resp = await aiService.sendMessage(contractId, v)
      setMessages((prev) => [...prev, resp])
      if (resp.contractUpdated && Array.isArray(resp.updatedContent) && resp.updatedContent.length > 0) {
        setContractContent(resp.updatedContent as any)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send message'
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: msg }])
    } finally {
      setIsChatProcessing(false)
    }
  }

  // --- AI Action Handlers ---
  const handleAiReview = useCallback(async () => {
    if (!contractId || reviewLoading) return
    setReviewOpen(true)
    setReviewLoading(true)
    setReviewIssues([])
    try {
      const issues = await aiService.reviewContract(contractId)
      setReviewIssues(issues)
    } catch (e) {
      setReviewIssues([{
        id: 'err',
        type: 'suggestion',
        severity: 'medium',
        title: 'Review failed',
        description: e instanceof Error ? e.message : 'Unable to complete review',
        suggestion: 'Try again in a moment.',
      }])
    } finally {
      setReviewLoading(false)
    }
  }, [contractId, reviewLoading])

  const handleRewrite = useCallback(async (text?: string) => {
    const source = text || selectedText
    if (!contractId || !source.trim()) return
    setRewriteSource(source)
    setRewriteResult(null)
    setRewriteOpen(true)
  }, [contractId, selectedText])

  const executeRewrite = useCallback(async () => {
    if (!contractId || !rewriteSource.trim() || rewriteLoading) return
    setRewriteLoading(true)
    try {
      const result = await aiService.rewriteSelection(contractId, rewriteSource, rewriteTone)
      setRewriteResult(result)
    } catch (e) {
      setRewriteResult(`Error: ${e instanceof Error ? e.message : 'Rewrite failed'}`)
    } finally {
      setRewriteLoading(false)
    }
  }, [contractId, rewriteSource, rewriteTone, rewriteLoading])

  const handleExplain = useCallback(async (text?: string) => {
    const source = text || selectedText
    if (!contractId || !source.trim()) return
    setExplainSource(source)
    setExplainResult(null)
    setExplainOpen(true)
    setExplainLoading(true)
    try {
      const result = await aiService.explainClause(contractId, source)
      setExplainResult(result)
    } catch (e) {
      setExplainResult(`Error: ${e instanceof Error ? e.message : 'Explanation failed'}`)
    } finally {
      setExplainLoading(false)
    }
  }, [contractId, selectedText])

  const handleSummarize = useCallback(async () => {
    if (!contractId || summaryLoading) return
    setSummaryOpen(true)
    setSummaryLoading(true)
    setSummaryResult(null)
    try {
      const result = await aiService.summarizeContract(contractId)
      setSummaryResult(result)
    } catch (e) {
      setSummaryResult(`Error: ${e instanceof Error ? e.message : 'Summary failed'}`)
    } finally {
      setSummaryLoading(false)
    }
  }, [contractId, summaryLoading])

  const handleGenerateClause = useCallback(async () => {
    if (!contractId || !generatePrompt.trim() || generateLoading) return
    setGenerateLoading(true)
    setGenerateResult(null)
    try {
      const result = await aiService.generateClause(contractId, generatePrompt)
      setGenerateResult(result)
    } catch (e) {
      setGenerateResult(`Error: ${e instanceof Error ? e.message : 'Generation failed'}`)
    } finally {
      setGenerateLoading(false)
    }
  }, [contractId, generatePrompt, generateLoading])

  const handleSuggestClauses = useCallback(async () => {
    if (!contractId || suggestLoading) return
    setSuggestOpen(true)
    setSuggestLoading(true)
    setSuggestResults([])
    try {
      const results = await aiService.suggestClauses(contractId)
      setSuggestResults(results)
    } catch (e) {
      setSuggestResults([])
    } finally {
      setSuggestLoading(false)
    }
  }, [contractId, suggestLoading])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }, [])

  const insertClauseToEditor = useCallback((text: string) => {
    const newBlocks = blocksFromMarkdown(text)
    setContractContent((prev) => [...prev, ...newBlocks])
  }, [])

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

  const handleExport = async (format: 'pdf' | 'docx' | 'md' | 'html') => {
    if (!contractId) return
    const blob = await contractService.downloadContract(contractId, format)
    const safeTitle = (editorTitle || 'contract').replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${safeTitle || 'contract'}.${format}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const hasContract = !!contractId && generationPhase === 'ready'

  const MorePanel = () => (
    <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Tools</div>
        <div className="text-base font-semibold text-gray-900 mt-0.5">Contract Intelligence</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <button
          type="button"
          onClick={handleAiReview}
          disabled={!hasContract}
          className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-orange-50 hover:border-orange-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">AI Review</div>
            <div className="text-xs text-gray-500 mt-0.5">Find risks, gaps &amp; issues</div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleSummarize}
          disabled={!hasContract}
          className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-orange-50 hover:border-orange-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Summarize</div>
            <div className="text-xs text-gray-500 mt-0.5">Get a concise overview</div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleSuggestClauses}
          disabled={!hasContract}
          className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-orange-50 hover:border-orange-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Suggest Clauses</div>
            <div className="text-xs text-gray-500 mt-0.5">Find missing protections</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setGenerateOpen(true); setGenerateResult(null); setGeneratePrompt('') }}
          disabled={!hasContract}
          className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-orange-50 hover:border-orange-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Plus className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Generate Clause</div>
            <div className="text-xs text-gray-500 mt-0.5">Create a new clause from prompt</div>
          </div>
        </button>

        {!hasContract && (
          <p className="text-xs text-gray-400 text-center pt-3">
            Generate or load a contract first to use AI tools.
          </p>
        )}
      </div>
    </section>
  )

  const renderEditorSection = (isFocus: boolean) => (
    <section
      className={cn(
        'flex-1 min-w-0 bg-white flex flex-col overflow-hidden',
        !isFocus && 'fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        !isFocus && (workspaceView === 'editor' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
      )}
      ref={!isFocus ? editorAreaRef : undefined}
    >
      {!isFocus && (
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
      )}
      <EditorToolbar
        title={editorTitle}
        onTitleChange={setEditorTitle}
        onAiReview={handleAiReview}
        onExport={handleExport}
        onShare={() => setShowShareDialog(true)}
        onRequestSignatures={() => {}}
        content={contractContent}
      />
      <div className="flex-1 min-w-0 overflow-hidden relative" onContextMenu={openContextMenu}>
        <div className="h-full w-full overflow-y-auto scrollbar-hide bg-gray-50">
          <div className={cn('min-h-[calc(100vh-200px)] px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-12', isFocus && 'max-w-4xl mx-auto')}>
            <RichContractEditor
              initialContent={contractContent}
              onChange={(c) => setContractContent(c)}
              onRequestSignature={() => {}}
              onRequestClauseLibrary={() => {}}
              onRequestAIGenerator={() => { setGenerateOpen(true); setGenerateResult(null); setGeneratePrompt('') }}
              onRequestAISummarize={handleSummarize}
              onRequestAISuggest={handleSuggestClauses}
              isImmersiveMode={isFocus}
              onToggleImmersiveMode={() => setFocusEditor(!isFocus)}
              enableVariableHighlight
              onVariableClick={(variableName, element) => setVariablePopover({ variableName, anchorEl: element })}
            />
          </div>
        </div>
        {!isFocus && (
          <div className="hidden lg:block absolute top-4 right-4 z-20">
            <button
              onClick={() => setFocusEditor(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
              Focus
            </button>
          </div>
        )}
        <FloatingAIToolbar
          selectedText={selectedText}
          onRewrite={() => handleRewrite()}
          onExplain={() => handleExplain()}
          onGenerate={() => { setGenerateOpen(true); setGenerateResult(null); setGeneratePrompt('') }}
        />

        {!isFocus && mobileEditorPanel !== 'none' && (
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
  )

  const renderVarsPanel = () => (
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
  )

  const renderOutlinePanel = () => (
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
  )

  const renderHomePanel = () => (
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
  )

  const renderTemplatesPanel = () => (
    <section className="w-[320px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Templates</div>
        <div className="text-base font-semibold text-gray-900 mt-0.5">Start from a template</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {templatesError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {templatesError}
          </div>
        )}
        {templatesLoading && templates.length === 0 ? (
          <div className="text-sm text-gray-500">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="text-sm text-gray-500">No templates available.</div>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={async () => {
                  try {
                    setTemplatesError(null)
                    setGenerationPhase('streaming')
                    const created = await templateService.createFromTemplate(t.id)
                    setContractId(created.id)
                    setGenerationPhase('ready')
                    setEditorTitle(created.title || t.title || 'Untitled Agreement')
                    if (Array.isArray(created.content) && created.content.length > 0) {
                      setContractContent(created.content as any)
                    }
                    setMessages((prev) => [
                      ...prev,
                      { id: `a-${Date.now()}`, role: 'assistant', content: `Started from template: ${t.title || 'Template'}.` },
                    ])
                  } catch (e) {
                    setGenerationPhase('idle')
                    setTemplatesError(e instanceof Error ? e.message : 'Failed to create from template')
                  }
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-left hover:bg-orange-50 hover:border-orange-200 transition-colors"
              >
                <div className="text-sm font-semibold text-gray-900">{t.title || 'Untitled template'}</div>
                {t.description && <div className="mt-1 text-xs text-gray-500 line-clamp-2">{t.description}</div>}
                {t.category && (
                  <div className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                    {t.category}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )

  const renderSidePanel = () => {
    switch (activeRail) {
      case 'chat':
        return (
          <ChatPanel
            title={title}
            messages={messages}
            inputValue={chatInput}
            onInputChange={setChatInput}
            onSend={sendChat}
            isProcessing={isChatProcessing}
            disabled={generationPhase !== 'ready' || !contractId}
            onOpenInEditor={focusEditor ? () => setFocusEditor(false) : () => setWorkspaceView('editor')}
          />
        )
      case 'vars': return renderVarsPanel()
      case 'outline': return renderOutlinePanel()
      case 'home': return renderHomePanel()
      case 'templates': return renderTemplatesPanel()
      case 'more': return <MorePanel />
      default: return null
    }
  }

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
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

      <div className="relative z-10 h-full w-full flex">
        <CollapsedWorkspaceRail
          active={activeRail}
          onChange={setActiveRail}
          onNavigateDashboard={() => router.push('/dashboard')}
        />
        {renderSidePanel()}
        {renderEditorSection(focusEditor)}
      </div>

      {/* Context Menu */}
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
            <button
              onClick={() => {
                setContextMenu((p) => ({ ...p, open: false }))
                handleRewrite(contextMenu.selectedText)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
            >
              <Wand2 className="w-4 h-4 text-orange-500" />
              Rewrite with AI
            </button>
            <button
              onClick={() => {
                setContextMenu((p) => ({ ...p, open: false }))
                handleExplain(contextMenu.selectedText)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
            >
              <Brain className="w-4 h-4 text-orange-500" />
              Explain clause
            </button>
            <button
              onClick={() => {
                setContextMenu((p) => ({ ...p, open: false }))
                setGenerateOpen(true)
                setGenerateResult(null)
                setGeneratePrompt('')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-orange-500" />
              Generate clause
            </button>
            <button
              onClick={() => {
                setContextMenu((p) => ({ ...p, open: false }))
                handleAiReview()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Highlight risks
            </button>
            <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100 truncate">
              &ldquo;{contextMenu.selectedText}&rdquo;
            </div>
          </div>
        </>
      )}

      {/* AI Review Modal */}
      <AIResultModal
        title="Contract Review"
        icon={<Shield className="w-4.5 h-4.5" />}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        isLoading={reviewLoading}
      >
        {reviewIssues.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No issues found. The contract looks good.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span>{reviewIssues.filter((i) => i.severity === 'high').length} high</span>
              <span>{reviewIssues.filter((i) => i.severity === 'medium').length} medium</span>
              <span>{reviewIssues.filter((i) => i.severity === 'low').length} low</span>
            </div>
            {reviewIssues.map((issue) => {
              const colors = severityColors[issue.severity] || severityColors.low
              return (
                <div key={issue.id} className={cn('rounded-xl border p-4', colors.bg, colors.border)}>
                  <div className="flex items-start gap-2.5">
                    <div className={cn('mt-0.5 flex-shrink-0', colors.icon)}>
                      {typeIcons[issue.type] || <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-semibold', colors.text)}>{issue.title}</span>
                        <span className={cn('text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full', colors.bg, colors.text)}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{issue.description}</p>
                      {issue.suggestion && (
                        <div className="mt-2.5 px-3 py-2 rounded-lg bg-white/60 border border-gray-200/50">
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Suggestion</div>
                          <p className="text-xs text-gray-700 leading-relaxed">{issue.suggestion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AIResultModal>

      {/* Rewrite Modal */}
      <AIResultModal
        title="Rewrite Selection"
        icon={<Wand2 className="w-4.5 h-4.5" />}
        isOpen={rewriteOpen}
        onClose={() => setRewriteOpen(false)}
        isLoading={false}
      >
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Original</div>
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
              {rewriteSource}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tone</div>
            <div className="flex gap-2">
              {(['formal', 'friendly', 'concise'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setRewriteTone(tone)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize',
                    rewriteTone === tone
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
          {!rewriteResult && (
            <button
              onClick={executeRewrite}
              disabled={rewriteLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {rewriteLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Rewriting…</> : 'Rewrite'}
            </button>
          )}
          {rewriteResult && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Result</div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-gray-700 leading-relaxed">
                {rewriteResult}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => copyToClipboard(rewriteResult)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button
                  onClick={() => { insertClauseToEditor(rewriteResult); setRewriteOpen(false) }}
                  className="flex-1 px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert
                </button>
              </div>
            </div>
          )}
        </div>
      </AIResultModal>

      {/* Explain Modal */}
      <AIResultModal
        title="Clause Explanation"
        icon={<Brain className="w-4.5 h-4.5" />}
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
        isLoading={explainLoading}
      >
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Clause</div>
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 italic leading-relaxed max-h-32 overflow-y-auto">
              {explainSource}
            </div>
          </div>
          {explainResult && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">In plain language</div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {explainResult}
              </div>
            </div>
          )}
        </div>
      </AIResultModal>

      {/* Summary Modal */}
      <AIResultModal
        title="Contract Summary"
        icon={<FileText className="w-4.5 h-4.5" />}
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        isLoading={summaryLoading}
      >
        {summaryResult && (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summaryResult}
          </div>
        )}
      </AIResultModal>

      {/* Generate Clause Modal */}
      <AIResultModal
        title="Generate Clause"
        icon={<Plus className="w-4.5 h-4.5" />}
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        isLoading={false}
      >
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Describe the clause you need</div>
            <textarea
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="e.g., Add a force majeure clause covering pandemics and natural disasters"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
              rows={3}
            />
          </div>
          {!generateResult && (
            <button
              onClick={handleGenerateClause}
              disabled={generateLoading || !generatePrompt.trim()}
              className="w-full px-4 py-2.5 rounded-xl bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generateLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : 'Generate'}
            </button>
          )}
          {generateResult && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Generated Clause</div>
              <div className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {generateResult}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => copyToClipboard(generateResult)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button
                  onClick={() => { insertClauseToEditor(generateResult); setGenerateOpen(false) }}
                  className="flex-1 px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert into contract
                </button>
              </div>
            </div>
          )}
        </div>
      </AIResultModal>

      {/* Suggest Clauses Modal */}
      <AIResultModal
        title="Suggested Clauses"
        icon={<Lightbulb className="w-4.5 h-4.5" />}
        isOpen={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        isLoading={suggestLoading}
      >
        {suggestResults.length === 0 && !suggestLoading ? (
          <div className="text-center py-8">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No additional clauses suggested. The contract appears comprehensive.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestResults.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 p-4 hover:border-orange-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                    <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                  </div>
                  <button
                    onClick={() => { insertClauseToEditor(s.content); setSuggestOpen(false) }}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                    title="Insert this clause"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {s.reason && (
                  <div className="mt-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Why add this</div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{s.reason}</p>
                  </div>
                )}
                <details className="mt-2 group">
                  <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-orange-600 flex items-center gap-1">
                    <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                    Preview clause text
                  </summary>
                  <div className="mt-1.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {s.content}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </AIResultModal>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        documentTitle={editorTitle}
      />

      {variablePopover && (
        <VariableFillPopover
          variableName={variablePopover.variableName}
          currentValue={variables.find((v) => v.name === variablePopover.variableName)?.value ?? ''}
          anchorEl={variablePopover.anchorEl}
          index={0}
          total={1}
          onApply={async (value) => {
            setVariables((prev) => {
              const existing = prev.find((v) => v.name === variablePopover.variableName)
              if (existing) {
                return prev.map((v) => (v.name === variablePopover.variableName ? { ...v, value } : v))
              }
              return [
                ...prev,
                { id: `var-${Date.now()}`, name: variablePopover.variableName, value, category: 'custom', type: 'text' },
              ]
            })
            applyVariableValueToContent(variablePopover.variableName, value)
            setVariablePopover(null)
          }}
          onClose={() => setVariablePopover(null)}
          onNavigate={() => {}}
        />
      )}
    </div>
  )
}
