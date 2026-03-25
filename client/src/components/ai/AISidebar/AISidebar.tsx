'use client'

import React, { useState } from 'react'
import { X, Send } from 'lucide-react'
import type { ChatMessage } from '@/types/ai'
import { Button } from '@/components/ui/button'

export interface AIChatContentProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void> | void
  isProcessing: boolean
  title?: string
  showTitle?: boolean
}

/** Embeddable chat UI for use inside a rail panel (no close button). */
export const AIChatContent: React.FC<AIChatContentProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  title = 'Contract Copilot',
  showTitle = true,
}) => {
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    await onSendMessage(trimmed)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {showTitle && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">Ask questions or request edits</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500">
            <p>
              Start a conversation to receive clause explanations, risk assessments, or suggested
              edits for this agreement.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              {message.timestamp && (
                <span className="block mt-1 text-[10px] opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-600">
              Thinking…
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this contract…"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || isProcessing}
            className="rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void> | void
  isProcessing: boolean
  title?: string
}

export const AISidebar: React.FC<AISidebarProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isProcessing,
  title = 'AI Assistant',
}) => {
  if (!isOpen) return null

  return (
    <aside className="w-96 border-l border-gray-200 bg-white flex flex-col h-full animate-slide-left">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">Ask questions or request edits</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close AI sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <AIChatContent
          messages={messages}
          onSendMessage={onSendMessage}
          isProcessing={isProcessing}
          title={title}
          showTitle={false}
        />
      </div>
    </aside>
  )
}

