'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

export interface PromptInputProps {
  onSubmit: (prompt: string) => void
  isLoading?: boolean
  placeholder?: string
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading = false,
  placeholder = 'Describe the contract you want to create...',
}) => {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim())
      setPrompt('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-xl -z-10" />
        <div className="relative bg-white rounded-2xl border-2 border-gray-200 shadow-lg focus-within:border-primary-500 focus-within:shadow-xl transition-all duration-300">
          <div className="flex items-start gap-3 p-4">
            <div className="mt-1">
              <Sparkles className="w-5 h-5 text-primary-500" />
            </div>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={cn(
                'flex-1 resize-none border-0 focus:outline-none focus:ring-0',
                'text-gray-900 placeholder-gray-400 text-lg',
                'bg-transparent min-h-[60px] max-h-[200px]',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <Button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              isLoading={isLoading}
              className="mt-1 rounded-xl px-5 py-2.5"
              variant="primary"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-3 text-center">
        Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> to send,{' '}
        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift + Enter</kbd> for new line
      </p>
    </form>
  )
}

