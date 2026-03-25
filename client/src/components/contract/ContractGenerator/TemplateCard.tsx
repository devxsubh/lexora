'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export interface TemplateCardProps {
  icon: string
  title: string
  description: string
  onClick: () => void
  delay?: number
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  icon,
  title,
  description,
  onClick,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        hover
        onClick={onClick}
        className="p-6 h-full flex flex-col group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{icon}</div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 flex-1">{description}</p>
      </Card>
    </motion.div>
  )
}

