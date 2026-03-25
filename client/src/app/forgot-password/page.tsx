'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { authApi } from '@/services/api/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      await authApi.forgotPassword({ email: email.trim() })
      setSuccess(true)
      // Navigate to verification code page after a short delay
      setTimeout(() => {
        router.push(`/forgot-password/verify?email=${encodeURIComponent(email.trim())}`)
      }, 1500)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to send verification code. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Form (50%) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-white overflow-hidden">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-900 rounded-lg mb-2">
              <span className="text-white text-lg font-bold">L</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">LexiDraft</h1>
          </div>

          {/* Mail Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1.5">Forgot Password</h2>
            <p className="text-sm text-gray-600">
              {success
                ? 'Verification code sent! Redirecting...'
                : "Enter your email address and we'll send you a verification code"}
            </p>
          </div>

          {/* Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="pl-10 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Send Verification Code Button */}
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Check your email for the verification code</p>
            </div>
          )}

          {/* Back to Sign In */}
          <div className="mt-4 text-center">
            <Link
              href="/signin"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>

          {/* Security Notice */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Your data is protected with industry-grade encryption
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Abstract Design (50%) */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {/* Abstract Gradient Shapes */}
        <div className="absolute inset-0">
          {/* Large diagonal shape - top right */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[400px] rounded-[100px] transform rotate-[-25deg] translate-x-[200px] translate-y-[-100px]"
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
            }}
          />
          
          {/* Large diagonal shape - bottom right */}
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-[100px] transform rotate-[25deg] translate-x-[200px] translate-y-[100px]"
            style={{
              background: 'linear-gradient(45deg, #ea580c 0%, #fb923c 100%)',
            }}
          />
          
          {/* Medium vertical shape - mid left */}
          <div
            className="absolute top-1/2 left-0 w-[300px] h-[250px] rounded-[80px] transform -translate-y-1/2 -translate-x-[100px] rotate-[-15deg]"
            style={{
              background: 'linear-gradient(180deg, #ea580c 0%, #fb923c 100%)',
            }}
          />
          
          {/* Small shape - bottom left */}
          <div
            className="absolute bottom-0 left-0 w-[200px] h-[150px] rounded-[60px] transform translate-x-[-50px] translate-y-[50px] rotate-[20deg]"
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}