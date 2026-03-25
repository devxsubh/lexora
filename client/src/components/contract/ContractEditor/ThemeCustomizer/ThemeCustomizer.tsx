'use client'

import React, { useState } from 'react'
import { Palette, Sun, Moon, Sparkles, Droplet } from 'lucide-react'
import { cn } from '@/utils/helpers'

export type Theme = 'light' | 'dark' | 'legal-gold' | 'midnight-blue'

interface ThemeCustomizerProps {
  currentTheme: Theme
  onThemeChange: (theme: Theme) => void
  className?: string
}

const themes: Array<{ id: Theme; name: string; icon: React.ReactNode; description: string }> = [
  {
    id: 'light',
    name: 'Light',
    icon: <Sun className="w-4 h-4" />,
    description: 'Clean and bright',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: <Moon className="w-4 h-4" />,
    description: 'Easy on the eyes',
  },
  {
    id: 'legal-gold',
    name: 'Legal Gold',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Professional and elegant',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    icon: <Droplet className="w-4 h-4" />,
    description: 'Deep and focused',
  },
]

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentTheme,
  onThemeChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'border border-gray-200 hover:bg-gray-50',
          'transition-colors text-sm font-medium text-gray-700'
        )}
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1.5 mb-1">
              Choose Theme
            </div>
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md',
                  'text-left transition-colors',
                  currentTheme === theme.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                <div className={cn(currentTheme === theme.id ? 'text-primary-600' : 'text-gray-400')}>
                  {theme.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{theme.name}</div>
                  <div className="text-xs text-gray-500">{theme.description}</div>
                </div>
                {currentTheme === theme.id && (
                  <div className="w-2 h-2 rounded-full bg-primary-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

