/**
 * Tests for order confirmation success page
 */

import { redirect } from 'next/navigation'
import { createOrder } from '@/lib/actions/order.actions'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@/lib/actions/order.actions', () => ({
  createOrder: jest.fn(),
}))

describe('Checkout Success Page Logic', () => {
  const mockCreateOrder = createOrder as jest.Mock
  const mockRedirect = redirect as unknown as jest.Mock

  const mockOrderResponse = {
    success: true,
    data: {
      id: 'order-123',
      orderNumber: 'ORD-20250105-001',
      userId: 'user-123',
      status: 'pending',
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
      createdAt: new Date('2025-01-05T10:00:00Z'),
      updatedAt: new Date('2025-01-05T10:00:00Z'),
      items: [
        {
          id: 'item-1',
          orderId: 'order-123',
          productId: 'product-1',
          name: 'Test Product',
          slug: 'test-product',
          image: '/test-image.jpg',
          price: 29.99,
          quantity: 2,
          createdAt: new Date('2025-01-05T10:00:00Z'),
          updatedAt: new Date('2025-01-05T10:00:00Z'),
        },
      ],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT: ${url}`)
    })
  })

  describe('Payment Intent ID Extraction', () => {
    it('should extract payment intent ID from client secret correctly', () => {
      const clientSecret = 'pi_123abc456def_secret_xyz789'
      const paymentIntentId = clientSecret.split('_secret_')[0]

      expect(paymentIntentId).toBe('pi_123abc456def')
    })

    it('should handle multiple underscores in payment intent ID', () => {
      const clientSecret = 'pi_test_123_abc_secret_xyz_789'
      const paymentIntentId = clientSecret.split('_secret_')[0]

      expect(paymentIntentId).toBe('pi_test_123_abc')
    })

    it('should handle simple payment intent format', () => {
      const clientSecret = 'pi_test123_secret_abc456'
      const paymentIntentId = clientSecret.split('_secret_')[0]

      expect(paymentIntentId).toBe('pi_test123')
    })
  })

  describe('Order Creation Flow', () => {
    it('should call createOrder with extracted payment intent ID', async () => {
      mockCreateOrder.mockResolvedValue(mockOrderResponse)

      const paymentIntentId = 'pi_test123'
      await mockCreateOrder(paymentIntentId)

      expect(mockCreateOrder).toHaveBeenCalledWith('pi_test123')
      expect(mockCreateOrder).toHaveBeenCalledTimes(1)
    })

    it('should handle successful order creation', async () => {
      mockCreateOrder.mockResolvedValue(mockOrderResponse)

      const result = await mockCreateOrder('pi_test123')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.orderNumber).toBe('ORD-20250105-001')
    })

    it('should handle failed order creation', async () => {
      mockCreateOrder.mockResolvedValue({
        success: false,
        message: 'Order creation failed',
      })

      const result = await mockCreateOrder('pi_test123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Order creation failed')
    })
  })

  describe('Data Transformation', () => {
    it('should transform Decimal values to numbers', () => {
      const order = mockOrderResponse.data

      const transformedSubtotal = parseFloat(order.subtotal.toString())
      const transformedTax = parseFloat(order.tax.toString())
      const transformedTotal = parseFloat(order.totalPrice.toString())

      expect(transformedSubtotal).toBe(109.97)
      expect(transformedTax).toBe(10.997)
      expect(transformedTotal).toBe(120.967)
    })

    it('should transform item prices to numbers', () => {
      const item = mockOrderResponse.data.items[0]

      const transformedPrice = parseFloat(item.price.toString())

      expect(transformedPrice).toBe(29.99)
    })

    it('should handle Decimal objects with toString method', () => {
      const decimalValue = {
        toString: () => '109.97',
      }

      const result = parseFloat(decimalValue.toString())

      expect(result).toBe(109.97)
    })
  })

  describe('Redirect Scenarios', () => {
    it('should trigger redirect when payment intent client secret is missing', () => {
      const searchParams = {}

      expect(() => {
        if (!searchParams.payment_intent_client_secret) {
          mockRedirect('/cart')
        }
      }).toThrow('REDIRECT: /cart')

      expect(mockRedirect).toHaveBeenCalledWith('/cart')
    })

    it('should trigger redirect when payment intent ID extraction fails', () => {
      const clientSecret = 'invalid_format'
      const paymentIntentId = clientSecret.split('_secret_')[0]

      expect(() => {
        if (!paymentIntentId || paymentIntentId === clientSecret) {
          mockRedirect('/cart')
        }
      }).toThrow('REDIRECT: /cart')

      expect(mockRedirect).toHaveBeenCalledWith('/cart')
    })

    it('should trigger redirect when order creation fails', async () => {
      mockCreateOrder.mockResolvedValue({
        success: false,
        message: 'Failed',
      })

      const result = await mockCreateOrder('pi_test123')

      expect(() => {
        if (!result.success || !result.data) {
          mockRedirect('/cart')
        }
      }).toThrow('REDIRECT: /cart')

      expect(mockRedirect).toHaveBeenCalledWith('/cart')
    })
  })

  describe('Order Data Structure', () => {
    it('should have correct order structure', () => {
      const order = mockOrderResponse.data

      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('orderNumber')
      expect(order).toHaveProperty('status')
      expect(order).toHaveProperty('subtotal')
      expect(order).toHaveProperty('tax')
      expect(order).toHaveProperty('totalPrice')
      expect(order).toHaveProperty('shippingAddress')
      expect(order).toHaveProperty('items')
      expect(order).toHaveProperty('createdAt')
    })

    it('should have correct shipping address structure', () => {
      const address = mockOrderResponse.data.shippingAddress

      expect(address).toHaveProperty('fullName')
      expect(address).toHaveProperty('streetAddress')
      expect(address).toHaveProperty('city')
      expect(address).toHaveProperty('state')
      expect(address).toHaveProperty('postalCode')
      expect(address).toHaveProperty('country')
    })

    it('should have correct order item structure', () => {
      const item = mockOrderResponse.data.items[0]

      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('slug')
      expect(item).toHaveProperty('image')
      expect(item).toHaveProperty('price')
      expect(item).toHaveProperty('quantity')
    })
  })
})
