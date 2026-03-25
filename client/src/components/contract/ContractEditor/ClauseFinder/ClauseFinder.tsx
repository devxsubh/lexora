'use client'

import React, { useState, useMemo } from 'react'
import { PartialBlock } from '@blocknote/core'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface ClauseFinderProps {
  content: PartialBlock[]
  onNavigate?: (blockId: string) => void
  className?: string
}

export const ClauseFinder: React.FC<ClauseFinderProps> = ({
  content,
  onNavigate,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: Array<{ blockId: string; text: string; matchIndex: number }> = []

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
      const text = extractText(block).toLowerCase()
      const matchIndex = text.indexOf(query)
      if (matchIndex !== -1) {
        const fullText = extractText(block)
        results.push({
          blockId: `block-${index}`,
          text: fullText.substring(0, 100) + (fullText.length > 100 ? '...' : ''),
          matchIndex,
        })
      }
    })

    return results.slice(0, 10) // Limit to 10 results
  }, [content, searchQuery])

  const handleNavigate = (blockId: string) => {
    if (onNavigate) {
      onNavigate(blockId)
    }
    const element = document.querySelector(`[data-block-id="${blockId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('bg-yellow-100')
      setTimeout(() => {
        element.classList.remove('bg-yellow-100')
      }, 2000)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search clauses, keywords..."
          className={cn(
            'w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'bg-white text-gray-900 placeholder-gray-400'
          )}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && searchQuery && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => {
                handleNavigate(result.blockId)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="text-sm text-gray-900 line-clamp-2">
                {result.text.substring(0, result.matchIndex)}
                <mark className="bg-yellow-200 px-0.5">
                  {result.text.substring(result.matchIndex, result.matchIndex + searchQuery.length)}
                </mark>
                {result.text.substring(result.matchIndex + searchQuery.length)}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchQuery && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-500 text-center">
          No results found
        </div>
      )}
    </div>
  )
}

