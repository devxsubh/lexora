'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Folder, 
  Clock, 
  Grid3x3, 
  FileText, 
  Star, 
  ChevronRight,
  Settings,
  User,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Camera,
  Check,
  X,
  Loader2,
  CreditCard,
  BadgeCheck,
  FileCheck,
  Heart,
  Eye
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserProfileDropdown } from '@/components/user/UserProfileDropdown'
import { Button } from '@/components/ui/button-shadcn'
import { LexoraLogo } from '@/components/ui/LexoraLogo'

const recentChats = [
  { id: 1, title: 'Employment Contract Generator', icon: FileText },
  { id: 2, title: 'NDA Template Creation', icon: FileCheck },
  { id: 3, title: 'Service Agreement Review', icon: FileCheck },
  { id: 4, title: 'Partnership Agreement', icon: FileText },
  { id: 5, title: 'Vendor Contract Analysis', icon: FileCheck },
]

export default function ProfilePage() {
  const router = useRouter()
  const { 
    user, 
    fetchProfile, 
    updateProfile, 
    isLoading, 
    isInitialized,
    initialize 
  } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('contracts')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
  })
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  useEffect(() => {
    if (isInitialized) {
      fetchProfile()
    }
  }, [isInitialized, fetchProfile])

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      name: user?.name || '',
    })
    setUpdateError(null)
  }

  const handleSave = async () => {
    try {
      setUpdateError(null)
      await updateProfile(editForm)
      setIsEditing(false)
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update profile')
    }
  }

  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return user.name.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getDisplayName = () => {
    return user?.name || 'User'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Mock stats - replace with real data from API
  const stats = {
    contracts: 24,
    templates: 8,
    favorites: 12
  }

  return (
    <AuthGuard>
      <div className="h-screen flex overflow-hidden bg-white">
        {/* Left Sidebar - Same as Dashboard */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200">
            <LexoraLogo href="/dashboard" size="md" />
          </div>

          {/* New Contract Button */}
          <div className="p-4 border-b border-gray-200">
            <Link href="/dashboard">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Contract
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
            >
              <Folder className="w-4 h-4" />
              <span>Projects</span>
            </Link>
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Recent Chats</span>
            </Link>
            <Link
              href="/clause-library"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
            >
              <Grid3x3 className="w-4 h-4" />
              <span>Clause Library</span>
            </Link>
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Templates</span>
            </Link>
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>Favorites</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Link>
          </nav>

          {/* Recent Chats */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Recent Chats
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {recentChats.map((chat) => {
                const Icon = chat.icon
                return (
                  <Link
                    key={chat.id}
                    href="/contracts"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors truncate"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Section */}
          <div className="p-3 border-t border-gray-200">
            <UserProfileDropdown />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Header */}
          <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600">Free Plan</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-orange-50">
                Upgrade
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-orange-50">
                Feedback
              </Button>
            </div>
          </header>

          {/* Profile Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8 px-6">
              {isLoading && !user ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Profile Card with Gradient */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Cover with Black-Orange Gradient */}
                    <div 
                      className="h-40 relative"
                      style={{
                        background: 'radial-gradient(ellipse 120% 100% at 100% 70%, #ea580c 0%, #c2410c 35%, transparent 70%), radial-gradient(ellipse 80% 80% at 90% 60%, #fb923c 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 95% 50%, #fdba74 0%, transparent 45%), radial-gradient(ellipse 60% 60% at 0% 0%, #1f1f1f 0%, transparent 50%), linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
                      }}
                    />

                    {/* Avatar - Positioned over gradient */}
                    <div className="relative px-8">
                      <div className="absolute -top-16">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                              <span className="text-white text-4xl font-bold">
                                {getInitials()}
                              </span>
                            </div>
                          </div>
                          <button className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors border border-gray-100">
                            <Camera className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-20 pb-6 px-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                              {getDisplayName()}
                            </h1>
                            {user?.roles?.[0]?.name && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                {user.roles[0].name.toUpperCase()}
                              </span>
                            )}
                            {user?.confirmed && (
                              <BadgeCheck className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <p className="text-gray-500 mt-1">
                            Legal Contract Specialist
                          </p>
                          <p className="text-gray-400 text-sm mt-0.5">
                            {user?.email} • Member since {formatDate(user?.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <Button
                              variant="outline"
                              onClick={handleEdit}
                              className="flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit Profile
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                Save
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.contracts}</p>
                          <p className="text-sm text-gray-500">Contracts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.templates}</p>
                          <p className="text-sm text-gray-500">Templates</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
                          <p className="text-sm text-gray-500">Favorites</p>
                        </div>
                      </div>

                      {/* Success/Error Messages */}
                      {updateSuccess && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Profile updated successfully!
                        </div>
                      )}
                      {updateError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                          {updateError}
                        </div>
                      )}
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-100 px-8">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => setActiveTab('contracts')}
                          className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'contracts'
                              ? 'border-orange-600 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Contracts
                        </button>
                        <button
                          onClick={() => setActiveTab('templates')}
                          className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'templates'
                              ? 'border-orange-600 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Templates
                        </button>
                        <button
                          onClick={() => setActiveTab('favorites')}
                          className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'favorites'
                              ? 'border-orange-600 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Favorites
                        </button>
                        <button
                          onClick={() => setActiveTab('about')}
                          className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'about'
                              ? 'border-orange-600 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          About
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-6">
                    {activeTab === 'about' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Personal Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Full Name
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="Enter your name"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <p className="text-gray-900">{user?.name || 'Not set'}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Email Address
                              </label>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">{user?.email}</p>
                                {user?.confirmed ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    Verified
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    Not verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Account Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Role
                              </label>
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gray-400" />
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                                  {user?.roles?.[0]?.name || 'User'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Subscription
                              </label>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                                  Free Plan
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Member Since
                              </label>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'contracts' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Contracts</h3>
                          <p className="text-gray-500 mb-4">View and manage all your contracts here</p>
                          <Link href="/contracts">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                              View All Contracts
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {activeTab === 'templates' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-12">
                          <Grid3x3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Templates</h3>
                          <p className="text-gray-500 mb-4">Saved templates will appear here</p>
                          <Link href="/dashboard">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                              Create Template
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {activeTab === 'favorites' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-12">
                          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Favorites</h3>
                          <p className="text-gray-500 mb-4">Favorited contracts will appear here</p>
                          <Link href="/contracts">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                              Browse Contracts
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
