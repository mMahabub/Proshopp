'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Resetting...' : 'Reset Password'}
    </Button>
  )
}

interface ResetPasswordFormProps {
  email: string
  token: string
}

export default function ResetPasswordForm({
  email,
  token,
}: ResetPasswordFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(resetPassword, undefined)
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    message: string
    color: string
  }>({ score: 0, message: '', color: '' })

  // Password strength checker (5-point scale)
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' })
      return
    }

    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    if (checks.length) score++
    if (checks.uppercase) score++
    if (checks.lowercase) score++
    if (checks.number) score++
    if (checks.special) score++

    let message = ''
    let color = ''

    if (score <= 2) {
      message = 'Weak'
      color = 'bg-red-500'
    } else if (score === 3) {
      message = 'Fair'
      color = 'bg-yellow-500'
    } else if (score === 4) {
      message = 'Good'
      color = 'bg-blue-500'
    } else {
      message = 'Strong'
      color = 'bg-green-500'
    }

    setPasswordStrength({ score, message, color })
  }, [password])

  // Redirect to sign-in page on successful password reset
  useEffect(() => {
    if (state?.success === true) {
      const timer = setTimeout(() => {
        router.push('/sign-in')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state, router])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      {/* Success Message */}
      {state?.success === true && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          <p>{state.message}</p>
          <p className="mt-1 text-xs text-green-500">
            Redirecting to sign in page...
          </p>
        </div>
      )}

      {/* Error Message */}
      {state?.success === false && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      {/* Reset Password Form */}
      <form action={formAction} className="space-y-4">
        {/* Hidden fields for email and token */}
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your new password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            minLength={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium min-w-[4rem]">
                  {passwordStrength.message}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase and number
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Submit Button */}
        <SubmitButton />
      </form>

      {/* Back to Sign In Link */}
      <div className="text-center text-sm">
        <Link
          href="/sign-in"
          className="text-primary hover:underline font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
