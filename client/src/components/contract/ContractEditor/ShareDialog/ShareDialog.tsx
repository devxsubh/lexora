'use client'

import React, { useState } from 'react'
import { X, Copy, Mail, Settings, HelpCircle, ChevronDown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/helpers'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Editor' | 'Viewer'
  avatar?: string
  avatarColor?: string
}

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  documentTitle: string
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  documentTitle,
}) => {
  const [newPersonInput, setNewPersonInput] = useState('')
  const [generalAccess, setGeneralAccess] = useState<'Restricted' | 'Anyone with the link'>('Restricted')

  // Mock data - will be replaced with real data when backend is ready
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Divyanshi Sachan',
      email: 'divyanshi.s23csai@nst.rishihood.edu.in',
      role: 'Owner',
      avatarColor: '#EF4444',
    },
    {
      id: '2',
      name: 'Subham Mahapatra',
      email: 'subham.m23csai@nst.rishihood.edu.in',
      role: 'Editor',
      avatarColor: '#3B82F6',
    },
  ])

  const handleAddPerson = () => {
    if (!newPersonInput.trim()) return
    // In real implementation, this would add the person via API
    console.log('Adding person:', newPersonInput)
    setNewPersonInput('')
  }

  const handleCopyLink = () => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    // Could show a toast notification here
  }

  const handleRoleChange = (collaboratorId: string, newRole: 'Owner' | 'Editor' | 'Viewer') => {
    setCollaborators((prev) =>
      prev.map((collab) => (collab.id === collaboratorId ? { ...collab, role: newRole } : collab))
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Share &apos;{documentTitle}&apos;
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help"
            >
              <HelpCircle className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => {}}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add People Input */}
          <div>
            <Input
              type="text"
              placeholder="Add people, groups, spaces, and calendar events"
              value={newPersonInput}
              onChange={(e) => setNewPersonInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddPerson()
                }
              }}
              className="w-full"
            />
          </div>

          {/* People with Access */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">People with access</h3>
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                      style={{
                        backgroundColor: collab.avatarColor || '#6B7280',
                      }}
                    >
                      {collab.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {collab.name}
                          {collab.role === 'Owner' && (
                            <span className="ml-2 text-xs text-gray-500 font-normal">(you)</span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{collab.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {collab.role === 'Owner' ? (
                      <span className="text-xs text-gray-500 px-2 py-1">{collab.role}</span>
                    ) : (
                      <div className="relative">
                        <select
                          value={collab.role}
                          onChange={(e) =>
                            handleRoleChange(collab.id, e.target.value as 'Owner' | 'Editor' | 'Viewer')
                          }
                          className="appearance-none bg-transparent border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 pr-8 hover:bg-gray-50 cursor-pointer"
                        >
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Access */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="relative">
                  <select
                    value={generalAccess}
                    onChange={(e) => setGeneralAccess(e.target.value as 'Restricted' | 'Anyone with the link')}
                    className="appearance-none bg-transparent border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 pr-8 hover:bg-gray-50 cursor-pointer w-full"
                  >
                    <option value="Restricted">Restricted</option>
                    <option value="Anyone with the link">Anyone with the link</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {generalAccess === 'Restricted'
                    ? 'Only people with access can open with the link'
                    : 'Anyone on the internet with the link can view'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy link
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

