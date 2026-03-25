'use client'

import React, { useState, useMemo } from 'react'
import { PartialBlock } from '@blocknote/core'
import { List, X, Hash } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface NavigatorItem {
  id: string
  level: number
  text: string
  blockId: string
}

interface FloatingNavigatorProps {
  content: PartialBlock[]
  onNavigate?: (blockId: string) => void
}

export const FloatingNavigator: React.FC<FloatingNavigatorProps> = ({
  content,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const outlineItems = useMemo(() => {
    const items: NavigatorItem[] = []
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
            id: `nav-${itemIndex++}`,
            level,
            text: text.trim(),
            blockId: `block-${index}`,
          })
        }
      }
    })

    return items
  }, [content])

  const handleNavigate = (blockId: string) => {
    if (onNavigate) {
      onNavigate(blockId)
    }
    const element = document.querySelector(`[data-block-id="${blockId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsOpen(false)
  }

  if (outlineItems.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'w-12 h-12 rounded-full shadow-lg',
          'bg-primary-600 text-white',
          'flex items-center justify-center',
          'hover:bg-primary-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
        )}
        title="Quick Navigation"
      >
        {isOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-24 right-6 w-80 max-h-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Quick Navigation</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {outlineItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.blockId)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    'hover:bg-gray-100 active:bg-gray-200',
                    'flex items-start gap-2',
                    item.level === 1 && 'font-semibold text-gray-900',
                    item.level === 2 && 'font-medium text-gray-800',
                    item.level === 3 && 'text-gray-700',
                    item.level >= 4 && 'text-gray-600'
                  )}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                >
                  <span className="truncate">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

