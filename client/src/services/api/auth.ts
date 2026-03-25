import { apiClient } from './client'

// ============================================================================
// Types — aligned to backend validation & user model
// ============================================================================

export interface SignUpRequest {
  name: string
  email: string
  password: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface RefreshTokensRequest {
  refreshToken: string
}

export interface SignOutRequest {
  refreshToken: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  password?: string
  avatar?: string
}

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  confirmed?: boolean
  avatar?: string
  avatarUrl?: string
  roles?: Array<{
    id: string
    name: string
    description?: string
  }>
  createdAt?: string
  updatedAt?: string
}

export interface TokenInfo {
  token: string
  expires: string
}

export interface AuthTokens {
  accessToken: TokenInfo
  refreshToken: TokenInfo
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}

// ============================================================================
// Authentication API Service
// ============================================================================

export const authApi = {
  signUp: async (data: SignUpRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  signIn: async (data: SignInRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/signin', data)
    return response.data
  },

  getCurrentUser: async (): Promise<ApiResponse<{ name: string; avatarUrl?: string }>> => {
    const response = await apiClient.get('/auth/current')
    return response.data
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/auth/me', data)
    return response.data
  },

  refreshTokens: async (data: RefreshTokensRequest): Promise<ApiResponse<{ tokens: AuthTokens }>> => {
    const response = await apiClient.post('/auth/refresh-tokens', data)
    return response.data
  },

  signOut: async (data: SignOutRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/auth/signout', data)
    return response.data
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/auth/forgot-password', data)
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post(`/auth/reset-password?token=${encodeURIComponent(data.token)}`, {
      password: data.password,
    })
    return response.data
  },

  sendVerificationEmail: async (): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/auth/send-verification-email')
    return response.data
  },

  verifyEmail: async (token: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    return response.data
  },
}

// ============================================================================
// Aliases for backward compatibility
// ============================================================================
export const getMe = authApi.getProfile
export const updateMe = authApi.updateProfile
