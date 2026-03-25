'use client'

import '@blocknote/react/style.css'
import '@blocknote/mantine/style.css'
import { PartialBlock } from '@blocknote/core'
import {
  useCreateBlockNote,
  useBlockNoteEditor,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import React, { useEffect, useState, useCallback } from 'react'
import type { DefaultReactSuggestionItem } from '@blocknote/react'
import { PenLine, Sparkles, Users2, BookOpenCheck, Compass, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

type RichContractEditorProps = {
  initialContent?: PartialBlock[]
  onChange?: (content: PartialBlock[]) => void
  onRequestSignature?: () => void
  onRequestClauseLibrary?: () => void
  onRequestAIGenerator?: () => void
  onRequestAISummarize?: () => void
  onRequestAISuggest?: () => void
  onToggleAISidebar?: () => void
  isAiSidebarOpen?: boolean
  isImmersiveMode?: boolean
  onToggleImmersiveMode?: () => void
  /** When true, highlights {{variable}} in yellow and calls onVariableClick on click */
  enableVariableHighlight?: boolean
  onVariableClick?: (variableName: string, element: HTMLElement) => void
}

export const RichContractEditor: React.FC<RichContractEditorProps> = ({
  initialContent,
  onChange,
  onRequestSignature,
  onRequestClauseLibrary,
  onRequestAIGenerator,
  onRequestAISummarize,
  onRequestAISuggest,
  onToggleAISidebar,
  isAiSidebarOpen = false,
  isImmersiveMode = false,
  onToggleImmersiveMode,
  enableVariableHighlight = false,
  onVariableClick,
}) => {
  const [mounted, setMounted] = useState(false)
  const editorContainerRef = React.useRef<HTMLDivElement>(null)

  // Create editor with BlockNote v0.42
  // Always call the hook unconditionally (React rules)
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
  })

  useEffect(() => {
    // Only mount on client side
    if (typeof window !== 'undefined') {
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (!editor || !onChange || !mounted) return

    const unsubscribe = editor.onChange(() => {
      onChange(editor.document)
    })

    return () => {
      unsubscribe()
    }
  }, [editor, onChange, mounted])

  // Variable highlighting: wrap {{...}} in yellow clickable spans (runs inside editor so DOM is ready)
  useEffect(() => {
    if (!enableVariableHighlight || !onVariableClick || !mounted || !editorContainerRef.current) return
    const root = editorContainerRef.current

    const runDecorator = () => {
      const editable =
        (root.querySelector('.bn-editor') as HTMLElement) ||
        (root.querySelector('[contenteditable="true"]') as HTMLElement) ||
        root
      if (!editable) return

      const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (node.parentElement?.closest('.variable-placeholder')) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })
      const toProcess: Text[] = []
      let n = walker.nextNode()
      while (n) {
        toProcess.push(n as Text)
        n = walker.nextNode()
      }
      const regex = /\{\{([^}]+)\}\}/g
      for (const textNode of toProcess) {
        const text = textNode.textContent || ''
        if (!text.includes('{{')) continue
        const parts: { type: 'text' | 'var'; value: string; varName: string }[] = []
        let lastIndex = 0
        let match
        regex.lastIndex = 0
        while ((match = regex.exec(text)) !== null) {
          if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index), varName: '' })
          parts.push({ type: 'var', value: match[0], varName: match[1].trim() })
          lastIndex = regex.lastIndex
        }
        if (parts.length === 0) continue
        if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex), varName: '' })
        const fragment = document.createDocumentFragment()
        for (const part of parts) {
          if (part.type === 'text') {
            fragment.appendChild(document.createTextNode(part.value))
          } else {
            const span = document.createElement('span')
            span.className = 'variable-placeholder'
            span.setAttribute('contenteditable', 'false')
            span.setAttribute('data-variable-name', part.varName)
            span.textContent = part.value
            span.style.cursor = 'pointer'
            span.addEventListener('click', (e) => {
              e.preventDefault()
              e.stopPropagation()
              onVariableClick(part.varName, span)
            })
            fragment.appendChild(span)
          }
        }
        textNode.parentNode?.replaceChild(fragment, textNode)
      }
    }

    const t1 = setTimeout(runDecorator, 600)
    const t2 = setTimeout(runDecorator, 1500)
    const interval = setInterval(runDecorator, 2500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearInterval(interval)
    }
  }, [enableVariableHighlight, onVariableClick, mounted, initialContent])

  // Handle paste events to sanitize HTML and preserve formatting (especially headings)
  useEffect(() => {
    if (!mounted || !editor || !editorContainerRef.current) return

    const handlePaste = (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData
      if (!clipboardData) return

      const html = clipboardData.getData('text/html')
      const plainText = clipboardData.getData('text/plain')

      // If no HTML, let BlockNote handle plain text normally
      if (!html) return

      try {
        // Create a temporary DOM element to parse and sanitize HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html

        let needsSanitization = false

        // Fix malformed <ol> start attributes
        const olElements = tempDiv.querySelectorAll('ol[start]')
        olElements.forEach((ol) => {
          const startAttr = ol.getAttribute('start')
          if (!startAttr || startAttr.trim() === '') {
            ol.removeAttribute('start')
            needsSanitization = true
          } else {
            const startNum = parseInt(startAttr, 10)
            if (isNaN(startNum) || startNum < 1) {
              ol.removeAttribute('start')
              needsSanitization = true
            } else {
              const normalizedValue = startNum.toString()
              if (startAttr !== normalizedValue) {
                ol.setAttribute('start', normalizedValue)
                needsSanitization = true
              }
            }
          }
        })

        // Fix malformed <ul> start attributes (if any)
        const ulElements = tempDiv.querySelectorAll('ul[start]')
        if (ulElements.length > 0) {
          ulElements.forEach((ul) => {
            ul.removeAttribute('start')
          })
          needsSanitization = true
        }

        // Clean up empty attributes that could cause parsing errors
        const allElements = tempDiv.querySelectorAll('*')
        allElements.forEach((el) => {
          Array.from(el.attributes).forEach((attr) => {
            if (!attr.value || attr.value.trim() === '') {
              el.removeAttribute(attr.name)
              needsSanitization = true
            }
          })
        })

        // Always use BlockNote's parser to ensure proper formatting (headings, lists, etc.)
        // This ensures headings are properly converted to heading blocks for the outline
        event.preventDefault()
        event.stopPropagation()

        // Get sanitized HTML (or original if no sanitization needed)
        const sanitizedHtml = needsSanitization ? tempDiv.innerHTML : html

        // Try to parse HTML into blocks using BlockNote (this preserves headings, lists, etc.)
        try {
          const blocks = editor.tryParseHTMLToBlocks(sanitizedHtml)
          if (blocks && blocks.length > 0) {
            // Insert blocks at current cursor position
            const currentBlock = editor.getTextCursorPosition().block
            editor.insertBlocks(blocks, currentBlock, 'after')
            // Delete the current block if it's empty
            if ((!currentBlock.content || (Array.isArray(currentBlock.content) && currentBlock.content.length === 0))) {
              editor.removeBlocks([currentBlock])
            }
            return
          }
        } catch (parseError) {
          console.warn('Error parsing HTML with BlockNote, trying plain text:', parseError)
        }

        // Fallback: if HTML parsing fails, try to preserve structure from plain text
        // This is a last resort - try to detect headings from text patterns
        if (plainText) {
          try {
            const currentBlock = editor.getTextCursorPosition().block
            const lines = plainText.split('\n')
            const blocksToInsert: PartialBlock[] = []

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue

              // Try to detect headings (lines that are all caps, or start with numbers like "1. ", "2. ", etc.)
              // Pattern: "1. PROJECT OVERVIEW" or "PROJECT OVERVIEW" (all caps, short)
              const isNumberedHeading = /^\d+\.\s+[A-Z]/.test(trimmed)
              const isAllCapsHeading = 
                trimmed === trimmed.toUpperCase() && 
                trimmed.length < 100 && 
                trimmed.split(' ').length < 15 &&
                trimmed.length > 3 &&
                !trimmed.endsWith('.') // Usually headings don't end with periods
              
              const isHeading = isNumberedHeading || isAllCapsHeading

              if (isHeading) {
                // Determine heading level based on formatting
                let level = 2 // Default to h2 for numbered sections
                if (isNumberedHeading) {
                  // Numbered headings like "1. PROJECT OVERVIEW" are usually h2
                  level = 2
                } else if (trimmed.length < 50 && !isNumberedHeading) {
                  // Short all-caps headings are usually h1
                  level = 1
                }

                blocksToInsert.push({
                  type: 'heading',
                  props: { level },
                  content: [{ type: 'text', text: trimmed, styles: {} }],
                })
              } else {
                // Regular paragraph
                blocksToInsert.push({
                  type: 'paragraph',
                  content: [{ type: 'text', text: trimmed, styles: {} }],
                })
              }
            }

            if (blocksToInsert.length > 0) {
              editor.insertBlocks(blocksToInsert, currentBlock, 'after')
              if ((!currentBlock.content || (Array.isArray(currentBlock.content) && currentBlock.content.length === 0))) {
                editor.removeBlocks([currentBlock])
              }
            }
          } catch (insertError) {
            console.error('Error inserting formatted text:', insertError)
            // Final fallback: just insert as plain text
            const currentBlock = editor.getTextCursorPosition().block
            editor.insertBlocks(
              [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: plainText, styles: {} }],
                },
              ],
              currentBlock,
              'after'
            )
          }
        }
      } catch (error) {
        // If everything fails, let BlockNote's default handler try
        console.warn('Error in paste handler:', error)
      }
    }

    const container = editorContainerRef.current
    container.addEventListener('paste', handlePaste as EventListener, true)

    return () => {
      container.removeEventListener('paste', handlePaste as EventListener, true)
    }
  }, [mounted, editor])

  if (!mounted || !editor) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }

  return (
    <div 
      ref={editorContainerRef}
      className="h-full w-full relative [&_.bn-editor]:min-h-full [&_.bn-editor]:outline-none [&_.bn-editor]:p-0 [&_.bn-editor]:bg-transparent [&_.bn-editor]:text-gray-900 [&_.bn-editor]:scrollbar-hide [&_*]:scrollbar-hide"
    >
      <BlockNoteView
        editor={editor}
        editable={true}
        theme="light"
        formattingToolbar={true}
        linkToolbar={true}
        slashMenu={false}
        sideMenu={true}
        filePanel={true}
        tableHandles={true}
      >
        <CustomSlashMenu
          onRequestSignature={onRequestSignature}
          onRequestClauseLibrary={onRequestClauseLibrary}
          onRequestAIGenerator={onRequestAIGenerator}
          onRequestAISummarize={onRequestAISummarize}
          onRequestAISuggest={onRequestAISuggest}
        />
      </BlockNoteView>
      
      {/* Focus Mode floating button - top right */}
      {onToggleImmersiveMode && (
        <div className="absolute top-6 right-6 z-10">
          <Button
            variant={isImmersiveMode ? 'primary' : 'outline'}
            size="sm"
            onClick={onToggleImmersiveMode}
            className={cn(
              "w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all",
              isImmersiveMode ? "bg-primary-600 text-white" : "bg-white text-gray-700 border-gray-200"
            )}
            title={isImmersiveMode ? 'Exit Focus Mode' : 'Focus Mode'}
          >
            {isImmersiveMode ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      )}
      
    </div>
  )
}

