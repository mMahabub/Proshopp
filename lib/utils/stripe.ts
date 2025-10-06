/**
 * Server-side Stripe instance
 * This file should only be imported in server-side code (Server Actions, Route Handlers)
 * For client-side Stripe, use stripe-client.ts
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

/**
 * Stripe instance configured for server-side operations
 * - Uses secret key for full API access
 * - Configured for API version 2025-09-30.clover
 * - TypeScript enabled for type safety
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

/**
 * Format amount for Stripe (convert dollars to cents)
 * @param amount - Amount in dollars
 * @returns Amount in cents (smallest currency unit)
 * @example formatAmountForStripe(10.99) // 1099
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format amount from Stripe (convert cents to dollars)
 * @param amount - Amount in cents
 * @returns Amount in dollars
 * @example formatAmountFromStripe(1099) // 10.99
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}
