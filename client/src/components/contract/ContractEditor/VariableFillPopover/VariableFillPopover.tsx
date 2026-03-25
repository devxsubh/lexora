'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, RotateCw, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'

interface VariableFillPopoverProps {
  variableName: string
  currentValue: string
  anchorEl: HTMLElement | null
  index: number
  total: number
  onApply: (value: string) => void
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
}

export const VariableFillPopover: React.FC<VariableFillPopoverProps> = ({
  variableName,
  currentValue,
  anchorEl,
  index,
  total,
  onApply,
  onClose,
  onNavigate,
}) => {
  const [inputValue, setInputValue] = useState(currentValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(currentValue)
  }, [currentValue, variableName])

  useEffect(() => {
    if (anchorEl) inputRef.current?.focus()
  }, [anchorEl])

  if (!anchorEl || typeof document === 'undefined') return null

  const rect = anchorEl.getBoundingClientRect()
  const popoverWidth = 320
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - popoverWidth - 8))
  const top = rect.bottom + 6

  const content = (
    <>
      <div
        className="fixed inset-0 z-[299]"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed z-[300] rounded-lg border border-gray-200 bg-white shadow-xl p-3"
        style={{ width: popoverWidth, left, top }}
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-medium text-gray-700 truncate" title={variableName}>
            {variableName.length > 22 ? `${variableName.slice(0, 19)}...` : variableName}
          </span>
          {total > 1 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate?.('prev')}
                className="p-0.5 hover:bg-gray-100 rounded"
                aria-label="Previous"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <span>{index + 1}/{total}</span>
              <button
                type="button"
                onClick={() => onNavigate?.('next')}
                className="p-0.5 hover:bg-gray-100 rounded"
                aria-label="Next"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter variable value"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onApply(inputValue)
            if (e.key === 'Escape') onClose()
          }}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="shrink-0"
          onClick={() => onApply(inputValue)}
          title="Apply"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
    </>
  )

  return createPortal(content, document.body)
}
