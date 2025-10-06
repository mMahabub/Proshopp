/**
 * Tests for order server actions
 */

import {
  createOrder,
  getOrder,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
} from '@/lib/actions/order.actions'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { getCart } from '@/lib/actions/cart.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'

// Mock dependencies
jest.mock('@/auth')
jest.mock('@/lib/actions/cart.actions')
jest.mock('@/lib/actions/checkout.actions')
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock Prisma
jest.mock('@/db/prisma', () => ({
  prisma: {
    order: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

describe('Order Actions', () => {
  const mockAuth = auth as jest.Mock
  const mockGetCart = getCart as jest.Mock
  const mockGetShippingAddress = getShippingAddress as jest.Mock
  const mockPrismaTransaction = prisma.$transaction as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
    },
  }

  const mockAdminSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'admin',
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
          slug: 'test-product',
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
          slug: 'another-product',
          images: ['/test2.jpg'],
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

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-20250104-001',
    userId: 'user-123',
    subtotal: 109.97,
    tax: 10.997,
    shippingCost: 0,
    totalPrice: 120.967,
    shippingAddress: mockShippingAddress,
    paymentResult: { paymentIntentId: 'pi_test_123' },
    status: 'pending',
    isPaid: false,
    paidAt: null,
    isDelivered: false,
    deliveredAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'order-item-1',
        orderId: 'order-123',
        productId: 'product-1',
        name: 'Test Product',
        slug: 'test-product',
        image: '/test.jpg',
        price: 29.99,
        quantity: 2,
      },
      {
        id: 'order-item-2',
        orderId: 'order-123',
        productId: 'product-2',
        name: 'Another Product',
        slug: 'another-product',
        image: '/test2.jpg',
        price: 49.99,
        quantity: 1,
      },
    ],
  }

  describe('createOrder', () => {
    beforeEach(() => {
      // Mock findFirst to return null (no existing orders today)
      ;(prisma.order.findFirst as jest.Mock).mockResolvedValue(null)
    })

    it('should create order successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)

      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          product: {
            update: jest.fn(),
          },
          cartItem: {
            deleteMany: jest.fn(),
          },
        })
      })

      const result = await createOrder('pi_test_123')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.message).toBe('Order created successfully')
    })

    it('should generate order number in correct format', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)

      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          product: {
            update: jest.fn(),
          },
          cartItem: {
            deleteMany: jest.fn(),
          },
        })
      })

      const result = await createOrder('pi_test_123')

      expect(result.success).toBe(true)
      expect(result.data?.orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/)
    })

    it('should increment order number for same day orders', async () => {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      ;(prisma.order.findFirst as jest.Mock).mockResolvedValue({
        orderNumber: `ORD-${today}-001`,
      })

      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)

      let createdOrderNumber = ''
      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          order: {
            create: jest.fn().mockImplementation((data: any) => {
              createdOrderNumber = data.data.orderNumber
              return Promise.resolve({ ...mockOrder, orderNumber: createdOrderNumber })
            }),
          },
          product: {
            update: jest.fn(),
          },
          cartItem: {
            deleteMany: jest.fn(),
          },
        })
      })

      await createOrder('pi_test_123')

      expect(createdOrderNumber).toBe(`ORD-${today}-002`)
    })

    it('should reduce product stock', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)

      const mockProductUpdate = jest.fn()
      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          product: {
            update: mockProductUpdate,
          },
          cartItem: {
            deleteMany: jest.fn(),
          },
        })
      })

      await createOrder('pi_test_123')

      expect(mockProductUpdate).toHaveBeenCalledTimes(2)
      expect(mockProductUpdate).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { stock: { decrement: 2 } },
      })
      expect(mockProductUpdate).toHaveBeenCalledWith({
        where: { id: 'product-2' },
        data: { stock: { decrement: 1 } },
      })
    })

    it('should clear cart after order creation', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)

      const mockCartItemDelete = jest.fn()
      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          product: {
            update: jest.fn(),
          },
          cartItem: {
            deleteMany: mockCartItemDelete,
          },
        })
      })

      await createOrder('pi_test_123')

      expect(mockCartItemDelete).toHaveBeenCalledWith({
        where: { cartId: 'cart-123' },
      })
    })

    it('should calculate totals correctly', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: true,
        data: mockCart,
      } as any)
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress as any)

      let orderData: any
      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          order: {
            create: jest.fn().mockImplementation((data: any) => {
              orderData = data.data
              return Promise.resolve(mockOrder)
            }),
          },
          product: {
            update: jest.fn(),
          },
          cartItem: {
            deleteMany: jest.fn(),
          },
        })
      })

      await createOrder('pi_test_123')

      // subtotal: (29.99 * 2) + (49.99 * 1) = 109.97
      // tax: 109.97 * 0.1 = 10.997
      // totalPrice: 109.97 + 10.997 = 120.967
      expect(orderData.subtotal).toBeCloseTo(109.97, 2)
      expect(orderData.tax).toBeCloseTo(10.997, 2)
      expect(orderData.totalPrice).toBeCloseTo(120.967, 2)
    })

    it('should fail if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await createOrder('pi_test_123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in to create an order')
    })

    it('should fail if cart is empty', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      mockGetCart.mockResolvedValue({
        success: false,
        message: 'Cart is empty',
      } as any)

      const result = await createOrder('pi_test_123')

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

      const result = await createOrder('pi_test_123')

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

      const result = await createOrder('pi_test_123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Shipping address is required')
    })
  })

  describe('getOrder', () => {
    it('should fetch order successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      const result = await getOrder('order-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockOrder)
    })

    it('should fail if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getOrder('order-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in to view orders')
    })

    it('should fail if order not found', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getOrder('order-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Order not found')
    })

    it('should fail if user does not own the order', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        userId: 'other-user-123',
      })

      const result = await getOrder('order-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('You do not have permission to view this order')
    })

    it('should allow admin to view any order', async () => {
      mockAuth.mockResolvedValue(mockAdminSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        userId: 'other-user-123',
      })

      const result = await getOrder('order-123')

      expect(result.success).toBe(true)
    })
  })

  describe('getUserOrders', () => {
    it('should fetch user orders successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder])

      const result = await getUserOrders()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockOrder])
    })

    it('should fail if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getUserOrders()

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in to view orders')
    })

    it('should return empty array if user has no orders', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findMany as jest.Mock).mockResolvedValue([])

      const result = await getUserOrders()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should order results by createdAt desc', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder])

      await getUserOrders()

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: 'desc',
          },
        })
      )
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      mockAuth.mockResolvedValue(mockAdminSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
      ;(prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'processing',
      })

      const result = await updateOrderStatus({
        orderId: 'order-123',
        status: 'processing',
      })

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('processing')
    })

    it('should fail if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateOrderStatus({
        orderId: 'order-123',
        status: 'processing',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in')
    })

    it('should fail if user is not admin', async () => {
      mockAuth.mockResolvedValue(mockSession as any)

      const result = await updateOrderStatus({
        orderId: 'order-123',
        status: 'processing',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Only administrators can update order status')
    })

    it('should fail if order not found', async () => {
      mockAuth.mockResolvedValue(mockAdminSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await updateOrderStatus({
        orderId: 'order-123',
        status: 'processing',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Order not found')
    })
  })

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      const mockProductUpdate = jest.fn()
      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          product: {
            update: mockProductUpdate,
          },
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: 'cancelled',
            }),
          },
        })
      })

      const result = await cancelOrder({ orderId: 'order-123' })

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('cancelled')
    })

    it('should restore product stock when cancelling', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      const mockProductUpdate = jest.fn()
      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          product: {
            update: mockProductUpdate,
          },
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: 'cancelled',
            }),
          },
        })
      })

      await cancelOrder({ orderId: 'order-123' })

      expect(mockProductUpdate).toHaveBeenCalledTimes(2)
      expect(mockProductUpdate).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { stock: { increment: 2 } },
      })
      expect(mockProductUpdate).toHaveBeenCalledWith({
        where: { id: 'product-2' },
        data: { stock: { increment: 1 } },
      })
    })

    it('should fail if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await cancelOrder({ orderId: 'order-123' })

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in')
    })

    it('should fail if order not found', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await cancelOrder({ orderId: 'order-123' })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Order not found')
    })

    it('should fail if user does not own the order', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        userId: 'other-user-123',
      })

      const result = await cancelOrder({ orderId: 'order-123' })

      expect(result.success).toBe(false)
      expect(result.message).toBe('You do not have permission to cancel this order')
    })

    it('should allow admin to cancel any order', async () => {
      mockAuth.mockResolvedValue(mockAdminSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        userId: 'other-user-123',
      })

      mockPrismaTransaction.mockImplementation(async (callback: any) => {
        return await callback({
          product: {
            update: jest.fn(),
          },
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: 'cancelled',
            }),
          },
        })
      })

      const result = await cancelOrder({ orderId: 'order-123' })

      expect(result.success).toBe(true)
    })

    it('should fail if order status is not pending', async () => {
      mockAuth.mockResolvedValue(mockSession as any)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'processing',
      })

      const result = await cancelOrder({ orderId: 'order-123' })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Only pending orders can be cancelled')
    })
  })
})
