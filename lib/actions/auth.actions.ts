'use server'

import { signIn, signOut } from '@/auth'
import { prisma } from '@/db/prisma'
import {
  signUpSchema,
  signInSchema,
  emailSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'
import { hashSync } from 'bcrypt-ts-edge'
import { AuthError } from 'next-auth'
import {
  createVerificationToken,
  sendVerificationEmail,
  verifyToken,
  resendVerificationEmail,
  createPasswordResetToken,
  sendPasswordResetEmail,
  verifyPasswordResetToken,
} from '@/lib/utils/email'

// Helper to check if error is a redirect
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  )
}

// Sign up new user with email and password
export async function signUp(prevState: unknown, formData: FormData) {
  try {
    // Extract and validate form data
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const validatedData = signUpSchema.parse(data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists',
      }
    }

    // Hash password
    const hashedPassword = hashSync(validatedData.password, 10)

    // Create user with emailVerified as null (unverified)
    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'user',
        emailVerified: null,
      },
    })

    // Create verification token
    const token = await createVerificationToken(validatedData.email)

    // Send verification email
    await sendVerificationEmail(
      validatedData.email,
      validatedData.name,
      token
    )

    return {
      success: true,
      message:
        'Account created successfully! Please check your email to verify your account.',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}

// Sign in with credentials (email and password)
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Extract and validate form data
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = signInSchema.parse(data)

    // Attempt sign in
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: true,
      redirectTo: '/dashboard',
    })

    return {
      success: true,
      message: 'Signed in successfully',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            message: 'Invalid email or password',
          }
        default:
          return {
            success: false,
            message: 'An error occurred during sign in',
          }
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}

// Sign in with OAuth provider (Google or GitHub)
export async function signInWithOAuth(provider: 'google' | 'github') {
  await signIn(provider, {
    redirectTo: '/dashboard',
  })
}

// Sign out
export async function signOutUser() {
  try {
    await signOut({
      redirectTo: '/',
    })
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    throw new Error('Failed to sign out')
  }
}

// Verify email with token
export async function verifyEmail(email: string, token: string) {
  try {
    // Verify token
    const isValid = await verifyToken(email, token)

    if (!isValid) {
      return {
        success: false,
        message:
          'Invalid or expired verification link. Please request a new one.',
      }
    }

    // Update user's emailVerified field
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    })

    return {
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    }
  } catch (error) {
    console.error('Error verifying email:', error)
    return {
      success: false,
      message: 'An error occurred while verifying your email.',
    }
  }
}

// Resend verification email
export async function resendVerification(email: string) {
  try {
    await resendVerificationEmail(email)

    return {
      success: true,
      message:
        'Verification email sent! Please check your inbox.',
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to resend verification email.',
    }
  }
}

// Request password reset (forgot password)
export async function requestPasswordReset(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Extract and validate email
    const data = {
      email: formData.get('email') as string,
    }

    const validatedData = emailSchema.parse(data)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return {
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      }
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return {
        success: false,
        message:
          'This account uses OAuth sign-in. Please sign in with Google or GitHub.',
      }
    }

    // Create reset token
    const token = await createPasswordResetToken(validatedData.email)

    // Send reset email
    await sendPasswordResetEmail(validatedData.email, user.name, token)

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}

// Reset password with token
export async function resetPassword(prevState: unknown, formData: FormData) {
  try {
    // Extract and validate form data
    const data = {
      email: formData.get('email') as string,
      token: formData.get('token') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const email = data.email
    const token = data.token

    // Validate password
    const validatedData = resetPasswordSchema.parse({
      password: data.password,
      confirmPassword: data.confirmPassword,
    })

    // Verify token
    const isValid = await verifyPasswordResetToken(email, token)

    if (!isValid) {
      return {
        success: false,
        message:
          'Invalid or expired reset link. Please request a new password reset.',
      }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    // Hash new password
    const hashedPassword = hashSync(validatedData.password, 10)

    // Update user's password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    })

    return {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}
