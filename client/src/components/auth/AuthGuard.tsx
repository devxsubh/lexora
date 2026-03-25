'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loading } from '@/components/ui/Loading'

// ============================================================================
// Types
// ============================================================================

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

// ============================================================================
// Component
// ============================================================================

/**
 * AuthGuard component to protect routes
 * 
 * @param requireAuth - If true, redirects to signin if not authenticated. 
 *                      If false, redirects to dashboard if authenticated.
 * @param redirectTo - Custom redirect path
 * @param fallback - Custom loading component
 * 
 * @example
 * // Protected route (requires authentication)
 * <AuthGuard requireAuth>
 *   <DashboardPage />
 * </AuthGuard>
 * 
 * @example
 * // Public route (redirects to dashboard if authenticated)
 * <AuthGuard requireAuth={false}>
 *   <SignInPage />
 * </AuthGuard>
 */
export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo,
  fallback 
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    initialize,
    fetchProfile,
    user 
  } = useAuthStore()

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  // Fetch profile if authenticated but no user data
  useEffect(() => {
    if (isInitialized && isAuthenticated && !user) {
      fetchProfile()
    }
  }, [isInitialized, isAuthenticated, user, fetchProfile])

  // Handle redirects
  useEffect(() => {
    // Wait for initialization
    if (!isInitialized || isLoading) return

    if (requireAuth && !isAuthenticated) {
      // Not authenticated, redirect to signin with return URL
      const returnUrl = encodeURIComponent(pathname)
      router.push(redirectTo || `/signin?returnUrl=${returnUrl}`)
    } else if (!requireAuth && isAuthenticated) {
      // Already authenticated, redirect to dashboard
      router.push(redirectTo || '/dashboard')
    }
  }, [isAuthenticated, isInitialized, isLoading, requireAuth, redirectTo, router, pathname])

  // Show loading while initializing or loading
  if (!isInitialized || isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading />
      </div>
    )
  }

  // Don't render children while redirecting
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading />
      </div>
    )
  }

  if (!requireAuth && isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading />
      </div>
    )
  }

  return <>{children}</>
}

// ============================================================================
// Higher Order Component (Alternative)
// ============================================================================

/**
 * HOC to wrap components that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string }
) {
  return function WithAuthComponent(props: P) {
    return (
      <AuthGuard requireAuth redirectTo={options?.redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

/**
 * HOC to wrap components that should only be shown to guests
 */
export function withGuest<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string }
) {
  return function WithGuestComponent(props: P) {
    return (
      <AuthGuard requireAuth={false} redirectTo={options?.redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
