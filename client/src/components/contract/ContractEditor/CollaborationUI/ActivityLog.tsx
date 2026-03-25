'use client'

import React from 'react'
import { Clock, User, Edit, Plus, Trash2 } from 'lucide-react'
import { cn, formatDate } from '@/utils/helpers'

interface Activity {
  id: string
  type: 'edit' | 'add' | 'delete' | 'comment'
  user: string
  action: string
  timestamp: Date
  blockId?: string
}

interface ActivityLogProps {
  activities?: Activity[]
  className?: string
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  className,
}) => {
  // Mock activities - will be replaced with real data when backend is ready
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'edit',
      user: 'John Doe',
      action: 'Modified "Confidentiality Clause"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '2',
      type: 'add',
      user: 'Jane Smith',
      action: 'Added "Termination Clause"',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '3',
      type: 'comment',
      user: 'John Doe',
      action: 'Commented on "Payment Terms"',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  ]

  const displayActivities = activities || mockActivities

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'edit':
        return <Edit className="w-4 h-4" />
      case 'add':
        return <Plus className="w-4 h-4" />
      case 'delete':
        return <Trash2 className="w-4 h-4" />
      case 'comment':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'edit':
        return 'text-blue-600 bg-blue-50'
      case 'add':
        return 'text-green-600 bg-green-50'
      case 'delete':
        return 'text-red-600 bg-red-50'
      case 'comment':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
      </div>

      {displayActivities.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">
          No activity yet
        </div>
      ) : (
        <div className="space-y-3">
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={cn('p-2 rounded-lg', getColor(activity.type))}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-gray-600">{activity.action}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDate(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ⚠️ Backend integration will be implemented later
        </p>
      </div>
    </div>
  )
}

