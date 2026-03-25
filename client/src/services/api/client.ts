import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// ============================================================================
// Configuration
// ============================================================================

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return (
      (window as any).__ENV__?.VITE_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5000'
    )
  }
  return (
    process.env.VITE_BACKEND_URL || 
    process.env.NEXT_PUBLIC_BACKEND_URL || 
    process.env.NEXT_PUBLIC_API_URL || 
    'http://localhost:5000'
  )
}

const API_BASE_URL = getApiBaseUrl()
const API_VERSION = '/api/v1'

// ============================================================================
// Token Management
// ============================================================================

export const TokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('auth-storage')
  },

  isTokenExpired: (expiresAt: string): boolean => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    // Consider token expired 30 seconds before actual expiry
    return expiryDate.getTime() - 30000 < now.getTime()
  },
}

// ============================================================================
// Axios Instance
// ============================================================================

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// ============================================================================
// Request Interceptor
// ============================================================================

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = TokenManager.getAccessToken()
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================================================
// Response Interceptor
// ============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean 
    }

    // Skip retry for auth endpoints to prevent loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/signin') ||
                          originalRequest.url?.includes('/auth/signup') ||
                          originalRequest.url?.includes('/auth/refresh-tokens') ||
                          originalRequest.url?.includes('/auth/signout')

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue the request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(apiClient(originalRequest))
            },
            reject: (err: any) => {
              reject(err)
            },
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = TokenManager.getRefreshToken()

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Use a fresh axios instance to avoid interceptor loops
        const response = await axios.post(
          `${API_BASE_URL}${API_VERSION}/auth/refresh-tokens`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data

        if (!newAccessToken?.token || !newRefreshToken?.token) {
          throw new Error('Invalid token response')
        }

        // Update stored tokens
        TokenManager.setTokens(newAccessToken.token, newRefreshToken.token)

        // Process queued requests
        processQueue(null, newAccessToken.token)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken.token}`
        }
        
        return apiClient(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // Clear all auth data
        TokenManager.clearTokens()

        // Redirect to signin (only on client side)
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          const publicPaths = ['/signin', '/signup', '/forgot-password', '/']
          
          if (!publicPaths.some(path => currentPath.startsWith(path))) {
            window.location.href = '/signin'
          }
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other 401 errors (e.g., invalid credentials)
    if (error.response?.status === 401 && isAuthEndpoint) {
      // Don't redirect for auth endpoints - let the component handle the error
      return Promise.reject(error)
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data)
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', originalRequest.url)
    }

    // Handle 500 Server Error
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response.data)
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

// ============================================================================
// API Helpers
// ============================================================================

export const api = {
  get: <T>(url: string, config?: any) => 
    apiClient.get<T>(url, config).then(res => res.data),
    
  post: <T>(url: string, data?: any, config?: any) => 
    apiClient.post<T>(url, data, config).then(res => res.data),
    
  put: <T>(url: string, data?: any, config?: any) => 
    apiClient.put<T>(url, data, config).then(res => res.data),
    
  patch: <T>(url: string, data?: any, config?: any) => 
    apiClient.patch<T>(url, data, config).then(res => res.data),
    
  delete: <T>(url: string, config?: any) => 
    apiClient.delete<T>(url, config).then(res => res.data),
}

export default apiClient
