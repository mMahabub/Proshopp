// Mock dependencies BEFORE any imports
jest.mock('@/auth')
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))
jest.mock('@/db/prisma', () => ({
  prisma: {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  },
}))

import { mergeGuestCart } from '@/lib/actions/cart.actions'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'

const mockAuth = auth as jest.Mock

describe('mergeGuestCart', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
  const mockCartId = '660e8400-e29b-41d4-a716-446655440000'
  const mockProduct1Id = '770e8400-e29b-41d4-a716-446655440001'
  const mockProduct2Id = '770e8400-e29b-41d4-a716-446655440002'
  const mockProduct999Id = '770e8400-e29b-41d4-a716-446655440999'

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock authenticated user
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  })

  describe('Authentication', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await mergeGuestCart([])

      expect(result.success).toBe(false)
      expect(result.message).toContain('signed in')
    })
  })

  describe('Empty Guest Cart', () => {
    it('should handle empty guest cart gracefully', async () => {
      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
        })
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [],
        })

      const result = await mergeGuestCart([])

      if (!result.success) {
        console.log('Error:', result.message)
      }
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })
  })

  describe('Cart Creation', () => {
    it('should create cart if user does not have one', async () => {
      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [],
        })
      ;(prisma.cart.create as jest.Mock).mockResolvedValue({
        id: mockCartId,
        userId: mockUserId,
      })

      const result = await mergeGuestCart([])

      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: mockUserId },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Item Merging', () => {
    it('should merge guest cart items with empty DB cart', async () => {
      const guestItems = [
        { productId: mockProduct1Id, quantity: 2 },
        { productId: mockProduct2Id, quantity: 1 },
      ]

      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
        })
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [],
        })

      ;(prisma.product.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockProduct1Id,
          name: 'Product 1',
          price: 10.0,
          stock: 5,
        })
        .mockResolvedValueOnce({
          id: mockProduct2Id,
          name: 'Product 2',
          price: 20.0,
          stock: 10,
        })

      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValue({})

      const result = await mergeGuestCart(guestItems)

      expect(prisma.cartItem.create).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
    })

    it('should sum quantities for duplicate items', async () => {
      const guestItems = [{ productId: mockProduct1Id, quantity: 2 }]

      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
        })
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [],
        })

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: mockProduct1Id,
        name: 'Product 1',
        price: 10.0,
        stock: 10,
      })

      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-item-1',
        cartId: mockCartId,
        productId: mockProduct1Id,
        quantity: 3,
        price: 10.0,
      })

      ;(prisma.cartItem.update as jest.Mock).mockResolvedValue({})

      const result = await mergeGuestCart(guestItems)

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'cart-item-1' },
        data: {
          quantity: 5, // 3 (DB) + 2 (guest) = 5
          price: 10.0,
        },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Stock Validation', () => {
    it('should skip items with insufficient stock', async () => {
      const guestItems = [{ productId: mockProduct1Id, quantity: 10 }]

      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
        })
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [],
        })

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: mockProduct1Id,
        name: 'Product 1',
        price: 10.0,
        stock: 5, // Only 5 in stock, but guest wants 10
      })

      const result = await mergeGuestCart(guestItems)

      expect(prisma.cartItem.create).not.toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('should cap merged quantity at available stock', async () => {
      const guestItems = [{ productId: mockProduct1Id, quantity: 5 }]

      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
        })
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [],
        })

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: mockProduct1Id,
        name: 'Product 1',
        price: 10.0,
        stock: 6, // Only 6 in stock
      })

      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-item-1',
        cartId: mockCartId,
        productId: mockProduct1Id,
        quantity: 3,
        price: 10.0,
      })

      ;(prisma.cartItem.update as jest.Mock).mockResolvedValue({})

      const result = await mergeGuestCart(guestItems)

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'cart-item-1' },
        data: {
          quantity: 6, // Capped at stock (not 3 + 5 = 8)
          price: 10.0,
        },
      })
      expect(result.success).toBe(true)
    })

    it('should skip non-existent products', async () => {
      const guestItems = [{ productId: mockProduct999Id, quantity: 1 }]

      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
        })
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [],
        })

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await mergeGuestCart(guestItems)

      expect(prisma.cartItem.create).not.toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('Return Value', () => {
    it('should return merged cart with all items', async () => {
      ;(prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
        })
        .mockResolvedValueOnce({
          id: mockCartId,
          userId: mockUserId,
          items: [
            {
              id: 'item-1',
              productId: mockProduct1Id,
              quantity: 5,
              price: 10.0,
              product: {
                id: mockProduct1Id,
                name: 'Product 1',
                slug: mockProduct1Id,
                price: 10.0,
                stock: 10,
                image: '/product-1.jpg',
              },
            },
          ],
        })

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: mockProduct1Id,
        price: 10.0,
        stock: 10,
      })

      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValue({})

      const result = await mergeGuestCart([{ productId: mockProduct1Id, quantity: 2 }])

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.items).toBeDefined()
    })
  })
})
