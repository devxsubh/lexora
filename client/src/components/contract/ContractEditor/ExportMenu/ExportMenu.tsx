'use client'

import React, { useState } from 'react'
import { Download, FileText, File, Code, Globe } from 'lucide-react'
import { PartialBlock } from '@blocknote/core'
import { cn } from '@/utils/helpers'

interface ExportMenuProps {
  content: PartialBlock[]
  onExport?: (format: 'pdf' | 'docx' | 'md' | 'html') => void
  className?: string
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  content,
  onExport,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = [
    {
      id: 'pdf' as const,
      label: 'Export as PDF',
      icon: <FileText className="w-4 h-4" />,
      description: 'Professional PDF document',
    },
    {
      id: 'docx' as const,
      label: 'Export as DOCX',
      icon: <File className="w-4 h-4" />,
      description: 'Microsoft Word format',
    },
    {
      id: 'md' as const,
      label: 'Export as Markdown',
      icon: <Code className="w-4 h-4" />,
      description: 'Markdown format',
    },
    {
      id: 'html' as const,
      label: 'Export as HTML',
      icon: <Globe className="w-4 h-4" />,
      description: 'Web page format',
    },
  ]

  const handleExport = async (format: 'pdf' | 'docx' | 'md' | 'html') => {
    setIsExporting(true)
    setIsOpen(false)

    try {
      if (onExport) {
        await onExport(format)
      } else {
        // Mock export - will be implemented with actual libraries
        console.log(`Exporting as ${format}...`, content)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        alert(`Contract exported as ${format.toUpperCase()} (mock)`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'border border-gray-200 hover:bg-gray-50',
          'transition-colors text-sm font-medium text-gray-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
        {isExporting && (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1.5 mb-1">
              Export Format
            </div>
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md',
                  'text-left transition-colors',
                  'hover:bg-gray-50 text-gray-700'
                )}
              >
                <div className="text-gray-400">{option.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

