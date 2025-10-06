'use server'

import { auth } from '@/auth'
import { stripe, formatAmountForStripe } from '@/lib/utils/stripe'
import { getCart } from '@/lib/actions/cart.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'

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

/**
 * Create a Stripe payment intent for checkout
 * Calculates total from cart items and creates payment intent
 */
export async function createPaymentIntent() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to proceed with payment',
      }
    }

    // Get user's cart
    const cartResult = await getCart()

    if (!cartResult.success || !cartResult.data) {
      return {
        success: false,
        message: 'Your cart is empty',
      }
    }

    const cart = cartResult.data

    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
      }
    }

    // Check if shipping address exists
    const shippingAddress = await getShippingAddress()
    if (!shippingAddress) {
      return {
        success: false,
        message: 'Please provide a shipping address first',
      }
    }

    // Calculate total from cart items
    let subtotal = 0
    for (const item of cart.items) {
      const itemPrice = parseFloat(item.price.toString())
      subtotal += itemPrice * item.quantity
    }

    // Calculate tax (10% for demo purposes)
    const taxRate = 0.1
    const tax = subtotal * taxRate

    // Calculate total
    const total = subtotal + tax

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(total),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: session.user.id,
        cartId: cart.id,
      },
    })

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: total,
        subtotal,
        tax,
      },
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    console.error('Error creating payment intent:', error)

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to create payment intent',
    }
  }
}

/**
 * Get payment details for order summary
 */
export async function getPaymentDetails() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in',
      }
    }

    // Get user's cart
    const cartResult = await getCart()

    if (!cartResult.success || !cartResult.data) {
      return {
        success: false,
        message: 'Your cart is empty',
      }
    }

    const cart = cartResult.data

    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
      }
    }

    // Calculate subtotal from cart items
    let subtotal = 0
    for (const item of cart.items) {
      const itemPrice = parseFloat(item.price.toString())
      subtotal += itemPrice * item.quantity
    }

    // Calculate tax (10% for demo purposes)
    const taxRate = 0.1
    const tax = subtotal * taxRate

    // Calculate total
    const total = subtotal + tax

    return {
      success: true,
      data: {
        items: cart.items,
        subtotal,
        tax,
        total,
      },
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    console.error('Error getting payment details:', error)

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to get payment details',
    }
  }
}
