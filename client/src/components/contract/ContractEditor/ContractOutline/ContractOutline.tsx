'use client'

import React, { useMemo } from 'react'
import { PartialBlock } from '@blocknote/core'
import { ChevronRight, Hash } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface OutlineItem {
  id: string
  level: number
  text: string
  blockId: string
}

interface ContractOutlineProps {
  content: PartialBlock[]
  onNavigate?: (blockId: string) => void
  className?: string
}

export const ContractOutline: React.FC<ContractOutlineProps> = ({
  content,
  onNavigate,
  className,
}) => {
  const outlineItems = useMemo(() => {
    const items: OutlineItem[] = []
    let itemIndex = 0

    const extractText = (block: PartialBlock): string => {
      if (!block.content) return ''
      const content = Array.isArray(block.content) ? block.content : [block.content]
      return content
        .map((item: any) => {
          if (typeof item === 'string') return item
          if (item && item.type === 'text') return item.text || ''
          return ''
        })
        .join('')
    }

    content.forEach((block, index) => {
      if (block.type === 'heading' && block.props?.level) {
        const level = block.props.level as number
        const text = extractText(block)
        if (text.trim()) {
          items.push({
            id: `outline-${itemIndex++}`,
            level,
            text: text.trim(),
            blockId: `block-${index}`,
          })
        }
      }
    })

    return items
  }, [content])

  const handleClick = (blockId: string) => {
    if (onNavigate) {
      onNavigate(blockId)
    }
    // Scroll to block (will be enhanced when we have block IDs)
    const element = document.querySelector(`[data-block-id="${blockId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (outlineItems.length === 0) {
    return (
      <div className={cn('p-4 text-sm text-gray-500', className)}>
        <p>No headings found. Add headings to generate an outline.</p>
      </div>
    )
  }

  return (
    <div className={cn('p-4 space-y-1', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Hash className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Outline</h3>
      </div>
      <nav className="space-y-0.5">
        {outlineItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.blockId)}
            className={cn(
              'w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors',
              'hover:bg-gray-100 active:bg-gray-200',
              'flex items-start gap-2 group',
              item.level === 1 && 'font-semibold text-gray-900',
              item.level === 2 && 'font-medium text-gray-800 pl-4',
              item.level === 3 && 'text-gray-700 pl-8',
              item.level >= 4 && 'text-gray-600 pl-12'
            )}
            style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
          >
            <ChevronRight className="w-3 h-3 text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            <span className="truncate">{item.text}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

