'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { PartialBlock } from '@blocknote/core'
import type { ChatMessage, AIReviewIssue } from '@/types/ai'
import dynamic from 'next/dynamic'
import {
  EditorToolbar,
  AiReviewPanel,
  ContractOutline,
  ClauseFinder,
  FloatingNavigator,
  ExportMenu,
  AIRewritePanel,
  AIClauseGenerator,
  AIExplainPanel,
  AISuggestClauses,
  AISummarizePanel,
  ClauseTemplates,
  type ClauseTemplate,
  ImmersiveMode,
  FloatingAIToolbar,
  CollaborationIndicators,
  ActivityLog,
  ESignaturePanel,
  ShareDialog,
  VariablesPanel,
  type Variable,
  FloatingChatButton,
  VariableFillPopover,
  VariableDocumentView,
} from '@/components/contract/ContractEditor'

const RichContractEditor = dynamic(
  () => import('@/components/contract/ContractEditor').then((mod) => ({ default: mod.RichContractEditor })),
  { ssr: false }
)
import { AIChatContent } from '@/components/ai/AISidebar'
import { ContractWorkspaceRail, type RailTab } from '@/components/contract/ContractWorkspaceRail'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/utils/helpers'
import { X, Check, Mail, PenTool, AlertCircle, Users, Home } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import { contractService } from '@/services/api/contracts'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const defaultContent: PartialBlock[] = [
  {
    type: 'heading',
    props: { level: 1 },
    content: [
      {
        type: 'text',
        text: 'Executive Summary',
        styles: { bold: true },
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Provide an overview of the agreement, the parties involved, and the primary objectives.',
        styles: {},
      },
    ],
  },
  {
    type: 'heading',
    props: { level: 2 },
    content: [
      {
        type: 'text',
        text: 'Scope of Work',
        styles: { bold: true },
      },
    ],
  },
  {
    type: 'bulletListItem',
    content: [
      {
        type: 'text',
        text: 'Deliverable 1: ',
        styles: { bold: true },
      },
      {
        type: 'text',
        text: 'Outline the first deliverable.',
        styles: {},
      },
    ],
  },
  {
    type: 'bulletListItem',
    content: [
      {
        type: 'text',
        text: 'Deliverable 2: ',
        styles: { bold: true },
      },
      {
        type: 'text',
        text: 'Outline the second deliverable.',
        styles: {},
      },
    ],
  },
]

const MOCK_CONTRACT_TITLES: Record<string, string> = {
  '1': 'Vendor Agreement - Acme Pvt Ltd',
  '2': 'NDA - Investor Round',
  '3': 'Employment Offer - Product Lead',
  '4': 'MSA - Logistics Partner',
}

// —— Sample contract 1: full NDA with variable placeholders ——
const SAMPLE_CONTRACT_1: PartialBlock[] = [
  { type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Confidentiality Agreement (NDA)', styles: { bold: true } }] },
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'This agreement is entered into as of {{Effective Date}} between {{Company Name}} (“Disclosing Party”) and {{Recipient Name}} (“Receiving Party”) to protect confidential information shared between the parties.', styles: {} },
    ],
  },
  { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '1. Definition of Confidential Information', styles: { bold: true } }] },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '“Confidential Information” means any non-public information disclosed by the Disclosing Party, including but not limited to business plans, financial data, technical specifications, and customer lists. Information that is publicly available or independently developed without use of the Confidential Information shall not be considered confidential.',
        styles: {},
      },
    ],
  },
  { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '2. Obligations of Receiving Party', styles: { bold: true } }] },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'The Receiving Party shall: (a) hold Confidential Information in strict confidence; (b) not disclose it to any third party without prior written consent; (c) use it only for the purpose of evaluating or conducting the business relationship between the parties; and (d) return or destroy all Confidential Information upon request or termination of this agreement.',
        styles: {},
      },
    ],
  },
  { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '3. Term and Termination', styles: { bold: true } }] },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'This agreement shall remain in effect for a period of two (2) years from the Effective Date. Either party may terminate with thirty (30) days written notice. Obligations with respect to Confidential Information shall survive termination for three (3) years.',
        styles: {},
      },
    ],
  },
  { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '4. Limitation of Liability', styles: { bold: true } }] },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Except as required by law, liability shall be limited to fees paid under this agreement during the preceding twelve (12) months. Neither party shall be liable for indirect or consequential damages.',
        styles: {},
      },
    ],
  },
  { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '5. Signatures', styles: { bold: true } }] },
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'By signing below, each party agrees to the terms of this agreement. Signatures may be delivered electronically and shall be binding.', styles: {} },
    ],
  },
]

