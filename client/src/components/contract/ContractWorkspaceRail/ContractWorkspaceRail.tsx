'use client'

import React from 'react'
import { Home, List, Sparkles } from 'lucide-react'
import { cn } from '@/utils/helpers'

export type RailTab = 'chat' | 'vars' | 'templates' | 'more' | 'home' | 'outline'

interface ContractWorkspaceRailProps {
  active: RailTab
  onChange: (tab: RailTab) => void
  className?: string
}

const RAIL_ITEMS: Array<{ id: RailTab; label: string; icon: React.ReactNode }> = [
  {
    id: 'chat',
    label: 'Chat',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-orange-600" />
      </div>
    ),
  },
  {
    id: 'vars',
    label: 'Vars',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">{'{ }'}</span>
      </div>
    ),
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">T</span>
      </div>
    ),
  },
  {
    id: 'more',
    label: 'More',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">…</span>
      </div>
    ),
  },
  {
    id: 'home',
    label: 'Home',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <Home className="w-5 h-5 text-gray-700" />
      </div>
    ),
  },
  {
    id: 'outline',
    label: 'Outline',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <List className="w-5 h-5 text-gray-700" />
      </div>
    ),
  },
]

export const ContractWorkspaceRail: React.FC<ContractWorkspaceRailProps> = ({
  active,
  onChange,
  className,
}) => {
  return (
    <aside
      className={cn(
        'w-[72px] border-r border-gray-200 bg-white flex flex-col items-center py-4 gap-4 flex-shrink-0',
        className
      )}
    >
      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-3 pt-2 overflow-y-auto">
        {RAIL_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition-colors w-full',
              active === item.id ? 'bg-orange-50' : 'hover:bg-gray-50'
            )}
            title={item.label}
          >
            {item.icon}
            <span
              className={cn(
                'text-[10px] font-medium',
                active === item.id ? 'text-orange-700' : 'text-gray-600'
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
