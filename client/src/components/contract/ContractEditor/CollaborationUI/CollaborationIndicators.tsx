'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface Collaborator {
  id: string
  name: string
  color: string
  email?: string
  role?: string
  position?: { blockId: string; offset: number }
}

interface CollaborationIndicatorsProps {
  collaborators?: Collaborator[]
  className?: string
}

export const CollaborationIndicators: React.FC<CollaborationIndicatorsProps> = ({
  collaborators = [],
  className,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock collaborators - will be replaced with real data when backend is ready
  const mockCollaborators: Collaborator[] = [
    { id: '1', name: 'John Doe', color: '#3B82F6', email: 'john.doe@example.com', role: 'Editor' },
    { id: '2', name: 'Jane Smith', color: '#10B981', email: 'jane.smith@example.com', role: 'Editor' },
  ]

  const activeCollaborators = collaborators.length > 0 ? collaborators : mockCollaborators

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  if (activeCollaborators.length === 0) return null

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
      >
      <div className="flex -space-x-2">
          {activeCollaborators.slice(0, 2).map((collab) => (
          <div
            key={collab.id}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: collab.color }}
            title={collab.name}
          >
            {collab.name.charAt(0).toUpperCase()}
          </div>
        ))}
        </div>
        <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', isDropdownOpen && 'rotate-180')} />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] py-2">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Editors</p>
          </div>
          {activeCollaborators.map((collab) => (
            <div
              key={collab.id}
              className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: collab.color }}
              >
                {collab.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{collab.name}</p>
                {collab.email && (
                  <p className="text-xs text-gray-500 truncate">{collab.email}</p>
                )}
                {collab.role && (
                  <p className="text-xs text-gray-400 mt-0.5">{collab.role}</p>
        )}
      </div>
            </div>
          ))}
      </div>
      )}
    </div>
  )
}

