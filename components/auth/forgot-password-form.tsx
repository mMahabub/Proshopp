'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Sending...' : 'Send Reset Link'}
    </Button>
  )
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, undefined)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Forgot Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </div>

      {/* Success Message */}
      {state?.success === true && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {state.message}
        </div>
      )}

      {/* Error Message */}
      {state?.success === false && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      {/* Forgot Password Form */}
      <form action={formAction} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            autoComplete="email"
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
