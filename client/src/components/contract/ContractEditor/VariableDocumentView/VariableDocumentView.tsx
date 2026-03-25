'use client'

import React from 'react'
import type { PartialBlock } from '@blocknote/core'
import { cn } from '@/utils/helpers'

const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g

function renderParagraphWithVariables(
  text: string,
  onVariableClick: (variableName: string, el: HTMLElement) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  VARIABLE_REGEX.lastIndex = 0
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const varName = match[1].trim()
    parts.push(
      <span
        key={`${match.index}-${varName}`}
        className="variable-placeholder cursor-pointer"
        data-variable-name={varName}
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault()
          onVariableClick(varName, e.currentTarget)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onVariableClick(varName, e.currentTarget)
          }
        }}
      >
        {match[0]}
      </span>
    )
    lastIndex = VARIABLE_REGEX.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts.length ? parts : [text]
}

function getBlockText(block: PartialBlock): string {
  const content = (block as { content?: unknown }).content
  if (!Array.isArray(content)) return ''
  const part = content.find((p: { type?: string; text?: string }) => p.type === 'text')
  return typeof (part as { text?: string })?.text === 'string' ? (part as { text: string }).text : ''
}

export interface VariableDocumentViewProps {
  content: PartialBlock[]
  onVariableClick: (variableName: string, element: HTMLElement) => void
  /** For contract 1: suggestion blocks to render with amber box + Accept/Reject */
  suggestionBlocks?: { id: string; suggestedText: string }[]
  onAcceptSuggestion?: (id: string) => void
  onRejectSuggestion?: (id: string) => void
  className?: string
}

export const VariableDocumentView: React.FC<VariableDocumentViewProps> = ({
  content,
  onVariableClick,
  suggestionBlocks = [],
  onAcceptSuggestion,
  onRejectSuggestion,
  className,
}) => {
  if (!content?.length) return null
  const suggestionByBlockId: Record<string, { id: string; suggestedText: string }> = {}
  suggestionBlocks.forEach((s) => {
    suggestionByBlockId[`suggestion-${s.id}`] = s
  })

  return (
    <div className={cn('space-y-4', className)}>
      {content.map((block, i) => {
        const id = (block as { id?: string }).id
        const key = id || `block-${i}`
        const suggestion = id ? suggestionByBlockId[id] : undefined

        if (block.type === 'heading') {
          const level = ((block as { props?: { level?: number } }).props?.level) ?? 1
          const text = getBlockText(block)
          const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
          return (
            <Tag key={key} className="font-semibold text-gray-900 mt-8 first:mt-0">
              {text.includes('{{') ? renderParagraphWithVariables(text, onVariableClick) : text}
            </Tag>
          )
        }

        if (block.type === 'paragraph') {
          const text = getBlockText(block)
          const hasVariables = text.includes('{{')
          const body = (
            <p className="text-gray-900 leading-relaxed">
              {hasVariables ? renderParagraphWithVariables(text, onVariableClick) : text}
            </p>
          )
          if (suggestion && onAcceptSuggestion && onRejectSuggestion) {
            return (
              <div
                key={key}
                className="rounded-lg border-l-4 border-amber-400 bg-amber-50/90 py-2 px-3 my-2"
              >
                {body}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onAcceptSuggestion(suggestion.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectSuggestion(suggestion.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          }
          return body
        }

        return null
      })}
    </div>
  )
}