const SAMPLE_CHAT_1: ChatMessage[] = [
  { id: 'u1', role: 'user', content: 'Create an NDA between Acme Corp and John Doe for our vendor discussions.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  {
    id: 'a1',
    role: 'assistant',
    content: "I've created a draft NDA with standard sections: Definition of Confidential Information, Obligations, Term, and Limitation of Liability. I've added placeholders for [Company Name], [Recipient Name], and [Effective Date] — fill these in the Variables panel. Would you like Indian jurisdiction or any extra clauses?",
    timestamp: new Date(Date.now() - 3580000).toISOString(),
  },
  { id: 'u2', role: 'user', content: 'Add Indian jurisdiction (governing law).', timestamp: new Date(Date.now() - 1800000).toISOString() },
  {
    id: 'a2',
    role: 'assistant',
    content: "I've suggested adding: \"This agreement shall be governed by the laws of India.\" You'll see it as a pending suggestion in the document — Accept or Reject as you prefer.",
    timestamp: new Date(Date.now() - 1780000).toISOString(),
  },
  { id: 'u3', role: 'user', content: 'Looks good. How do I get it signed?', timestamp: new Date(Date.now() - 60000).toISOString() },
  {
    id: 'a3',
    role: 'assistant',
    content: "Use **Request Signatures** in the toolbar to send the document to signers. They'll receive a link to review and sign. You can also sign yourself using the **Sign** action once you're ready.",
    timestamp: new Date().toISOString(),
  },
]

const SAMPLE_VARIABLES_1: Variable[] = [
  { id: 'var-company', name: 'Company Name', value: '', category: 'custom', type: 'text' },
  { id: 'var-recipient', name: 'Recipient Name', value: '', category: 'custom', type: 'text' },
  { id: 'var-date', name: 'Effective Date', value: '', category: 'custom', type: 'date' },
]

type PendingSuggestion = { id: string; suggestedText: string; type: 'insert'; blockIndex?: number }

const SUGGESTION_INSERT_INDEX = 10

function insertSuggestionBlocks(content: PartialBlock[], suggestions: PendingSuggestion[]): PartialBlock[] {
  if (!content || suggestions.length === 0) return content || []
  let result = [...content]
  suggestions.forEach((s, i) => {
    const idx = Math.min(SUGGESTION_INSERT_INDEX + i, result.length)
    const block: PartialBlock = {
      id: `suggestion-${s.id}`,
      type: 'paragraph',
      content: [{ type: 'text', text: s.suggestedText, styles: {} }],
    }
    result = [...result.slice(0, idx), block, ...result.slice(idx)]
  })
  return result
}

function removeSuggestionBlock(content: PartialBlock[] | undefined, suggestionId: string): PartialBlock[] {
  if (!content) return []
  return content.filter((b) => (b as { id?: string }).id !== `suggestion-${suggestionId}`)
}

function replaceSuggestionWithParagraph(content: PartialBlock[] | undefined, suggestionId: string, suggestedText: string): PartialBlock[] {
  if (!content) return []
  return content.map((b) =>
    (b as { id?: string }).id === `suggestion-${suggestionId}`
      ? { type: 'paragraph', content: [{ type: 'text', text: suggestedText, styles: {} }] } as PartialBlock
      : b
  )
}

