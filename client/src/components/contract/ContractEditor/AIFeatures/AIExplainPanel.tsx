'use client'

import React, { useState } from 'react'
import { Brain, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

interface AIExplainPanelProps {
  clauseText: string
  onClose: () => void
  className?: string
}

export const AIExplainPanel: React.FC<AIExplainPanelProps> = ({
  clauseText,
  onClose,
  className,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleExplain = async () => {
    setIsProcessing(true)
    // Mock AI explanation - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setExplanation(
      `**Explanation of Clause:**\n\n${clauseText}\n\n**Key Points:**\n- This clause defines the terms and conditions\n- It establishes the legal framework\n- Both parties are bound by these terms\n\n**Legal Implications:**\nThis clause has standard legal implications. In case of disputes, the terms outlined here will be used as reference.\n\n**Recommendations:**\n- Review with legal counsel\n- Ensure all parties understand the terms\n- Consider adding specific timelines or conditions\n\n⚠️ Note: This is a mock response. Backend integration will be implemented later.`
    )
    setIsProcessing(false)
  }

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Explain Clause</h3>
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
          Selected Clause
        </label>
        <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto">
          {clauseText || 'No clause selected'}
        </div>
      </div>

      <Button
        onClick={handleExplain}
        disabled={isProcessing || !clauseText}
        className="w-full mb-4"
        variant="primary"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Explain with AI
          </>
        )}
      </Button>

      {explanation && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Explanation
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
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-md text-sm text-gray-900 max-h-96 overflow-y-auto whitespace-pre-wrap">
            {explanation}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ⚠️ Backend integration will be implemented later
        </p>
      </div>
    </div>
  )
}

