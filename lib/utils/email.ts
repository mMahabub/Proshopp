import { Resend } from 'resend'
import { prisma } from '@/db/prisma'
import { APP_NAME } from '@/lib/constants'
import crypto from 'crypto'

/**
 * Lazy initialization of Resend instance
 * This prevents build errors when RESEND_API_KEY is not set
 * The error will only be thrown at runtime when email functions are actually used
 */
let resendInstance: Resend | null = null

/**
 * Get or create the Resend instance for email operations
 * - Uses API key from environment variables
 * - Lazy initialization prevents build-time errors
 * - Error thrown only at runtime if API key is missing
 */
function getResendInstance(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        'RESEND_API_KEY is not defined in environment variables. ' +
        'Email functionality requires a valid Resend API key. ' +
        'Get your API key from https://resend.com/api-keys'
      )
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

/**
 * Resend instance configured for email operations
 * Uses lazy initialization to prevent build-time errors
 */
const resend = new Proxy({} as Resend, {
  get: (target, prop) => {
    const instance = getResendInstance()
    const value = instance[prop as keyof Resend]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

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

// ========================================
// Password Reset Functions
// ========================================

/**
 * Create a password reset token in the database
 * @param email - User's email address
 * @returns The generated token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: `reset:${email}`,
    },
  })

  // Generate new token
  const token = generateVerificationToken()

  // Token expires in 1 hour (for password reset, shorter than verification)
  const expires = new Date(Date.now() + 60 * 60 * 1000)

  // Save to database with 'reset:' prefix to differentiate from email verification tokens
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires,
    },
  })

  return token
}

/**
 * Verify a password reset token
 * @param email - User's email address
 * @param token - Reset token
 * @returns Boolean indicating if token is valid
 */
export async function verifyPasswordResetToken(
  email: string,
  token: string
): Promise<boolean> {
  const resetToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: `reset:${email}`,
        token,
      },
    },
  })

  if (!resetToken) {
    return false
  }

  // Check if token is expired
  if (resetToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `reset:${email}`,
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
        identifier: `reset:${email}`,
        token,
      },
    },
  })

  return true
}

/**
 * Send password reset email
 * @param email - User's email address
 * @param name - User's name
 * @param token - Reset token
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            </div>

            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                We received a request to reset your password for your ${APP_NAME} account. Click the button below to create a new password.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Reset Password
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${resetUrl}
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 13px; color: #999; margin: 0;">
                  This password reset link will expire in 1 hour for security reasons.
                </p>
                <p style="font-size: 13px; color: #999; margin: 10px 0 0 0;">
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
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
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

// ========================================
// Order Confirmation Functions
// ========================================

interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  total: number
  shippingAddress: {
    fullName: string
    streetAddress: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

/**
 * Send order confirmation email
 * @param data - Order confirmation data
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const orderUrl = `${baseUrl}/orders`

  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
            </div>

            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.customerName},</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                We've received your order and it's being processed. Here are your order details:
              </p>

              <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #666; margin: 0;">Order Number</p>
                <p style="font-size: 20px; font-weight: 600; margin: 5px 0 0 0; color: #667eea;">${data.orderNumber}</p>
              </div>

              <h2 style="font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Items</h2>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="border-bottom: 1px solid #e0e0e0;">
                    <th style="text-align: left; padding: 10px; font-size: 14px; color: #666;">Item</th>
                    <th style="text-align: center; padding: 10px; font-size: 14px; color: #666;">Qty</th>
                    <th style="text-align: right; padding: 10px; font-size: 14px; color: #666;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.map(item => `
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                      <td style="padding: 12px 10px; font-size: 14px;">${item.name}</td>
                      <td style="padding: 12px 10px; font-size: 14px; text-align: center;">${item.quantity}</td>
                      <td style="padding: 12px 10px; font-size: 14px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 14px;">Subtotal</span>
                  <span style="font-size: 14px;">$${data.subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 14px;">Tax</span>
                  <span style="font-size: 14px;">$${data.tax.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px;">
                  <span style="font-size: 16px; font-weight: 600;">Total</span>
                  <span style="font-size: 16px; font-weight: 600; color: #667eea;">$${data.total.toFixed(2)}</span>
                </div>
              </div>

              <h2 style="font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Shipping Address</h2>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                  ${data.shippingAddress.fullName}<br>
                  ${data.shippingAddress.streetAddress}<br>
                  ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
                  ${data.shippingAddress.country}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${orderUrl}"
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                  View Order Details
                </a>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 13px; color: #999; margin: 0;">
                  We'll send you a shipping confirmation email as soon as your order ships.
                </p>
                <p style="font-size: 13px; color: #999; margin: 10px 0 0 0;">
                  If you have any questions, please don't hesitate to contact us.
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
    console.error('Error sending order confirmation email:', error)
    throw new Error('Failed to send order confirmation email')
  }
}
