'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

interface AIClauseGeneratorProps {
  onInsert?: (clause: string) => void
  onClose: () => void
  className?: string
}

export const AIClauseGenerator: React.FC<AIClauseGeneratorProps> = ({
  onInsert,
  onClose,
  className,
}) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedClause, setGeneratedClause] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // Mock AI generation - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGeneratedClause(
      `[AI Generated Clause]\n\n${prompt}\n\nThis clause has been generated based on your prompt. The specific terms and conditions will be refined based on your requirements.\n\nNote: This is a mock response. Backend integration will be implemented later.`
    )
    setIsGenerating(false)
  }

  const handleInsert = () => {
    if (generatedClause && onInsert) {
      onInsert(generatedClause)
      onClose()
    }
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">AI Clause Generator</h3>
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
          Describe the clause you want to generate
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Create a confidentiality clause for a software development agreement..."
          className="w-full p-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={4}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full mb-4"
        variant="primary"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Clause
          </>
        )}
      </Button>

      {generatedClause && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generated Clause
          </label>
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-md text-sm text-gray-900 max-h-64 overflow-y-auto">
            {generatedClause}
          </div>
        </div>
      )}

      {generatedClause && (
        <div className="flex gap-2">
          <Button
            onClick={handleInsert}
            className="flex-1"
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Insert Clause
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

