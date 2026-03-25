'use client'

import React from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface ImmersiveModeProps {
  isActive: boolean
  onToggle: () => void
  className?: string
}

export const ImmersiveMode: React.FC<ImmersiveModeProps> = ({
  isActive,
  onToggle,
  className,
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        'border border-gray-200 hover:bg-gray-50',
        'transition-colors text-sm font-medium text-gray-700',
        isActive && 'bg-primary-50 border-primary-200 text-primary-700',
        className
      )}
      title={isActive ? 'Exit Immersive Mode' : 'Enter Immersive Mode'}
    >
      {isActive ? (
        <>
          <Minimize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Exit Focus</span>
        </>
      ) : (
        <>
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Focus Mode</span>
        </>
      )}
    </button>
  )
}

