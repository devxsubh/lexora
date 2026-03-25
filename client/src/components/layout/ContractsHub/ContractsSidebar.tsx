'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Search,
  Home,
  LayoutGrid,
  FileText,
  Star,
  Clock,
} from 'lucide-react'
import { cn } from '@/utils/helpers'

const RECENT_CONTRACTS = [
  'NDA - Acme Corp',
  'Employment Agreement - Product Lead',
  'Vendor MSA - SwiftShip Logistics',
  'Confidentiality Agreement',
  'Service Agreement draft',
  'Investor NDA - Blue Ocean',
  'Consulting Agreement template',
  'Lease Agreement - Warehouse',
]

export function ContractsSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [recentsOpen, setRecentsOpen] = useState(true)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/contracts', label: 'Home', icon: Home },
    { href: '/contracts', label: 'Projects', icon: LayoutGrid },
    { href: '/contracts', label: 'Templates', icon: FileText },
  ]

  return (
    <aside
      className={cn(
        'h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header: Logo + collapse */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 min-h-[52px]">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-gray-900 truncate">Lexora</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Personal / Team - only when expanded */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">Personal</span>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-700 rounded">
            Free
          </span>
          <button className="p-0.5 rounded hover:bg-gray-100 text-gray-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* New Chat button */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <button
            onClick={() => setNewChatOpen(!newChatOpen)}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors',
              collapsed ? 'px-0 py-2.5' : 'px-4 py-2.5 text-sm'
            )}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span>New Chat</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </>
            )}
          </button>
          {newChatOpen && !collapsed && (
            <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50">
                Start blank
              </button>
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50">
                From template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search - only when expanded */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* Nav: Home, Projects, Templates */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}

        {/* Favorites - collapsible */}
        <div className="pt-2">
          <button
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-gray-700 hover:bg-gray-50 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <Star className="w-5 h-5 flex-shrink-0 text-gray-500" />
            {!collapsed && (
              <>
                <span className="text-sm flex-1 text-left">Favorites</span>
                <ChevronRight
                  className={cn('w-4 h-4 text-gray-400 transition-transform', favoritesOpen && 'rotate-90')}
                />
              </>
            )}
          </button>
          {favoritesOpen && !collapsed && (
            <div className="ml-4 mt-1 pl-3 border-l border-gray-100 space-y-0.5">
              <p className="text-xs text-gray-400 py-1">No favorites yet</p>
            </div>
          )}
        </div>

        {/* Recents - collapsible, shows chats */}
        <div className="pt-1">
          <button
            onClick={() => setRecentsOpen(!recentsOpen)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-gray-700 hover:bg-gray-50 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <Clock className="w-5 h-5 flex-shrink-0 text-gray-500" />
            {!collapsed && (
              <>
                <span className="text-sm flex-1 text-left">Recents</span>
                <ChevronDown
                  className={cn('w-4 h-4 text-gray-400 transition-transform', !recentsOpen && '-rotate-90')}
                />
              </>
            )}
          </button>
          {recentsOpen && (
            <div className={cn('mt-1 space-y-0.5', !collapsed && 'ml-4 pl-3 border-l border-gray-100')}>
              {RECENT_CONTRACTS.slice(0, collapsed ? 3 : 8).map((contract) => (
                <Link
                  key={contract}
                  href={`/contracts/workspace?doc=${encodeURIComponent(contract)}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2 text-sm'
                  )}
                >
                  <FileText className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  {!collapsed && <span className="truncate">{contract}</span>}
                </Link>
              ))}
              {!collapsed && (
                <button className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 rounded-lg font-medium">
                  Show more
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
