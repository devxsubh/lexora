'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/forgot-password')
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md text-center px-6">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <Mail className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-sm text-gray-600 mb-6">
          We sent a password reset link to your email. Click the link in the email to reset your password.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forgot Password
        </Link>
      </div>
    </div>
  )
}
