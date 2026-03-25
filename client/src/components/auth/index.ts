// Auth Components
export { AuthGuard, withAuth, withGuest } from './AuthGuard'
export { AuthProvider, useAuth } from './AuthProvider'

// Re-export hooks from store for convenience
export {
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthInitialized,
  useAuthError,
} from '@/store/authStore'

