'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { verifyEmail, resendVerification } from '@/lib/actions/auth.actions'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    async function verify() {
      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link. Please check your email.')
        return
      }

      try {
        const result = await verifyEmail(email, token)

        if (result.success) {
          setStatus('success')
          setMessage(result.message)

          // Redirect to sign-in after 3 seconds
          setTimeout(() => {
            router.push('/sign-in')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(result.message)
        }
      } catch {
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    verify()
  }, [token, email, router])

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const result = await resendVerification(email)

      if (result.success) {
        setMessage(result.message)
      } else {
        setMessage(result.message)
      }
    } catch {
      setMessage('Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Email Verification</h1>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
            <p className="text-gray-600">Verifying your email address...</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-green-600">
                Email Verified!
              </p>
              <p className="text-sm text-gray-600">{message}</p>
              <p className="text-xs text-gray-500">
                Redirecting to sign in page...
              </p>
            </div>
            <Link href="/sign-in">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-red-600">
                Verification Failed
              </p>
              <p className="text-sm text-gray-600">{message}</p>
            </div>

            {/* Resend Email Button */}
            {email && (
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending
                  ? 'Sending...'
                  : 'Resend Verification Email'}
              </Button>
            )}

            <Link href="/sign-up">
              <Button variant="link" className="w-full">
                Back to Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
