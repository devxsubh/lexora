'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu } from 'lucide-react'
import { UserProfileDropdown } from '@/components/user/UserProfileDropdown'
import { cn } from '@/utils/helpers'

export function ContractsTopNav({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [contextOpen, setContextOpen] = useState(false)
  const [context, setContext] = useState<'personal' | 'team'>('personal')

  return (
    <header className="h-14 flex-shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-3 sm:gap-4">
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link href="/contracts" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-gray-900 hidden sm:inline">Lexora</span>
        </Link>
        <div className="relative">
          <button
            onClick={() => setContextOpen(!contextOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              contextOpen ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <span className="capitalize">{context}</span>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-700 rounded">
              Free
            </span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', contextOpen && 'rotate-180')} />
          </button>
          {contextOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setContextOpen(false)} />
              <div className="absolute left-0 top-full mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
                <button
                  onClick={() => { setContext('personal'); setContextOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 rounded-t-lg"
                >
                  Personal
                </button>
                <button
                  onClick={() => { setContext('team'); setContextOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 rounded-b-lg"
                >
                  Team
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/contracts"
          className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
        >
          Upgrade
        </Link>
        <span className="hidden sm:inline text-sm font-medium text-gray-500 tabular-nums">5.00</span>
        <UserProfileDropdown />
      </div>
    </header>
  )
}
