'use client'

import React from 'react'
import { Home, List, Code, MessageSquare, HelpCircle } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface EditorSidebarProps {
  className?: string
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({ className }) => {
  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => {
        // Navigate to home or contracts list
        window.location.href = '/contracts'
      },
    },
    {
      id: 'outline',
      label: 'Outline',
      icon: List,
      onClick: () => {
        // Toggle outline view - will be handled by parent
        const event = new CustomEvent('toggle-outline')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'variables',
      label: 'Variables',
      icon: Code,
      onClick: () => {
        // Open variables panel
        const event = new CustomEvent('open-variables')
        window.dispatchEvent(event)
      },
    },
  ]

  const bottomItems = [
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      onClick: () => {
        console.log('Feedback clicked')
      },
    },
    {
      id: 'help',
      label: 'Help center',
      icon: HelpCircle,
      onClick: () => {
        console.log('Help center clicked')
      },
    },
  ]

  return (
    <aside
      className={cn(
        'w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-6 flex-shrink-0',
        className
      )}
    >
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex flex-col items-center gap-1.5 group hover:opacity-80 transition-opacity"
              title={item.label}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-gray-200/60 transition-colors">
                <Icon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-gray-500 font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-6 pt-6 border-t border-gray-200">
        {bottomItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex flex-col items-center gap-1.5 group hover:opacity-80 transition-opacity"
              title={item.label}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-gray-200/60 transition-colors">
                <Icon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-gray-500 font-medium text-center leading-tight">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

