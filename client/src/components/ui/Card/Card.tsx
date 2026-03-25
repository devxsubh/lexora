import React from 'react'
import { cn } from '@/utils/helpers'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className, hover = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-primary-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

