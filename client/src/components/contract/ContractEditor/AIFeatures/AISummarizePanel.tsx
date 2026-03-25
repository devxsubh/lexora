'use client'

import React, { useState } from 'react'
import { FileText, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

interface AISummarizePanelProps {
  content: any[]
  onClose: () => void
  className?: string
}

export const AISummarizePanel: React.FC<AISummarizePanelProps> = ({
  content,
  onClose,
  className,
}) => {
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSummarize = async () => {
    setIsSummarizing(true)
    // Mock AI summarization - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSummary(
      `**Contract Summary**\n\n**Document Type:** Agreement\n**Key Sections:**\n- Executive Summary\n- Scope of Work\n- Terms and Conditions\n\n**Main Points:**\n- This agreement outlines the terms between parties\n- Defines deliverables and obligations\n- Establishes the legal framework for the engagement\n\n**Important Clauses:**\n- Work scope and deliverables\n- Payment terms (if applicable)\n- Confidentiality (if applicable)\n\n**Action Items:**\n- Review all clauses carefully\n- Ensure all parties agree to terms\n- Consider adding missing standard clauses\n\n⚠️ Note: This is a mock summary. Backend integration will be implemented later.`
    )
    setIsSummarizing(false)
  }

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Summarize Contract</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <Button
        onClick={handleSummarize}
        disabled={isSummarizing || !content || content.length === 0}
        className="w-full mb-4"
        variant="primary"
      >
        {isSummarizing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Summarizing...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Generate Summary
          </>
        )}
      </Button>

      {summary && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Summary
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
            {summary}
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

