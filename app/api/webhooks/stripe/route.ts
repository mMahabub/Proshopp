import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/utils/stripe'
import { prisma } from '@/db/prisma'
import { sendOrderConfirmationEmail } from '@/lib/utils/email'

/**
 * Stripe webhook handler
 * Handles payment events from Stripe (payment_intent.succeeded, payment_intent.failed)
 */
export async function POST(req: NextRequest) {
  try {
    // Get the raw body as text for signature verification
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error) {
      console.error(
        '[Webhook] Signature verification failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log(`[Webhook] Processing event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment intent
 * - Updates order status to 'processing'
 * - Marks order as paid
 * - Sends order confirmation email
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`)

  try {
    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: {
        paymentResult: {
          path: ['paymentIntentId'],
          equals: paymentIntent.id,
        },
      },
      include: {
        items: true,
        user: true,
      },
    })

    if (!order) {
      console.error(`[Webhook] Order not found for payment intent: ${paymentIntent.id}`)
      return
    }

    console.log(`[Webhook] Found order: ${order.orderNumber}`)

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'processing',
        isPaid: true,
        paidAt: new Date(),
      },
    })

    console.log(`[Webhook] Order ${order.orderNumber} marked as paid and processing`)

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.user.name,
        customerEmail: order.user.email,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price.toString()),
        })),
        subtotal: parseFloat(order.subtotal.toString()),
        tax: parseFloat(order.tax.toString()),
        total: parseFloat(order.totalPrice.toString()),
        shippingAddress: order.shippingAddress as {
          fullName: string
          streetAddress: string
          city: string
          state: string
          postalCode: string
          country: string
        },
      })

      console.log(`[Webhook] Confirmation email sent for order: ${order.orderNumber}`)
    } catch (emailError) {
      // Log email error but don't fail the webhook
      console.error(
        `[Webhook] Failed to send confirmation email for order ${order.orderNumber}:`,
        emailError
      )
    }
  } catch (error) {
    console.error('[Webhook] Error handling payment success:', error)
    throw error
  }
}

/**
 * Handle failed payment intent
 * - Logs the failure
 * - Could optionally notify customer or update order status
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Payment failed: ${paymentIntent.id}`)

  try {
    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: {
        paymentResult: {
          path: ['paymentIntentId'],
          equals: paymentIntent.id,
        },
      },
    })

    if (!order) {
      console.error(
        `[Webhook] Order not found for failed payment intent: ${paymentIntent.id}`
      )
      return
    }

    console.log(`[Webhook] Payment failed for order: ${order.orderNumber}`)

    // Get failure reason
    const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error'
    console.log(`[Webhook] Failure reason: ${failureMessage}`)

    // Optionally update order with failure information
    // await prisma.order.update({
    //   where: { id: order.id },
    //   data: {
    //     paymentResult: {
    //       paymentIntentId: paymentIntent.id,
    //       status: 'failed',
    //       error: failureMessage,
    //     },
    //   },
    // })

    // TODO: Optionally send email notification to customer about payment failure
  } catch (error) {
    console.error('[Webhook] Error handling payment failure:', error)
    throw error
  }
}
