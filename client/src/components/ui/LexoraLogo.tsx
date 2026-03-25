'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  href?: string
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const boxSizes = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-10 h-10' }
const letterSizes = { sm: 'text-xs', md: 'text-lg', lg: 'text-xl' }

export function LexoraLogo({ href = '/', className, showText = true, size = 'md' }: Props) {
  const content = (
    <>
      <div
        className={cn(
          'rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 text-white font-bold',
          boxSizes[size],
          letterSizes[size]
        )}
      >
        L
      </div>
      {showText && <span className="font-bold text-gray-900">Lexora</span>}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn('flex items-center gap-2 hover:opacity-90 transition-opacity', className)}
      >
        {content}
      </Link>
    )
  }

  return <div className={cn('flex items-center gap-2', className)}>{content}</div>
}