function replaceVariablesInContent(content: PartialBlock[] | undefined, variables: Variable[]): PartialBlock[] {
  if (!content) return []
  return content.map((block) => {
    const rawContent = (block as { content?: unknown }).content
    if (!rawContent || !Array.isArray(rawContent)) return block
    const newContent = rawContent.map((part: { type?: string; text?: string; styles?: Record<string, unknown> }) => {
      if (part.type !== 'text' || typeof part.text !== 'string') return part
      let text = part.text
      variables.forEach((v) => {
        const replacement = v.value !== undefined && v.value !== '' ? v.value : `{{${v.name}}}`
        text = text.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), replacement)
        text = text.replace(new RegExp(`\\[${v.name}\\]`, 'g'), replacement)
      })
      return { ...part, text }
    })
    return { ...block, content: newContent } as PartialBlock
  })
}

const mockSaveContract = async (content: PartialBlock[]) => {
  console.log('Saving contract...', content)
  return new Promise((resolve) => setTimeout(resolve, 800))
}

const mockAiReview = async (content: PartialBlock[]): Promise<AIReviewIssue[]> => {
  console.log('Running AI review...', content)
  await new Promise((resolve) => setTimeout(resolve, 1200))
  return [
    {
      id: 'issue-1',
      type: 'risk',
      severity: 'high',
      title: 'Missing Termination Clause',
      description:
        'The agreement does not specify termination rights for either party. This can create ambiguity if one party wants to end the agreement early.',
      suggestion: 'Add a termination clause that outlines notice periods and acceptable grounds.',
    },
    {
      id: 'issue-2',
      type: 'missing',
      severity: 'medium',
      title: 'No Confidentiality Language',
      description:
        'Consider adding a confidentiality clause to protect sensitive business information shared during the engagement.',
      suggestion:
        'Introduce an NDA provision specifying what information is confidential and how it must be handled.',
    },
  ]
}

const mockAiChatResponse = async (message: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 900))
  if (message.toLowerCase().includes('clause')) {
    return 'You can address this by adding a clause that clearly defines obligations and liabilities for each party. Consider referencing industry standards.'
  }
  if (message.toLowerCase().includes('risk')) {
    return 'Primary risks include undefined termination rights and lack of confidentiality language. I recommend adding clauses for both.'
  }
  return 'I can help explain clauses, suggest edits, or highlight potential risks. Try asking “What should I include in a termination clause?”'
}

