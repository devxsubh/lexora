'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

interface AIRewritePanelProps {
  originalText: string
  onApply?: (rewrittenText: string) => void
  onClose: () => void
  className?: string
}

export const AIRewritePanel: React.FC<AIRewritePanelProps> = ({
  originalText,
  onApply,
  onClose,
  className,
}) => {
  const [tone, setTone] = useState<'formal' | 'friendly' | 'concise'>('formal')
  const [isProcessing, setIsProcessing] = useState(false)
  const [rewrittenText, setRewrittenText] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleRewrite = async () => {
    setIsProcessing(true)
    // Mock AI rewrite - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setRewrittenText(
      `[AI Rewritten - ${tone} tone]\n${originalText}\n\nNote: This is a mock response. Backend integration will be implemented later.`
    )
    setIsProcessing(false)
  }

  const handleCopy = () => {
    if (rewrittenText) {
      navigator.clipboard.writeText(rewrittenText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleApply = () => {
    if (rewrittenText && onApply) {
      onApply(rewrittenText)
      onClose()
    }
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">AI Rewrite Clause</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tone
        </label>
        <div className="flex gap-2">
          {(['formal', 'friendly', 'concise'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tone === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Original Text
        </label>
        <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto">
          {originalText}
        </div>
      </div>

      <Button
        onClick={handleRewrite}
        disabled={isProcessing}
        className="w-full mb-4"
        variant="primary"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Rewriting...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Rewrite with AI
          </>
        )}
      </Button>

      {rewrittenText && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Rewritten Text
            </label>
            <button
              onClick={handleCopy}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-md text-sm text-gray-900 max-h-48 overflow-y-auto">
            {rewrittenText}
          </div>
        </div>
      )}

      {rewrittenText && (
        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            className="flex-1"
            variant="primary"
          >
            Apply Changes
          </Button>
          <Button
            onClick={onClose}
            className="flex-1"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ⚠️ Backend integration will be implemented later
        </p>
      </div>
    </div>
  )
}

