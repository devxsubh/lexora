import { apiClient } from './client'

// ============================================================================
// Types based on Postman collection and backend validation
// ============================================================================

export interface SignUpRequest {
  userName: string // 6-66 alphanumeric characters
  email: string
  password: string // 6-666 characters
  confirmPassword: string // Must match password
}

export interface SignInRequest {
  identifier: string // email or username
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  password: string
  confirmPassword: string
}

export interface VerifyEmailRequest {
  otp: string
}

export interface RefreshTokensRequest {
  refreshToken: string
}

export interface SignOutRequest {
  refreshToken: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  userName?: string
}

// User model matching backend response
export interface User {
  id: string
  _id?: string
  userName: string
  email: string
  firstName?: string
  lastName?: string
  isEmailVerified?: boolean
  role?: {
    id: string
    name: string
    permissions?: string[]
  }
  subscription?: {
    plan: string
    status: string
    expiresAt?: string
  }
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

// Token structure from backend
export interface TokenInfo {
  token: string
  expires: string
}

export interface AuthTokens {
  accessToken: TokenInfo
  refreshToken: TokenInfo
}

// Auth response from signin/signup
export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// Generic API response wrapper
export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  success?: boolean
}

// Error response type
export interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}

// ============================================================================
// Authentication API Service
// ============================================================================

export const authApi = {
  /**
   * Check if username is available
   * @param userName - Username to check (6-66 alphanumeric characters)
   */
  checkUsername: async (userName: string): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await apiClient.get('/auth/check-username', {
      params: { userName },
    })
    return response.data
  },

  /**
   * Sign up a new user
   * @param data - SignUpRequest with userName, email, password, confirmPassword
   */
  signUp: async (data: SignUpRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  /**
   * Sign in with email/username and password
   * @param data - SignInRequest with identifier (email or username) and password
   */
  signIn: async (data: SignInRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/signin', data)
    return response.data
  },

  /**
   * Get current authenticated user (minimal info)
   * Used for quick auth checks
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/current')
    return response.data
  },

  /**
   * Get full user profile
   * Returns complete user data including subscription, role, etc.
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  /**
   * Update user profile
   * @param data - Fields to update (firstName, lastName, userName)
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/auth/me', data)
    return response.data
  },

  /**
   * Refresh access token using refresh token
   * @param data - RefreshTokensRequest with refreshToken
   */
  refreshTokens: async (data: RefreshTokensRequest): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post('/auth/refresh-tokens', data)
    return response.data
  },

  /**
   * Sign out (invalidate refresh token on server)
   * @param data - SignOutRequest with refreshToken
   */
  signOut: async (data: SignOutRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/auth/signout', data)
    return response.data
  },

  /**
   * Request password reset (sends OTP to email)
   * @param data - ForgotPasswordRequest with email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/forgot-password', data)
    return response.data
  },

  /**
   * Reset password using OTP
   * @param data - ResetPasswordRequest with email, otp, password, confirmPassword
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/reset-password', data)
    return response.data
  },

  /**
   * Send verification email (requires auth)
   */
  sendVerificationEmail: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/send-verification-email')
    return response.data
  },

  /**
   * Verify email with OTP
   * @param data - VerifyEmailRequest with 6-digit OTP
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/verify-email', data)
    return response.data
  },
}

// ============================================================================
// Deprecated aliases for backward compatibility
// ============================================================================
export const getMe = authApi.getProfile
export const updateMe = authApi.updateProfile
