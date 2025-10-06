/**
 * Tests for Stripe webhook handler
 */

import { POST } from '@/app/api/webhooks/stripe/route'
import { stripe } from '@/lib/utils/stripe'
import { prisma } from '@/db/prisma'
import { sendOrderConfirmationEmail } from '@/lib/utils/email'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/utils/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}))

jest.mock('@/db/prisma', () => ({
  prisma: {
    order: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utils/email', () => ({
  sendOrderConfirmationEmail: jest.fn(),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// Import headers mock
import { headers } from 'next/headers'

describe('Stripe Webhook Handler', () => {
  const mockConstructEvent = stripe.webhooks.constructEvent as jest.Mock
  const mockFindFirst = prisma.order.findFirst as jest.Mock
  const mockUpdate = prisma.order.update as jest.Mock
  const mockSendEmail = sendOrderConfirmationEmail as jest.Mock
  const mockHeaders = headers as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const createMockRequest = (body: string): NextRequest => {
    return {
      text: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest
  }

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-20250104-001',
    userId: 'user-123',
    subtotal: 109.97,
    tax: 10.997,
    totalPrice: 120.967,
    shippingAddress: {
      fullName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    status: 'pending',
    isPaid: false,
    paidAt: null,
    items: [
      {
        id: 'item-1',
        name: 'Test Product',
        quantity: 2,
        price: 29.99,
      },
    ],
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
  }

  describe('Signature Verification', () => {
    it('should reject request without stripe-signature header', async () => {
      mockHeaders.mockResolvedValue(new Map())

      const req = createMockRequest('{}')
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing stripe-signature header')
    })

    it('should reject request with invalid signature', async () => {
      const headerMap = new Map([['stripe-signature', 'invalid-signature']])
      mockHeaders.mockResolvedValue(headerMap)

      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const req = createMockRequest('{}')
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Webhook signature verification failed')
    })

    it('should verify signature with webhook secret', async () => {
      const headerMap = new Map([['stripe-signature', 'valid-signature']])
      mockHeaders.mockResolvedValue(headerMap)

      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockResolvedValue(null) // No order found

      const body = JSON.stringify({ test: 'data' })
      const req = createMockRequest(body)
      await POST(req)

      expect(mockConstructEvent).toHaveBeenCalledWith(
        body,
        'valid-signature',
        process.env.STRIPE_WEBHOOK_SECRET
      )
    })
  })

  describe('payment_intent.succeeded Event', () => {
    beforeEach(() => {
      const headerMap = new Map([['stripe-signature', 'valid-signature']])
      mockHeaders.mockResolvedValue(headerMap)
    })

    it('should update order status to processing', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 12097,
          },
        },
      })

      mockFindFirst.mockResolvedValue(mockOrder)
      mockUpdate.mockResolvedValue({ ...mockOrder, status: 'processing', isPaid: true })
      mockSendEmail.mockResolvedValue(undefined)

      const req = createMockRequest('{}')
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          status: 'processing',
          isPaid: true,
          paidAt: expect.any(Date),
        },
      })
    })

    it('should mark order as paid with timestamp', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockResolvedValue(mockOrder)
      mockUpdate.mockResolvedValue({ ...mockOrder, isPaid: true })
      mockSendEmail.mockResolvedValue(undefined)

      const req = createMockRequest('{}')
      await POST(req)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isPaid: true,
            paidAt: expect.any(Date),
          }),
        })
      )
    })

    it('should send confirmation email with order details', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockResolvedValue(mockOrder)
      mockUpdate.mockResolvedValue({ ...mockOrder, status: 'processing' })
      mockSendEmail.mockResolvedValue(undefined)

      const req = createMockRequest('{}')
      await POST(req)

      expect(mockSendEmail).toHaveBeenCalledWith({
        orderNumber: 'ORD-20250104-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [
          {
            name: 'Test Product',
            quantity: 2,
            price: 29.99,
          },
        ],
        subtotal: 109.97,
        tax: 10.997,
        total: 120.967,
        shippingAddress: {
          fullName: 'John Doe',
          streetAddress: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
        },
      })
    })

    it('should handle case when order not found', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockResolvedValue(null)

      const req = createMockRequest('{}')
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockSendEmail).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Order not found')
      )
    })

    it('should continue processing even if email fails', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockResolvedValue(mockOrder)
      mockUpdate.mockResolvedValue({ ...mockOrder, status: 'processing' })
      mockSendEmail.mockRejectedValue(new Error('Email service unavailable'))

      const req = createMockRequest('{}')
      const response = await POST(req)

      // Should still return 200 even if email fails
      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send confirmation email'),
        expect.any(Error)
      )
    })
  })

  describe('payment_intent.payment_failed Event', () => {
    beforeEach(() => {
      const headerMap = new Map([['stripe-signature', 'valid-signature']])
      mockHeaders.mockResolvedValue(headerMap)
    })

    it('should log payment failure with order number', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            last_payment_error: {
              message: 'Card declined',
            },
          },
        },
      })

      mockFindFirst.mockResolvedValue(mockOrder)

      const req = createMockRequest('{}')
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Payment failed for order: ORD-20250104-001')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Failure reason: Card declined')
      )
    })

    it('should handle failed payment when order not found', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockResolvedValue(null)

      const req = createMockRequest('{}')
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Order not found for failed payment intent')
      )
    })

    it('should log unknown error when no failure message', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            last_payment_error: null,
          },
        },
      })

      mockFindFirst.mockResolvedValue(mockOrder)

      const req = createMockRequest('{}')
      await POST(req)

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Failure reason: Unknown error')
      )
    })
  })

  describe('Unhandled Events', () => {
    beforeEach(() => {
      const headerMap = new Map([['stripe-signature', 'valid-signature']])
      mockHeaders.mockResolvedValue(headerMap)
    })

    it('should log unhandled event types', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.created',
        data: {
          object: {},
        },
      })

      const req = createMockRequest('{}')
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Unhandled event type: customer.created')
      )
    })

    it('should return success for unhandled events', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_succeeded',
        data: {
          object: {},
        },
      })

      const req = createMockRequest('{}')
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      const headerMap = new Map([['stripe-signature', 'valid-signature']])
      mockHeaders.mockResolvedValue(headerMap)
    })

    it('should handle database errors gracefully', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockRejectedValue(new Error('Database connection failed'))

      const req = createMockRequest('{}')
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook processing failed')
      expect(data.message).toBe('Database connection failed')
    })

    it('should return received: true on successful processing', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      })

      mockFindFirst.mockResolvedValue(mockOrder)
      mockUpdate.mockResolvedValue({ ...mockOrder, status: 'processing' })
      mockSendEmail.mockResolvedValue(undefined)

      const req = createMockRequest('{}')
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })
})
