'use client'

import React, { useState, useMemo } from 'react'
import { ChevronsUpDown, Search, Plus, Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/helpers'

export interface Variable {
  id: string
  name: string
  value: string
  category: 'custom' | 'system'
  type?: 'text' | 'number' | 'date' | 'email' | 'phone'
}

interface VariablesPanelProps {
  variables?: Variable[]
  onVariableChange?: (variableId: string, value: string) => void
  onAddVariable?: (name: string) => void
  onDeleteVariable?: (variableId: string) => void
  className?: string
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  variables = [],
  onVariableChange,
  onAddVariable,
  onDeleteVariable,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newVariableName, setNewVariableName] = useState('')
  const [showAddVariable, setShowAddVariable] = useState(false)

  // Mock variables - will be replaced with real data
  const mockVariables: Variable[] = [
    { id: '1', name: 'Landlord.Address 1', value: 'Divyanshi', category: 'custom', type: 'text' },
    { id: '2', name: 'Landlord.Email 1', value: '', category: 'custom', type: 'email' },
    { id: '3', name: 'Landlord.Name 2', value: '', category: 'custom', type: 'text' },
    { id: '4', name: 'Landlord.Phone 1', value: '', category: 'custom', type: 'phone' },
    { id: '5', name: 'Rent.Amount 1', value: '', category: 'custom', type: 'number' },
  ]

  const activeVariables = variables.length > 0 ? variables : mockVariables

  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return activeVariables
    const query = searchQuery.toLowerCase()
    return activeVariables.filter((v) => v.name.toLowerCase().includes(query))
  }, [activeVariables, searchQuery])

  const customVariables = filteredVariables.filter((v) => v.category === 'custom')

  const handleCopyVariable = (variableName: string) => {
    navigator.clipboard.writeText(`{{${variableName}}}`)
  }

  const handleAddCustomVariable = () => {
    if (newVariableName.trim() && onAddVariable) {
      onAddVariable(newVariableName.trim())
      setNewVariableName('')
      setShowAddVariable(false)
    }
  }

  const handleVariableValueChange = (variableId: string, value: string) => {
    if (onVariableChange) {
      onVariableChange(variableId, value)
    }
  }

  if (isCollapsed) {
    return (
      <div className={cn('p-4 border-b border-gray-200', className)}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Variables</h3>
          <ChevronsUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Variables</h3>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronsUpDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-600 mb-2">
          Use variables to quickly fill in repeated info across your document.
        </p>
        <a
          href="#"
          className="text-xs text-primary-600 hover:text-primary-700 underline"
          onClick={(e) => {
            e.preventDefault()
            // Open help/documentation
          }}
        >
          Learn more about variables
        </a>

        {/* Add Custom Variable Button */}
        {!showAddVariable ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddVariable(true)}
            className="w-full mt-4 border-primary-600 text-primary-600 hover:bg-primary-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add custom variable
          </Button>
        ) : (
          <div className="mt-4 space-y-2">
            <Input
              placeholder="Variable name (e.g., Landlord.Name)"
              value={newVariableName}
              onChange={(e) => setNewVariableName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCustomVariable()
                } else if (e.key === 'Escape') {
                  setShowAddVariable(false)
                  setNewVariableName('')
                }
              }}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddCustomVariable}
                className="flex-1"
              >
                Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddVariable(false)
                  setNewVariableName('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4">
          {/* Custom Variables Section */}
          {customVariables.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Custom
              </h4>
              <div className="space-y-3">
                {customVariables.map((variable) => (
                  <div key={variable.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-700">
                        {variable.name}
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyVariable(variable.name)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Click to copy"
                        >
                          <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                        </button>
                        {onDeleteVariable && variable.category === 'custom' && (
                          <button
                            onClick={() => onDeleteVariable(variable.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete variable"
                          >
                            <X className="w-3 h-3 text-gray-400 hover:text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                    <Input
                      type={variable.type === 'email' ? 'email' : variable.type === 'number' ? 'number' : 'text'}
                      placeholder="No value"
                      value={variable.value}
                      onChange={(e) => handleVariableValueChange(variable.id, e.target.value)}
                      className={cn(
                        'text-sm',
                        !variable.value && 'text-gray-400 placeholder:text-gray-400'
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {customVariables.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No variables found</p>
              {searchQuery && (
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

