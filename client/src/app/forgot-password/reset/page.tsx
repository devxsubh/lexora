'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { authApi } from '@/services/api/auth'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      router.push('/forgot-password')
    }
  }, [searchParams, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset link.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword({
        token,
        password: formData.password,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/signin')
      }, 2000)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to reset password. The link may have expired.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="h-screen flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-white overflow-hidden">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
            <p className="text-sm text-gray-600 mb-6">Your password has been reset successfully. Redirecting to sign in...</p>
            <Link
              href="/signin"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
            >
              Go to Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="flex-1 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute top-0 right-0 w-[600px] h-[400px] rounded-[100px] transform rotate-[-25deg] translate-x-[200px] translate-y-[-100px]"
              style={{ background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)' }}
            />
            <div
              className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-[100px] transform rotate-[25deg] translate-x-[200px] translate-y-[100px]"
              style={{ background: 'linear-gradient(45deg, #ea580c 0%, #fb923c 100%)' }}
            />
            <div
              className="absolute top-1/2 left-0 w-[300px] h-[250px] rounded-[80px] transform -translate-y-1/2 -translate-x-[100px] rotate-[-15deg]"
              style={{ background: 'linear-gradient(180deg, #ea580c 0%, #fb923c 100%)' }}
            />
            <div
              className="absolute bottom-0 left-0 w-[200px] h-[150px] rounded-[60px] transform translate-x-[-50px] translate-y-[50px] rotate-[20deg]"
              style={{ background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)' }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-white overflow-hidden">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-900 rounded-lg mb-2">
              <span className="text-white text-lg font-bold">L</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Lexora</h1>
          </div>

          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1.5">Reset Password</h2>
            <p className="text-sm text-gray-600">Enter your new password below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                  className="pl-10 pr-10 h-10 text-sm"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                  className="pl-10 pr-10 h-10 text-sm"
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
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 h-10 text-sm font-semibold mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/signin"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Back to Sign In
            </Link>
          </div>

          <div className="mt-5 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Your data is protected with industry-grade encryption
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-0 right-0 w-[600px] h-[400px] rounded-[100px] transform rotate-[-25deg] translate-x-[200px] translate-y-[-100px]"
            style={{ background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-[100px] transform rotate-[25deg] translate-x-[200px] translate-y-[100px]"
            style={{ background: 'linear-gradient(45deg, #ea580c 0%, #fb923c 100%)' }}
          />
          <div
            className="absolute top-1/2 left-0 w-[300px] h-[250px] rounded-[80px] transform -translate-y-1/2 -translate-x-[100px] rotate-[-15deg]"
            style={{ background: 'linear-gradient(180deg, #ea580c 0%, #fb923c 100%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[200px] h-[150px] rounded-[60px] transform translate-x-[-50px] translate-y-[50px] rotate-[20deg]"
            style={{ background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)' }}
          />
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
