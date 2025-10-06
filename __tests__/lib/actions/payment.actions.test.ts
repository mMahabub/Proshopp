/**
 * Tests for payment server actions
 */

import {
  createPaymentIntent,
  getPaymentDetails,
} from '@/lib/actions/payment.actions'
import { auth } from '@/auth'
import { stripe } from '@/lib/utils/stripe'
import { getCart } from '@/lib/actions/cart.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'

// Mock dependencies
jest.mock('@/auth')
jest.mock('@/lib/utils/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
    },
  },
  formatAmountForStripe: jest.fn((amount: number) => Math.round(amount * 100)),
}))
jest.mock('@/lib/actions/cart.actions')
jest.mock('@/lib/actions/checkout.actions')

describe('Payment Actions', () => {
  const mockAuth = auth as jest.Mock
  const mockGetCart = getCart as jest.Mock
  const mockGetShippingAddress = getShippingAddress as jest.Mock
  const mockCreatePaymentIntent = stripe.paymentIntents
    .create as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPaymentIntent', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
    }

    const mockCart = {
      id: 'cart-123',
      userId: 'user-123',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          price: '29.99',
          product: {
            id: 'product-1',
            name: 'Test Product',
            images: ['/test.jpg'],
          },
        },
      ],
    }

    const mockShippingAddress = {
      fullName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    }

    it('should create payment intent successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)
      mockCreatePaymentIntent.mockResolvedValue({
        client_secret: 'pi_test_secret_123',
      } as any)

      const result = await createPaymentIntent()

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('clientSecret')
      expect(result.data?.clientSecret).toBe('pi_test_secret_123')
      expect(result.data).toHaveProperty('amount')
      expect(result.data).toHaveProperty('subtotal')
      expect(result.data).toHaveProperty('tax')
    })

    it('should calculate total correctly with tax', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)
      mockCreatePaymentIntent.mockResolvedValue({
        client_secret: 'pi_test_secret_123',
      } as any)

      const result = await createPaymentIntent()

      expect(result.success).toBe(true)
      // subtotal: 29.99 * 2 = 59.98
      // tax: 59.98 * 0.1 = 5.998
      // total: 59.98 + 5.998 = 65.978
      expect(result.data?.subtotal).toBeCloseTo(59.98, 2)
      expect(result.data?.tax).toBeCloseTo(5.998, 2)
      expect(result.data?.amount).toBeCloseTo(65.978, 2)
    })

    it('should fail if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await createPaymentIntent()

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in to proceed with payment')
    })

    it('should fail if cart is empty', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: false,
        message: 'Cart is empty',
      } as any)

      const result = await createPaymentIntent()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Your cart is empty')
    })

    it('should fail if cart has no items', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: {
          id: 'cart-123',
          items: [],
        },
      } as any)

      const result = await createPaymentIntent()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Your cart is empty')
    })

    it('should fail if shipping address is missing', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(null)

      const result = await createPaymentIntent()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Please provide a shipping address first')
    })

    it('should pass correct metadata to Stripe', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)
      mockCreatePaymentIntent.mockResolvedValue({
        client_secret: 'pi_test_secret_123',
      } as any)

      await createPaymentIntent()

      expect(mockCreatePaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            userId: 'user-123',
            cartId: 'cart-123',
          },
        })
      )
    })

    it('should use USD currency', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)
      mockCreatePaymentIntent.mockResolvedValue({
        client_secret: 'pi_test_secret_123',
      } as any)

      await createPaymentIntent()

      expect(mockCreatePaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'usd',
        })
      )
    })

    it('should enable automatic payment methods', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)
      mockCreatePaymentIntent.mockResolvedValue({
        client_secret: 'pi_test_secret_123',
      } as any)

      await createPaymentIntent()

      expect(mockCreatePaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          automatic_payment_methods: {
            enabled: true,
          },
        })
      )
    })
  })

  describe('getPaymentDetails', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
    }

    const mockCart = {
      id: 'cart-123',
      userId: 'user-123',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          price: '29.99',
          product: {
            id: 'product-1',
            name: 'Test Product',
            images: ['/test.jpg'],
          },
        },
        {
          id: 'item-2',
          productId: 'product-2',
          quantity: 1,
          price: '49.99',
          product: {
            id: 'product-2',
            name: 'Another Product',
            images: ['/test2.jpg'],
          },
        },
      ],
    }

    it('should return payment details successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)

      const result = await getPaymentDetails()

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('items')
      expect(result.data).toHaveProperty('subtotal')
      expect(result.data).toHaveProperty('tax')
      expect(result.data).toHaveProperty('total')
    })

    it('should calculate subtotal correctly', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)

      const result = await getPaymentDetails()

      expect(result.success).toBe(true)
      // subtotal: (29.99 * 2) + (49.99 * 1) = 59.98 + 49.99 = 109.97
      expect(result.data?.subtotal).toBeCloseTo(109.97, 2)
    })

    it('should calculate tax at 10%', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)

      const result = await getPaymentDetails()

      expect(result.success).toBe(true)
      // tax: 109.97 * 0.1 = 10.997
      expect(result.data?.tax).toBeCloseTo(10.997, 2)
    })

    it('should calculate total correctly', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)

      const result = await getPaymentDetails()

      expect(result.success).toBe(true)
      // total: 109.97 + 10.997 = 120.967
      expect(result.data?.total).toBeCloseTo(120.967, 2)
    })

    it('should return cart items', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)

      const result = await getPaymentDetails()

      expect(result.success).toBe(true)
      expect(result.data?.items).toHaveLength(2)
      expect(result.data?.items[0]).toHaveProperty('product')
    })

    it('should fail if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getPaymentDetails()

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in')
    })

    it('should fail if cart is empty', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: false,
        message: 'Cart is empty',
      } as any)

      const result = await getPaymentDetails()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Your cart is empty')
    })

    it('should fail if cart has no items', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: {
          id: 'cart-123',
          items: [],
        },
      } as any)

      const result = await getPaymentDetails()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Your cart is empty')
    })
  })
})