type CustomSlashMenuProps = {
  onRequestSignature?: () => void
  onRequestClauseLibrary?: () => void
  onRequestAIGenerator?: () => void
  onRequestAISummarize?: () => void
  onRequestAISuggest?: () => void
}

const CustomSlashMenu: React.FC<CustomSlashMenuProps> = ({
  onRequestSignature,
  onRequestClauseLibrary,
  onRequestAIGenerator,
  onRequestAISummarize,
  onRequestAISuggest,
}) => {
  const editor = useBlockNoteEditor()

  const insertPartyBlock = useCallback(() => {
    if (!editor) return
    const currentBlock = editor.getTextCursorPosition().block
    editor.insertBlocks(
      [
        {
          type: 'heading',
          props: { level: 3 },
          content: [
            {
              type: 'text',
              text: 'Party Information',
              styles: { bold: true },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Party A: ', styles: { bold: true } },
            { type: 'text', text: '[Legal name, address, contact]', styles: {} },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Party B: ', styles: { bold: true } },
            { type: 'text', text: '[Legal name, address, contact]', styles: {} },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Effective Date: ', styles: { bold: true } },
            { type: 'text', text: '[MM/DD/YYYY]', styles: {} },
          ],
        },
      ],
      currentBlock,
      'after'
    )
  }, [editor])

  const closeMenu = useCallback(() => {
    editor?.suggestionMenus.closeMenu()
  }, [editor])

  const getItems = useCallback(
    async (query: string) => {
      if (!editor) return []

      const customItems: DefaultReactSuggestionItem[] = [
        {
          title: 'Add Signature',
          subtext: 'Launch the signature canvas to capture client approval',
          icon: <PenLine className="w-4 h-4 text-primary-600" />,
          onItemClick: () => {
            closeMenu()
            onRequestSignature?.()
          },
          aliases: ['signature', 'sign', 'esign'],
        },
        {
          title: 'Insert Clause from Library',
          subtext: 'Open curated legal clauses and templates',
          icon: <BookOpenCheck className="w-4 h-4 text-primary-600" />,
          onItemClick: () => {
            closeMenu()
            onRequestClauseLibrary?.()
          },
          aliases: ['clause', 'library', 'template'],
        },
        {
          title: 'Generate Clause with AI',
          subtext: 'Prompt Lexora to craft a tailored clause',
          icon: <Sparkles className="w-4 h-4 text-primary-600" />,
          onItemClick: () => {
            closeMenu()
            onRequestAIGenerator?.()
          },
          aliases: ['ai', 'generate'],
        },
        {
          title: 'Add Party Information Block',
          subtext: 'Insert placeholders for Party A and Party B details',
          icon: <Users2 className="w-4 h-4 text-primary-600" />,
          onItemClick: () => {
            insertPartyBlock()
            closeMenu()
          },
          aliases: ['party', 'parties', 'details'],
        },
        {
          title: 'Suggest Missing Clauses',
          subtext: 'Ask AI to highlight gaps or critical clauses',
          icon: <Compass className="w-4 h-4 text-primary-600" />,
          onItemClick: () => {
            closeMenu()
            onRequestAISuggest?.()
          },
          aliases: ['suggest', 'missing'],
        },
        {
          title: 'Summarize Contract',
          subtext: 'Generate an executive summary for quick briefing',
          icon: <Sparkles className="w-4 h-4 text-primary-600" />,
          onItemClick: () => {
            closeMenu()
            onRequestAISummarize?.()
          },
          aliases: ['summary', 'summarize'],
        },
      ]

      const defaults = getDefaultReactSlashMenuItems(editor)
      const allItems = [...customItems, ...defaults]

      if (!query) {
        return allItems
      }

      const normalized = query.toLowerCase()
      return allItems.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(normalized)
        const subtextMatch = item.subtext?.toLowerCase().includes(normalized)
        const aliasMatch = item.aliases?.some((alias) => alias.toLowerCase().includes(normalized))
        return titleMatch || subtextMatch || aliasMatch
      })
    },
    [
      editor,
      closeMenu,
      insertPartyBlock,
      onRequestSignature,
      onRequestClauseLibrary,
      onRequestAIGenerator,
      onRequestAISummarize,
      onRequestAISuggest,
    ]
  )

  if (!editor) return null

  return <SuggestionMenuController triggerCharacter="/" getItems={getItems} />
}
