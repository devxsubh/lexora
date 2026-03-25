'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'
import { authApi } from '@/services/api/auth'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'someone@example.com'
  const [otp, setOtp] = useState(['', '', '', '', '', '']) // 6-digit OTP
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValues = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedValues.forEach((val, i) => {
        if (index + i < 6) {
          newOtp[index + i] = val
        }
      })
      setOtp(newOtp)
      // Focus next empty input or last input
      const nextIndex = Math.min(index + pastedValues.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text/plain').slice(0, otp.length)
    const newOtp = pasteData.split('').slice(0, otp.length)
    setOtp(newOtp.concat(Array(otp.length - newOtp.length).fill('')))
    // Focus the last pasted input
    inputRefs.current[Math.min(newOtp.length - 1, otp.length - 1)]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.some((digit) => !digit)) {
      setError('Please enter the complete verification code')
      return
    }

    const otpCode = otp.join('')

    setIsLoading(true)

    try {
      // Verify OTP by attempting to reset password (API will validate OTP)
      // Store OTP in sessionStorage for reset password page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('resetPasswordOtp', otpCode)
        sessionStorage.setItem('resetPasswordEmail', email)
      }
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Invalid verification code. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setError('')
    try {
      await authApi.forgotPassword({ email })
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      // Show success message
      setError('Verification code resent successfully!')
      setTimeout(() => setError(''), 3000)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to resend code. Please try again.'
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
            <h2 className="text-2xl font-bold text-gray-900 mb-1.5">Email Verification</h2>
            <p className="text-sm text-gray-600">
              Please enter the OTP received on the email{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  error.includes('successfully')
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {error}
              </div>
            )}

            {/* OTP Input Fields - 6 digits */}
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={cn(
                    'w-12 h-12 text-center text-2xl font-semibold border-2 rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
                    'transition-all',
                    digit
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  )}
                />
              ))}
            </div>

            {/* Verify Email Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || otp.some((digit) => !digit)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 h-10 text-sm font-semibold mt-3"
            >
              {isLoading ? (
                'Verifying...'
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Didn&apos;t get code?{' '}
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
              >
                Resend Code
              </button>
            </p>
          </div>

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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

