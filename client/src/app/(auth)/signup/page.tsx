'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api/auth'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Clear errors when component mounts or inputs change
  useEffect(() => {
    clearError()
    setLocalError('')
  }, [clearError])

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.userName || formData.userName.length < 6) {
        setUsernameAvailable(null)
        return
      }

      if (!/^[a-zA-Z0-9]+$/.test(formData.userName)) {
        setUsernameAvailable(false)
        return
      }

      setCheckingUsername(true)
      try {
        const response = await authApi.checkUsername(formData.userName)
        setUsernameAvailable(response.data.available)
      } catch (err) {
        setUsernameAvailable(false)
      } finally {
        setCheckingUsername(false)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.userName])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setLocalError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!formData.userName.trim()) {
      setLocalError('Please enter a username')
      return
    }

    if (formData.userName.length < 6 || formData.userName.length > 66) {
      setLocalError('Username must be between 6 and 66 characters')
      return
    }

    if (!/^[a-zA-Z0-9]+$/.test(formData.userName)) {
      setLocalError('Username must contain only letters and numbers')
      return
    }

    if (usernameAvailable === false) {
      setLocalError('Username is already taken')
      return
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setLocalError('Please enter a valid email address')
      return
    }

    if (formData.password.length < 6 || formData.password.length > 666) {
      setLocalError('Password must be between 6 and 666 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    try {
      await signUp({
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        confirmPassword: formData.confirmPassword.trim(),
      })
      router.push('/dashboard')
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed. Please try again.')
    }
  }

  const displayError = localError || error

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] px-4">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create your account</h1>
        <p className="text-gray-500 text-sm">Please enter your details to register.</p>
      </div>

      <div className="space-y-4">
        {/* Google Button */}
        <button
          type="button"
          className="w-full h-11 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-sm font-medium text-gray-700"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative text-center text-sm">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative bg-[#fafafa] px-3 text-gray-500 text-xs">Or continue with</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {displayError}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              placeholder="yourname123"
              required
              maxLength={66}
              className={`w-full h-11 px-4 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                usernameAvailable === false
                  ? 'border-red-300 focus:ring-red-500'
                  : usernameAvailable === true
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-gray-200'
              }`}
            />
            {formData.userName && (
              <p className="text-xs">
                {checkingUsername ? (
                  <span className="text-gray-500">Checking availability...</span>
                ) : usernameAvailable === true ? (
                  <span className="text-green-600">✓ Username available</span>
                ) : usernameAvailable === false ? (
                  <span className="text-red-500">✗ Username already taken</span>
                ) : formData.userName.length > 0 && formData.userName.length < 6 ? (
                  <span className="text-amber-600">Username must be at least 6 characters</span>
                ) : !/^[a-zA-Z0-9]+$/.test(formData.userName) ? (
                  <span className="text-red-500">Only letters and numbers allowed</span>
                ) : null}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                maxLength={666}
                className="w-full h-11 px-4 pr-11 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                maxLength={666}
                className="w-full h-11 px-4 pr-11 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading || usernameAvailable === false || checkingUsername}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

