/**
 * Client-side Stripe configuration
 * This file should only be imported in client components
 * For server-side Stripe, use stripe.ts
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables'
  )
}

/**
 * Singleton promise for Stripe instance
 * Ensures only one instance is created and reused across the application
 */
let stripePromise: Promise<Stripe | null>

/**
 * Get or create the Stripe instance for client-side operations
 * - Uses publishable key (safe to expose to client)
 * - Lazy loaded on first call
 * - Singleton pattern ensures single instance
 * @returns Promise resolving to Stripe instance or null
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
  }
  return stripePromise
}
