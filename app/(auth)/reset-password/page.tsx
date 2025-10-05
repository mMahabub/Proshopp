'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ResetPasswordForm from '@/components/auth/reset-password-form'
import { Button } from '@/components/ui/button'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const [isValidLink, setIsValidLink] = useState(true)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setIsValidLink(false)
    }
  }, [token, email])

  if (!isValidLink) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <div className="space-y-4 text-center">
            {/* Error Icon */}
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
                Invalid Reset Link
              </p>
              <p className="text-sm text-gray-600">
                This password reset link is invalid or missing required
                parameters.
              </p>
            </div>

            <Link href="/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <ResetPasswordForm email={email!} token={token!} />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
