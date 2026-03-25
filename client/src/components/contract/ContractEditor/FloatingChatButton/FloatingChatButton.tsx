'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Smile, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

interface FloatingChatButtonProps {
  onToggleChat: () => void
  isChatOpen: boolean
  lastActivityTime?: number
  idleTimeout?: number // in milliseconds, default 2 minutes
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onToggleChat,
  isChatOpen,
  lastActivityTime,
  idleTimeout = 120000, // 2 minutes default
}) => {
  const [showHelpMessage, setShowHelpMessage] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isChatOpen || !lastActivityTime) {
      setShowHelpMessage(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      return
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Calculate time since last activity
    const timeSinceActivity = Date.now() - lastActivityTime

    // If already idle, show message immediately
    if (timeSinceActivity >= idleTimeout) {
      setShowHelpMessage(true)
      setIsAnimating(true)
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
      animationRef.current = setTimeout(() => setIsAnimating(false), 1000)
    } else {
      // Set timeout to show message when idle
      const remainingTime = idleTimeout - timeSinceActivity
      timeoutRef.current = setTimeout(() => {
        setShowHelpMessage(true)
        setIsAnimating(true)
        if (animationRef.current) {
          clearTimeout(animationRef.current)
        }
        animationRef.current = setTimeout(() => setIsAnimating(false), 1000)
      }, remainingTime)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [lastActivityTime, idleTimeout, isChatOpen])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowHelpMessage(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Help Message */}
      {showHelpMessage && !isChatOpen && (
        <div
          className={cn(
            'bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-up',
            isAnimating && 'animate-bounce-subtle'
          )}
        >
          <p className="text-sm text-gray-700 font-medium">Need help?</p>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      )}

      {/* Floating Chat Button - Only show when chat is closed */}
      {!isChatOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleChat}
          className={cn(
            'w-14 h-14 rounded-full p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all',
            'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          )}
          title="Chat with AI"
        >
          <Smile className="w-6 h-6" />
        </Button>
      )}
    </div>
  )
}