const mockExport = async (format: 'pdf' | 'docx') => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return `Contract exported as ${format.toUpperCase()} (mock)`
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  const [title, setTitle] = useState('Untitled Agreement')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [contractContent, setContractContent] = useState<PartialBlock[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([])
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiReviewLoading, setAiReviewLoading] = useState(false)
  const [reviewIssues, setReviewIssues] = useState<AIReviewIssue[]>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  
  // New feature states
  const [activeRail, setActiveRail] = useState<RailTab>('chat')
  const [isImmersiveMode, setIsImmersiveMode] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const [showAIRewrite, setShowAIRewrite] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showESignature, setShowESignature] = useState(false)
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [showAIExplain, setShowAIExplain] = useState(false)
  const [showAISuggest, setShowAISuggest] = useState(false)
  const [showAISummarize, setShowAISummarize] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showRequestSignatures, setShowRequestSignatures] = useState(false)
  const [showVariables, setShowVariables] = useState(false)
  const [variables, setVariables] = useState<Variable[]>([])
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())
  const [pendingSuggestions, setPendingSuggestions] = useState<PendingSuggestion[]>([])
  const [showRequestSignaturesModal, setShowRequestSignaturesModal] = useState(false)
  const [signatureRequestSent, setSignatureRequestSent] = useState(false)
  const [documentSigned, setDocumentSigned] = useState(false)
  const [showSignDocumentModal, setShowSignDocumentModal] = useState(false)
  const [requestSignerEmail, setRequestSignerEmail] = useState('')
  const [requestSignerName, setRequestSignerName] = useState('')
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([
    { id: 'r1', name: 'Signer 1' },
  ])
  const [variablePopover, setVariablePopover] = useState<{
    variableName: string
    anchorEl: HTMLElement
    instanceIndex: number
    total: number
  } | null>(null)

  const isSampleContract = contractId === '1'

  // Treat "draft" or "new" as new document – no API fetch, show default content
  const isNewDraft = !contractId || contractId === 'draft' || contractId === 'new'

  // Fetch contract data on mount
  useEffect(() => {
    const fetchContract = async () => {
      if (isNewDraft) {
        setIsLoading(false)
        setContractContent(defaultContent)
        return
      }

      setIsLoading(true)
      setLoadError(null)

      try {
        const response = await contractService.getContract(contractId)
        if (response.success && response.data) {
          const contract = response.data
          if (contract.title) setTitle(contract.title)
          if (contract.content && Array.isArray(contract.content) && contract.content.length > 0) {
            setContractContent(contract.content as PartialBlock[])
          } else {
            setContractContent(defaultContent)
          }
          if (contract.updatedAt) setLastSavedAt(new Date(contract.updatedAt))
        } else {
          setContractContent(defaultContent)
        }
      } catch (error: any) {
        setContractContent(defaultContent)
        if (MOCK_CONTRACT_TITLES[contractId]) setTitle(MOCK_CONTRACT_TITLES[contractId])
        if (error.response?.status && error.response.status !== 0) {
          setLoadError(error.response?.data?.message || error.message || 'Failed to load contract')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchContract()
  }, [contractId, isNewDraft])

  // Sample contract 1: apply full demo content, chat, variables, and pending suggestion (inline)
  useEffect(() => {
    if (!isSampleContract || isLoading) return
    setTitle(MOCK_CONTRACT_TITLES['1'] || 'Vendor Agreement - Acme Pvt Ltd')
    setContractContent(SAMPLE_CONTRACT_1)
    setAiMessages(SAMPLE_CHAT_1)
    setVariables([...SAMPLE_VARIABLES_1])
    setPendingSuggestions([
      { id: 's1', suggestedText: 'This agreement shall be governed by the laws of India. The courts at New Delhi shall have exclusive jurisdiction.', type: 'insert', blockIndex: SUGGESTION_INSERT_INDEX },
    ])
  }, [isSampleContract, isLoading])

  const editorContent = useMemo(() => {
    const base = contractContent || defaultContent
    if (isSampleContract && pendingSuggestions.length > 0) {
      return insertSuggestionBlocks(base, pendingSuggestions)
    }
    return base
  }, [contractContent, isSampleContract, pendingSuggestions])

  const handleEditorChange = useCallback((content: PartialBlock[]) => {
    const withoutSuggestions = content.filter((b) => !(b as { id?: string }).id?.startsWith('suggestion-'))
    setContractContent(withoutSuggestions)
    setSaveStatus('saving')
    setLastActivityTime(Date.now())

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (contractId && !isNewDraft) {
          const lastModified = new Date().toISOString()
          await contractService.autoSaveContract(contractId, {
            content: withoutSuggestions,
            lastModified
          })
        }
        setLastSavedAt(new Date())
        setSaveStatus('saved')
      } catch (error) {
        console.error('Auto-save error:', error)
        // Don't show error to user for auto-save failures
        setSaveStatus('saved')
      }
    }, 600)
  }, [contractId, isNewDraft])

  const handleManualSave = useCallback(async () => {
    if (!contractContent) return
    try {
      setSaveStatus('saving')
      await mockSaveContract(contractContent)
      setLastSavedAt(new Date())
      setSaveStatus('saved')
    } catch (error) {
      console.error(error)
      setSaveStatus('error')
    }
  }, [contractContent])

  const handleAiReview = useCallback(async () => {
    if (!contractContent) return
    try {
      setAiReviewLoading(true)
      const issues = await mockAiReview(contractContent)
      setReviewIssues(issues)
    } finally {
      setAiReviewLoading(false)
    }
  }, [contractContent])

  const handleExport = useCallback(async (format: 'pdf' | 'docx' | 'md' | 'html') => {
    const contentToExport = isSampleContract && variables.length > 0
      ? replaceVariablesInContent(contractContent || [], variables)
      : contractContent || []
    if (format === 'pdf' || format === 'docx') {
      const result = await mockExport(format)
      alert(result + (isSampleContract ? ' Variables have been replaced with your filled values.' : ''))
    } else {
      console.log(`Exporting as ${format}...`, contentToExport)
      alert(`Contract exported as ${format.toUpperCase()} (mock)` + (isSampleContract ? ' Variables replaced.' : ''))
    }
  }, [contractContent, isSampleContract, variables])

  const handleToggleSidebar = useCallback(() => {
    setActiveRail('chat')
  }, [])

  const handleSendAiMessage = useCallback(
    async (message: string) => {
      const newMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      }
      setAiMessages((prev) => [...prev, newMessage])
      setAiProcessing(true)

      const responseText = await mockAiChatResponse(message)
      const response: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      }
      setAiMessages((prev) => [...prev, response])
      setAiProcessing(false)
    },
    []
  )

  const formattedContractId = useMemo(() => contractId?.replace(/-/g, ' ').toUpperCase() || '', [contractId])

  const handleTemplateSelect = useCallback((template: ClauseTemplate) => {
    // Insert template content into editor
    // This will be enhanced when we have editor insertion API
    console.log('Template selected:', template)
    setShowTemplates(false)
  }, [])

  const handleAIRewrite = useCallback((rewrittenText: string) => {
    // Insert rewritten text
    console.log('Applying rewritten text:', rewrittenText)
    setShowAIRewrite(false)
  }, [])

  const handleAIGenerate = useCallback((clause: string) => {
    console.log('Inserting generated clause:', clause)
    setShowAIGenerator(false)
  }, [])

  const handleAcceptSuggestion = useCallback((suggestion: PendingSuggestion) => {
    setContractContent((prev) => {
      const list = prev || []
      const newBlock: PartialBlock = { type: 'paragraph', content: [{ type: 'text', text: suggestion.suggestedText, styles: {} }] }
      return [...list.slice(0, SUGGESTION_INSERT_INDEX), newBlock, ...list.slice(SUGGESTION_INSERT_INDEX)]
    })
    setPendingSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
  }, [])

  const handleRejectSuggestion = useCallback((suggestion: PendingSuggestion) => {
    setContractContent((prev) => removeSuggestionBlock(prev, suggestion.id))
    setPendingSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
  }, [])

  const handleSendSignatureRequest = useCallback(() => {
    if (!requestSignerEmail.trim()) return
    setSignatureRequestSent(true)
    setShowRequestSignatures(false)
  }, [requestSignerEmail])

  useEffect(() => {
    const handleToggleOutline = () => {
      setActiveRail('outline')
    }

    const handleOpenVariables = () => {
      setActiveRail('vars')
    }

    // Track user activity
    const handleActivity = () => {
      setLastActivityTime(Date.now())
    }

    // Listen for various user activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    window.addEventListener('toggle-outline', handleToggleOutline)
    window.addEventListener('open-variables', handleOpenVariables)
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      window.removeEventListener('toggle-outline', handleToggleOutline)
      window.removeEventListener('open-variables', handleOpenVariables)
    }
  }, [])

  // Inline suggestion styling (cursor-like): wrap suggestion blocks in the editor DOM with amber highlight + Accept/Reject
  useEffect(() => {
    if (!isSampleContract || pendingSuggestions.length === 0 || !editorWrapperRef.current) return
    const root = editorWrapperRef.current
    const wrap = root.querySelectorAll('[data-inline-suggestion-wrap]')
    wrap.forEach((el) => {
      const block = el.querySelector('.bn-block')
      if (block && el.parentNode) {
        el.parentNode.insertBefore(block, el)
        el.remove()
      }
    })
    const timeoutId = setTimeout(() => {
      if (!root) return
      const blocks = root.querySelectorAll('.bn-block')
      pendingSuggestions.forEach((suggestion) => {
        const text = suggestion.suggestedText
        for (const block of blocks) {
          if (block.querySelector('[data-inline-suggestion-wrap]')) continue
          if (!block.textContent?.trim().includes(text.trim().slice(0, 40))) continue
          const wrapper = document.createElement('div')
          wrapper.setAttribute('data-inline-suggestion-wrap', 'true')
          wrapper.className = 'rounded-lg border-l-4 border-amber-400 bg-amber-50/90 py-2 px-3 my-2'
          const toolbar = document.createElement('div')
          toolbar.className = 'flex items-center gap-2 mt-2 flex-wrap'
          const acceptBtn = document.createElement('button')
          acceptBtn.textContent = 'Accept'
          acceptBtn.className = 'inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700'
          const rejectBtn = document.createElement('button')
          rejectBtn.textContent = 'Reject'
          rejectBtn.className = 'inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50'
          acceptBtn.onclick = () => handleAcceptSuggestion(suggestion)
          rejectBtn.onclick = () => handleRejectSuggestion(suggestion)
          toolbar.appendChild(acceptBtn)
          toolbar.appendChild(rejectBtn)
          const parent = block.parentNode
          if (!parent) return
          parent.insertBefore(wrapper, block)
          wrapper.appendChild(block)
          wrapper.appendChild(toolbar)
          break
        }
      })
    }, 400)
    return () => {
      clearTimeout(timeoutId)
      root?.querySelectorAll('[data-inline-suggestion-wrap]').forEach((el) => {
        const block = el.querySelector('.bn-block')
        if (block && el.parentNode) {
          el.parentNode.insertBefore(block, el)
          el.remove()
        }
      })
    }
  }, [isSampleContract, pendingSuggestions, editorContent, handleAcceptSuggestion, handleRejectSuggestion])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  // Show error state (only if there's a real error, not network issues)
  if (loadError && !contractContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Contract</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('h-screen flex flex-col bg-white overflow-hidden')}>
      <EditorToolbar
        title={title}
        onTitleChange={(newTitle) => {
          setTitle(newTitle)
          setLastActivityTime(Date.now())
        }}
        onAiReview={handleAiReview}
        onExport={handleExport}
        onShare={() => setShowShareDialog(true)}
        onRequestSignatures={() => setShowRequestSignatures(true)}
        onSign={isSampleContract ? () => setShowSignDocumentModal(true) : undefined}
        content={contractContent || []}
        documentSigned={documentSigned}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Workspace rail (Chat, Vars, Templates, More, Home, Outline) - same as /contracts/workspace */}
        {!isImmersiveMode && (
          <>
            <ContractWorkspaceRail active={activeRail} onChange={setActiveRail} />
            {activeRail === 'chat' && (
              <section className="w-[420px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
                <div className="flex-1 min-h-0 flex flex-col">
                  <AIChatContent
                    messages={aiMessages}
                    onSendMessage={handleSendAiMessage}
                    isProcessing={aiProcessing}
                    title="Contract Copilot"
                  />
                </div>
              </section>
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
                      setVariables((prev) => [...prev, { id: `var-${Date.now()}`, name, value: '', category: 'custom', type: 'text' }])
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
                    <ClauseFinder content={contractContent || []} onNavigate={() => {}} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <ContractOutline content={contractContent || []} onNavigate={() => {}} />
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
          </>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto relative scrollbar-hide">
              <div className="max-w-4xl mx-auto px-8 md:px-16 py-12">
              <AiReviewPanel issues={reviewIssues} onDismiss={() => setReviewIssues([])} />

              {isSampleContract && signatureRequestSent && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Signature request sent to {requestSignerEmail || 'signer'}. They will receive an email to review and sign.
                </div>
              )}

              {isSampleContract && (
                <div className="mb-4 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-orange-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Fill required variables (highlighted in document)
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">Variables like {'{{'}Company Name{'}}'}, {'{{'}Recipient Name{'}}'}, {'{{'}Effective Date{'}}'} appear in the document. Fill them in the Variables panel in the left sidebar.</p>
                  <div className="flex flex-wrap gap-2">
                    {variables.filter((v) => v.category === 'custom').map((v) => (
                      <span
                        key={v.id}
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                          v.value ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'
                        )}
                      >
                        {v.name}: {v.value || '— not filled'}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100" onClick={() => setActiveRail('vars')}>
                    Open Variables
                  </Button>
                </div>
              )}

              {/* AI Feature Panels */}
              {showAIRewrite && (
                <div className="mb-4">
                  <AIRewritePanel
                    originalText={selectedText || 'Selected text will appear here'}
                    onApply={handleAIRewrite}
                    onClose={() => setShowAIRewrite(false)}
                  />
                </div>
              )}

              {showAIGenerator && (
                <div className="mb-4">
                  <AIClauseGenerator
                    onInsert={handleAIGenerate}
                    onClose={() => setShowAIGenerator(false)}
                  />
                </div>
              )}

              {showTemplates && (
                <div className="mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <ClauseTemplates onSelectTemplate={handleTemplateSelect} />
                  </div>
                </div>
              )}

              {showESignature && (
                <div className="mb-4">
                  <ESignaturePanel
                    onSign={(signature) => {
                      console.log('Signature applied:', signature)
                      setShowESignature(false)
                    }}
                    onClose={() => setShowESignature(false)}
                  />
                </div>
              )}

              {showAIExplain && (
                <div className="mb-4">
                  <AIExplainPanel
                    clauseText={selectedText || 'No clause selected'}
                    onClose={() => setShowAIExplain(false)}
                  />
                </div>
              )}

              {showAISuggest && (
                <div className="mb-4">
                  <AISuggestClauses
                    onInsert={(clause) => {
                      console.log('Inserting suggested clause:', clause)
                      setShowAISuggest(false)
                    }}
                    onClose={() => setShowAISuggest(false)}
                  />
                </div>
              )}

              {showAISummarize && (
                <div className="mb-4">
                  <AISummarizePanel
                    content={contractContent || []}
                    onClose={() => setShowAISummarize(false)}
                  />
                </div>
              )}

              <div ref={editorWrapperRef} className="min-h-[calc(100vh-200px)] py-8">
                {isSampleContract ? (
                  <VariableDocumentView
                    content={editorContent}
                    onVariableClick={(variableName, anchorEl) => {
                      const allSame = document.querySelectorAll(`[data-variable-name="${variableName}"]`)
                      const idx = Array.from(allSame).indexOf(anchorEl)
                      setVariablePopover({
                        variableName,
                        anchorEl,
                        instanceIndex: idx,
                        total: allSame.length,
                      })
                    }}
                    suggestionBlocks={pendingSuggestions.map((s) => ({ id: s.id, suggestedText: s.suggestedText }))}
                    onAcceptSuggestion={(id) => {
                      const s = pendingSuggestions.find((p) => p.id === id)
                      if (s) handleAcceptSuggestion(s)
                    }}
                    onRejectSuggestion={(id) => {
                      const s = pendingSuggestions.find((p) => p.id === id)
                      if (s) handleRejectSuggestion(s)
                    }}
                  />
                ) : (
                  <RichContractEditor
                    key={`contract-${contractId}-s${pendingSuggestions.length}`}
                    initialContent={editorContent}
                    onChange={handleEditorChange}
                    onRequestSignature={() => setShowESignature(true)}
                    onRequestClauseLibrary={() => setShowTemplates(true)}
                    onRequestAIGenerator={() => setShowAIGenerator(true)}
                    onRequestAISummarize={() => setShowAISummarize(true)}
                    onRequestAISuggest={() => setShowAISuggest(true)}
                    onToggleAISidebar={handleToggleSidebar}
                    isAiSidebarOpen={activeRail === 'chat'}
                    isImmersiveMode={isImmersiveMode}
                    onToggleImmersiveMode={() => setIsImmersiveMode(!isImmersiveMode)}
                  />
                )}
              </div>

              {/* Signature sections for contract 1 */}
              {isSampleContract && (
                <div className="mt-8 space-y-8 pb-12">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Developer Signature</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                        <input type="text" placeholder="MM/DD/YYYY" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                          <input type="text" placeholder="Developer name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 gap-1" title="Assign role">
                          <Users className="w-4 h-4" />
                          Assign role
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Signature</label>
                      <div className="h-24 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-sm text-gray-400">Draw or type signature</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Client Signature</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                        <input type="text" placeholder="MM/DD/YYYY" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                          <input type="text" placeholder="Client name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 gap-1" title="Assign role">
                          <Users className="w-4 h-4" />
                          Assign role
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Signature</label>
                      <div className="h-24 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-sm text-gray-400">Draw or type signature</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating AI Toolbar */}
            <FloatingAIToolbar
              selectedText={selectedText}
              onRewrite={() => {
                const selection = window.getSelection()?.toString() || ''
                setSelectedText(selection)
                setShowAIRewrite(true)
              }}
              onExplain={() => {
                const selection = window.getSelection()?.toString() || ''
                setSelectedText(selection)
                setShowAIExplain(true)
              }}
              onGenerate={() => setShowAIGenerator(true)}
            />
          </div>

          {/* Bottom Action Bar */}
          {!contractContent || contractContent.length === 0 ? (
            <div className="border-t border-gray-100 bg-white px-8 md:px-16 py-6">
              <div className="max-w-4xl mx-auto">
                <p className="text-sm font-medium text-gray-700 mb-4">Get started</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => setShowAIGenerator(true)}
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
                  >
                    <span className="text-lg">✨</span>
                    Write with AI
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
                  >
                    <span className="text-lg">📥</span>
                    Import from PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
                  >
                    <span className="text-lg">➕</span>
                    Add from Library
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>


        </div>

      </div>

      {/* Floating Navigator */}
      <FloatingNavigator
        content={contractContent || []}
        onNavigate={(blockId) => {
          console.log('Navigate to:', blockId)
        }}
      />

      {/* Request Signatures modal */}
      {showRequestSignatures && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Request signature</h2>
              <p className="text-sm text-gray-500 mt-1">Send this document to a signer. They will receive an email to review and sign.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signer email</label>
                <input
                  type="email"
                  value={requestSignerEmail}
                  onChange={(e) => setRequestSignerEmail(e.target.value)}
                  placeholder="signer@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signer name (optional)</label>
                <input
                  type="text"
                  value={requestSignerName}
                  onChange={(e) => setRequestSignerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button variant="outline" className="flex-1" onClick={() => setShowRequestSignatures(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 gap-2" onClick={handleSendSignatureRequest} disabled={!requestSignerEmail.trim()}>
                <Mail className="w-4 h-4" /> Send request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sign document modal (official signing flow) */}
      {showSignDocumentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-orange-600" />
                    Sign document
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">By signing below you agree to the terms of this agreement. This action is legally binding.</p>
                </div>
                <button onClick={() => setShowSignDocumentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ESignaturePanel
                signerName="Signer"
                onSign={(signatureDataUrl) => {
                  setDocumentSigned(true)
                  setShowSignDocumentModal(false)
                }}
                onClose={() => setShowSignDocumentModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Variable fill popover (click on yellow {{variable}} in document) */}
      {isSampleContract && variablePopover && (
        <VariableFillPopover
          variableName={variablePopover.variableName}
          currentValue={variables.find((v) => v.name === variablePopover.variableName)?.value ?? ''}
          anchorEl={variablePopover.anchorEl}
          index={variablePopover.instanceIndex}
          total={variablePopover.total}
          onApply={(value) => {
            const existing = variables.find((v) => v.name === variablePopover.variableName)
            if (existing) {
              setVariables((prev) => prev.map((v) => (v.name === variablePopover.variableName ? { ...v, value } : v)))
            } else {
              setVariables((prev) => [...prev, { id: `var-${Date.now()}`, name: variablePopover.variableName, value, category: 'custom', type: 'text' }])
            }
            setVariablePopover(null)
          }}
          onClose={() => setVariablePopover(null)}
          onNavigate={(dir) => {
            const editable = editorWrapperRef.current?.querySelector('.bn-editor') as HTMLElement
            if (!editable) return
            const allSame = editable.querySelectorAll(`[data-variable-name="${variablePopover.variableName}"]`)
            let nextIdx = variablePopover.instanceIndex + (dir === 'next' ? 1 : -1)
            if (nextIdx < 0) nextIdx = allSame.length - 1
            if (nextIdx >= allSame.length) nextIdx = 0
            const nextEl = allSame[nextIdx] as HTMLElement
            if (nextEl) setVariablePopover((p) => p ? { ...p, anchorEl: nextEl, instanceIndex: nextIdx } : null)
          }}
        />
      )}

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        documentTitle={title}
      />

      {/* Floating Chat Button */}
      <FloatingChatButton
        onToggleChat={handleToggleSidebar}
        isChatOpen={activeRail === 'chat'}
        lastActivityTime={lastActivityTime}
        idleTimeout={120000}
      />
    </div>
  )
}
