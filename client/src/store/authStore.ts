import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { 
  User, 
  AuthTokens, 
  authApi, 
  SignInRequest, 
  SignUpRequest,
  UpdateProfileRequest 
} from '@/services/api/auth'

// ============================================================================
// Types
// ============================================================================

interface AuthState {
  // State
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean // Track if auth state has been hydrated
  error: string | null

  // Auth Actions
  signIn: (credentials: SignInRequest) => Promise<void>
  /** Dev bypass: sign in without credentials (for testing). Remove when done. */
  signInBypass: () => void
  signUp: (data: SignUpRequest) => Promise<void>
  signOut: () => Promise<void>
  
  // Token Actions
  refreshTokens: () => Promise<boolean>
  
  // Profile Actions
  fetchProfile: () => Promise<User | null>
  updateProfile: (data: UpdateProfileRequest) => Promise<User>
  
  // Utility Actions
  initialize: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
}

// ============================================================================
// Helper Functions
// ============================================================================

const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('auth-storage')
  }
}

const persistTokens = (tokens: AuthTokens) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', tokens.accessToken.token)
    localStorage.setItem('refreshToken', tokens.refreshToken.token)
  }
}

const persistUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

const getStoredRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken')
  }
  return null
}

// ============================================================================
// Auth Store
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // Sign In
      // ========================================
      signInBypass: () => {
        const devUser: User = {
          id: 'dev-bypass',
          userName: 'devuser',
          email: 'dev@test.com',
          firstName: 'Dev',
          lastName: 'User',
        }
        const devTokens: AuthTokens = {
          accessToken: { token: 'dev-bypass-token', expires: new Date(Date.now() + 86400000).toISOString() },
          refreshToken: { token: 'dev-bypass-refresh', expires: new Date(Date.now() + 604800000).toISOString() },
        }
        persistTokens(devTokens)
        persistUser(devUser)
        set({
          user: devUser,
          tokens: devTokens,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        })
      },

      signIn: async (credentials: SignInRequest) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await authApi.signIn(credentials)

          if (!response.data) {
            throw new Error('Invalid response from server')
          }

          const { user, tokens } = response.data

          // Validate token structure
          if (!tokens?.accessToken?.token || !tokens?.refreshToken?.token) {
            throw new Error('Invalid token structure received')
          }

          // Persist to storage
          persistTokens(tokens)
          persistUser(user)

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
          })

        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Sign in failed'
          
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            tokens: null,
          })
          
          throw new Error(errorMessage)
        }
      },

      // ========================================
      // Sign Up
      // ========================================
      signUp: async (data: SignUpRequest) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authApi.signUp(data)

          if (!response.data) {
            throw new Error('Invalid response from server')
          }

          const { user, tokens } = response.data

          // Validate token structure
          if (!tokens?.accessToken?.token || !tokens?.refreshToken?.token) {
            throw new Error('Invalid token structure received')
          }

          // Persist to storage
          persistTokens(tokens)
          persistUser(user)

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
          })

        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Sign up failed'
          
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            tokens: null,
          })
          
          throw new Error(errorMessage)
        }
      },

      // ========================================
      // Sign Out
      // ========================================
      signOut: async () => {
        const { tokens } = get()
        
        try {
          // Try to invalidate token on server
          const refreshToken = tokens?.refreshToken?.token || getStoredRefreshToken()
          
          if (refreshToken) {
            await authApi.signOut({ refreshToken })
          }
        } catch (error) {
          // Log but don't throw - we still want to clear local state
          console.warn('Server signout failed:', error)
        } finally {
          // Always clear local state and storage
          clearAuthStorage()
          
          set({
            ...initialState,
            isInitialized: true, // Keep initialized true after logout
          })
        }
      },

      // ========================================
      // Refresh Tokens
      // ========================================
      refreshTokens: async () => {
        try {
          const { tokens } = get()
          const refreshToken = tokens?.refreshToken?.token || getStoredRefreshToken()

          if (!refreshToken) {
            return false
          }

          const response = await authApi.refreshTokens({ refreshToken })

          if (!response.data?.accessToken?.token || !response.data?.refreshToken?.token) {
            throw new Error('Invalid token response')
          }

          const newTokens = response.data

          // Persist new tokens
          persistTokens(newTokens)

          set({ tokens: newTokens })
          
          return true
        } catch (error) {
          console.error('Token refresh failed:', error)
          // Don't automatically sign out here - let the API client handle it
          return false
        }
      },

      // ========================================
      // Fetch Profile
      // ========================================
      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null })

          const response = await authApi.getProfile()

          if (!response.data) {
            throw new Error('Failed to fetch profile')
          }

          const user = response.data

          // Update storage
          persistUser(user)

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          return user
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch profile'
          
          set({
            error: errorMessage,
            isLoading: false,
          })

          // If 401, clear auth state
          if (error.response?.status === 401) {
            clearAuthStorage()
            set({
              ...initialState,
              isInitialized: true,
            })
          }

          return null
        }
      },

      // ========================================
      // Update Profile
      // ========================================
      updateProfile: async (data: UpdateProfileRequest) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authApi.updateProfile(data)

          if (!response.data) {
            throw new Error('Failed to update profile')
          }

          const user = response.data

          // Update storage
          persistUser(user)

          set({
            user,
            isLoading: false,
          })

          return user
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile'
          
          set({
            error: errorMessage,
            isLoading: false,
          })
          
          throw new Error(errorMessage)
        }
      },

      // ========================================
      // Initialize (check auth state on app load)
      // ========================================
      initialize: async () => {
        // Skip if already initialized or running on server
        if (get().isInitialized || typeof window === 'undefined') {
          return
        }

        try {
          set({ isLoading: true })

          const accessToken = localStorage.getItem('accessToken')
          const refreshToken = localStorage.getItem('refreshToken')
          const storedUser = localStorage.getItem('user')

          // No tokens - not authenticated
          if (!accessToken && !refreshToken) {
            set({ 
              ...initialState, 
              isInitialized: true 
            })
            return
          }

          // Try to get fresh profile data
          try {
            const response = await authApi.getProfile()
            
            if (response.data) {
              const user = response.data
              persistUser(user)
              
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                error: null,
              })
              return
            }
          } catch (profileError: any) {
            // If 401, try to refresh tokens
            if (profileError.response?.status === 401 && refreshToken) {
              const refreshed = await get().refreshTokens()
              
              if (refreshed) {
                // Retry profile fetch after refresh
                const retryResponse = await authApi.getProfile()
                
                if (retryResponse.data) {
                  const user = retryResponse.data
                  persistUser(user)
                  
                  set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                    error: null,
                  })
                  return
                }
              }
            }
            throw profileError
          }

        } catch (error) {
          console.warn('Auth initialization failed:', error)
          clearAuthStorage()
          set({ 
            ...initialState, 
            isInitialized: true 
          })
        }
      },

      // ========================================
      // Utility Actions
      // ========================================
      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      reset: () => {
        clearAuthStorage()
        set({ ...initialState, isInitialized: true })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      // Skip hydration on server
      skipHydration: true,
    }
  )
)

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectIsInitialized = (state: AuthState) => state.isInitialized
export const selectError = (state: AuthState) => state.error

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get user data with type safety
 */
export const useUser = () => useAuthStore(selectUser)

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated)

/**
 * Hook to get loading state
 */
export const useAuthLoading = () => useAuthStore(selectIsLoading)

/**
 * Hook to check if auth has been initialized
 */
export const useAuthInitialized = () => useAuthStore(selectIsInitialized)

/**
 * Hook to get auth error
 */
export const useAuthError = () => useAuthStore(selectError)
