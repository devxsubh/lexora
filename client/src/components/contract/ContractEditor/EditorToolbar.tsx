'use client'

import React from 'react'
import { cn } from '@/utils/helpers'
import { Button } from '@/components/ui/button'
import { Share2, FileSignature } from 'lucide-react'
import { ExportMenu } from './ExportMenu'
import { CollaborationIndicators } from './CollaborationUI'

interface EditorToolbarProps {
  title: string
  onTitleChange: (value: string) => void
  onAiReview: () => void
  onExport: (format: 'pdf' | 'docx' | 'md' | 'html') => void
  onShare?: () => void
  onRequestSignatures?: () => void
  onSign?: () => void
  content?: any[]
  documentSigned?: boolean
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  title,
  onTitleChange,
  onAiReview,
  onExport,
  onShare,
  onRequestSignatures,
  onSign,
  content = [],
  documentSigned,
}) => {

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex-shrink-0 overflow-visible">
      <div className="w-full px-4 sm:px-6 lg:px-16 py-2.5 sm:py-3 flex flex-col gap-2.5 sm:gap-3 overflow-visible">
        <div className="flex flex-wrap items-start gap-3 sm:gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled Agreement"
                className="w-full md:w-auto flex-1 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <ExportMenu content={content} onExport={onExport} />
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onRequestSignatures && !documentSigned && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestSignatures}
                  className="hidden sm:inline-flex items-center gap-2"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Request Signatures</span>
                </Button>
              )}
              {onSign && !documentSigned && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSign}
                  className="hidden sm:inline-flex items-center gap-2"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Sign document</span>
                </Button>
              )}
              {documentSigned && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800">
                  <FileSignature className="w-3.5 h-3.5" />
                  Signed
                </span>
              )}
            </div>
            <div className="hidden sm:flex">
              <CollaborationIndicators />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

