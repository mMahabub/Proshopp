import { Resend } from 'resend'
import { prisma } from '@/db/prisma'
import { APP_NAME } from '@/lib/constants'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Generate a secure random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Create a verification token in the database
 * @param email - User's email address
 * @returns The generated token
 */
export async function createVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  // Generate new token
  const token = generateVerificationToken()

  // Token expires in 24 hours
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // Save to database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Verify a token from the database
 * @param email - User's email address
 * @param token - Verification token
 * @returns Boolean indicating if token is valid
 */
export async function verifyToken(
  email: string,
  token: string
): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  if (!verificationToken) {
    return false
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    })
    return false
  }

  // Token is valid - delete it (one-time use)
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  return true
}

/**
 * Send verification email
 * @param email - User's email address
 * @param name - User's name
 * @param token - Verification token
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: email,
      subject: `Verify your ${APP_NAME} account`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${APP_NAME}!</h1>
            </div>

            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for signing up! Please verify your email address to complete your registration and start shopping.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}"
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${verificationUrl}
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 13px; color: #999; margin: 0;">
                  This verification link will expire in 24 hours.
                </p>
                <p style="font-size: 13px; color: #999; margin: 10px 0 0 0;">
                  If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
                </p>
              </div>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

/**
 * Resend verification email
 * @param email - User's email address
 */
export async function resendVerificationEmail(email: string): Promise<void> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.emailVerified) {
    throw new Error('Email already verified')
  }

  // Create new token
  const token = await createVerificationToken(email)

  // Send email
  await sendVerificationEmail(email, user.name, token)
}
