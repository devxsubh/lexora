'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { FileText, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/helpers'

export interface QuickActionCardProps {
  id: string
  title: string
  description: string
  icon: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  delay?: number
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  variant = 'secondary',
  delay = 0,
}) => {
  const IconComponent = icon === '📄' ? FileText : Upload

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card
        hover
        onClick={onClick}
        className={cn(
          'p-5 cursor-pointer transition-all duration-200',
          variant === 'primary'
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white border-primary-600'
            : 'bg-white text-gray-900'
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              variant === 'primary' ? 'bg-white/20' : 'bg-primary-50'
            )}
          >
            <IconComponent
              className={cn('w-6 h-6', variant === 'primary' ? 'text-white' : 'text-primary-600')}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">{title}</h3>
            <p className={cn('text-sm', variant === 'primary' ? 'text-white/90' : 'text-gray-600')}>
              {description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

