'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Wand2, FileText, Brain } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface FloatingAIToolbarProps {
  selectedText: string
  onRewrite?: () => void
  onExplain?: () => void
  onGenerate?: () => void
  className?: string
}

export const FloatingAIToolbar: React.FC<FloatingAIToolbarProps> = ({
  selectedText,
  onRewrite,
  onExplain,
  onGenerate,
  className,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2,
        })
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [])

  if (!isVisible || !selectedText.trim()) return null

  return (
    <div
      className={cn(
        'fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1',
        'flex items-center gap-1',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <button
        onClick={onRewrite}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-700 transition-colors"
        title="Rewrite with AI"
      >
        <Wand2 className="w-4 h-4" />
        <span className="hidden sm:inline">Rewrite</span>
      </button>
      <button
        onClick={onExplain}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-700 transition-colors"
        title="Explain clause"
      >
        <Brain className="w-4 h-4" />
        <span className="hidden sm:inline">Explain</span>
      </button>
      <button
        onClick={onGenerate}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-700 transition-colors"
        title="Generate clause"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Generate</span>
      </button>
    </div>
  )
}

