'use client'

import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { AIReviewIssue } from '@/types/ai'
import { cn } from '@/utils/helpers'

interface AiReviewPanelProps {
  issues: AIReviewIssue[]
  onDismiss?: () => void
}

const severityStyles: Record<AIReviewIssue['severity'], string> = {
  high: 'border-red-200 bg-red-50 text-red-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export const AiReviewPanel: React.FC<AiReviewPanelProps> = ({ issues, onDismiss }) => {
  if (!issues.length) return null

  return (
    <div className="max-w-4xl mx-auto mt-6 mb-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Review Feedback</h3>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>

        <ul className="divide-y divide-gray-100">
          {issues.map((issue) => (
            <li key={issue.id} className="px-6 py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-gray-900">{issue.title}</p>
                <span
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full border',
                    severityStyles[issue.severity]
                  )}
                >
                  {issue.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600">{issue.description}</p>
              {issue.suggestion && (
                <div className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>{issue.suggestion}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

