'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { ContractsSidebar, ContractsTopNav } from '@/components/layout/ContractsHub'
import { cn } from '@/utils/helpers'

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHub = pathname === '/contracts'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isHub) {
    return <AuthGuard>{children}</AuthGuard>
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Desktop sidebar */}
        <div className="hidden lg:block h-full">
          <ContractsSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        <div
          className={cn(
            'fixed inset-0 z-40 lg:hidden transition-opacity duration-200',
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div
            className={cn(
              'relative h-full w-72 max-w-[85%] bg-white shadow-2xl transform transition-transform duration-200',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <ContractsSidebar />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <ContractsTopNav onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-hidden bg-white">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
