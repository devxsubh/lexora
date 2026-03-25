'use client'

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { useAuthStore, useAuthInitialized, useIsAuthenticated, useUser } from '@/store/authStore'
import { User } from '@/services/api/auth'

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
  fetchProfile: () => Promise<User | null>
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()
  const isInitialized = useAuthInitialized()
  
  const { 
    initialize, 
    signOut, 
    fetchProfile,
    isLoading 
  } = useAuthStore()

  // Hydrate Zustand store on client
  useEffect(() => {
    // Rehydrate persisted state
    useAuthStore.persist.rehydrate()
    setIsHydrated(true)
  }, [])

  // Initialize auth state after hydration
  useEffect(() => {
    if (isHydrated && !isInitialized) {
      initialize()
    }
  }, [isHydrated, isInitialized, initialize])

  // Provide context value
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isInitialized: isHydrated && isInitialized,
    signOut,
    fetchProfile,
  }

  // Show nothing until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// ============================================================================
// Export convenience hooks from store
// ============================================================================

export { 
  useUser, 
  useIsAuthenticated, 
  useAuthLoading, 
  useAuthInitialized, 
  useAuthError 
} from '@/store/authStore'

