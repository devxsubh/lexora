'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

interface SuggestedClause {
  id: string
  title: string
  description: string
  reason: string
  content: string
}

interface AISuggestClausesProps {
  onInsert?: (clause: SuggestedClause) => void
  onClose: () => void
  className?: string
}

export const AISuggestClauses: React.FC<AISuggestClausesProps> = ({
  onInsert,
  onClose,
  className,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedClause[]>([])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Mock AI analysis - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSuggestions([
      {
        id: '1',
        title: 'Termination Clause',
        description: 'Add a clause that defines how either party can terminate the agreement',
        reason: 'Your contract lacks explicit termination rights, which could lead to disputes',
        content: 'TERMINATION\n\nEither party may terminate this agreement with 30 days written notice...',
      },
      {
        id: '2',
        title: 'Confidentiality Clause',
        description: 'Protect sensitive information shared during the engagement',
        reason: 'No confidentiality provisions found, which may expose sensitive data',
        content: 'CONFIDENTIALITY\n\nBoth parties agree to maintain confidentiality of proprietary information...',
      },
      {
        id: '3',
        title: 'Dispute Resolution',
        description: 'Define how conflicts will be resolved',
        reason: 'Missing dispute resolution mechanism could complicate conflict resolution',
        content: 'DISPUTE RESOLUTION\n\nAny disputes shall be resolved through binding arbitration...',
      },
    ])
    setIsAnalyzing(false)
  }

  const handleInsert = (clause: SuggestedClause) => {
    if (onInsert) {
      onInsert(clause)
      onClose()
    }
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Suggest Missing Clauses</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full mb-4"
        variant="primary"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Contract...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze & Suggest
          </>
        )}
      </Button>

      {suggestions.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {suggestions.map((clause) => (
            <div
              key={clause.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{clause.title}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{clause.description}</p>
                </div>
                <Button
                  onClick={() => handleInsert(clause)}
                  size="sm"
                  variant="primary"
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded mt-2">
                <strong>Why:</strong> {clause.reason}
              </div>
            </div>
          ))}
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

