'use client'

import React from 'react'
import { FileText, Plus } from 'lucide-react'
import { cn } from '@/utils/helpers'

export interface ClauseTemplate {
  id: string
  title: string
  description: string
  category: string
  content: string
}

const templates: ClauseTemplate[] = [
  {
    id: 'confidentiality',
    title: 'Confidentiality Clause',
    description: 'Standard NDA and confidentiality terms',
    category: 'General',
    content: 'CONFIDENTIALITY\n\nBoth parties agree to maintain the confidentiality of all proprietary information shared during the term of this agreement and for a period of [X] years thereafter.',
  },
  {
    id: 'termination',
    title: 'Termination Clause',
    description: 'Terms for ending the agreement',
    category: 'General',
    content: 'TERMINATION\n\nEither party may terminate this agreement with [X] days written notice. Upon termination, all obligations and rights shall cease, except those that by their nature should survive.',
  },
  {
    id: 'indemnity',
    title: 'Indemnity Clause',
    description: 'Protection against losses and claims',
    category: 'Liability',
    content: 'INDEMNIFICATION\n\nEach party agrees to indemnify, defend, and hold harmless the other party from and against any claims, damages, losses, and expenses arising from its breach of this agreement.',
  },
  {
    id: 'payment',
    title: 'Payment Terms',
    description: 'Standard payment and invoicing terms',
    category: 'Financial',
    content: 'PAYMENT TERMS\n\nPayment shall be due within [X] days of invoice date. Late payments may incur interest at a rate of [X]% per month.',
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    description: 'Caps on liability exposure',
    category: 'Liability',
    content: 'LIMITATION OF LIABILITY\n\nTo the maximum extent permitted by law, neither party shall be liable for any indirect, incidental, special, or consequential damages arising from this agreement.',
  },
  {
    id: 'dispute',
    title: 'Dispute Resolution',
    description: 'How to resolve conflicts',
    category: 'Legal',
    content: 'DISPUTE RESOLUTION\n\nAny disputes arising from this agreement shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization].',
  },
]

interface ClauseTemplatesProps {
  onSelectTemplate?: (template: ClauseTemplate) => void
  className?: string
}

export const ClauseTemplates: React.FC<ClauseTemplatesProps> = ({
  onSelectTemplate,
  className,
}) => {
  const categories = Array.from(new Set(templates.map((t) => t.category)))

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Clause Templates</h3>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {category}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {templates
              .filter((t) => t.category === category)
              .map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate?.(template)}
                  className={cn(
                    'p-3 text-left border border-gray-200 rounded-lg',
                    'hover:border-primary-300 hover:bg-primary-50',
                    'transition-all group'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-primary-700">
                        {template.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {template.description}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0 mt-0.5" />
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

