// @ts-nocheck - Mocking Prisma types is complex, tests work correctly at runtime
import {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '@/lib/actions/cart.actions'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'

// Mock dependencies
jest.mock('@/auth')
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
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  },
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>

// Type the mocked prisma methods properly
const mockPrismaCart = {
  findUnique: prisma.cart.findUnique as jest.Mock,
  create: prisma.cart.create as jest.Mock,
}

const mockPrismaCartItem = {
  findUnique: prisma.cartItem.findUnique as jest.Mock,
  create: prisma.cartItem.create as jest.Mock,
  update: prisma.cartItem.update as jest.Mock,
  delete: prisma.cartItem.delete as jest.Mock,
  deleteMany: prisma.cartItem.deleteMany as jest.Mock,
}

const mockPrismaProduct = {
  findUnique: prisma.product.findUnique as jest.Mock,
}

describe('Cart Actions', () => {
  // Use valid UUIDs for testing
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  }

  const mockProduct = {
    id: '223e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    slug: 'test-product',
    price: 100.0,
    stock: 10,
    category: 'Test',
    images: ['/test.jpg'],
    brand: 'Test Brand',
    description: 'Test Description',
    rating: 4.5,
    numReviews: 10,
    isFeatured: false,
    banner: null,
    createdAt: new Date(),
  }

  const mockCart = {
    id: '323e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCartItem = {
    id: '423e4567-e89b-12d3-a456-426614174000',
    cartId: '323e4567-e89b-12d3-a456-426614174000',
    productId: '223e4567-e89b-12d3-a456-426614174000',
    quantity: 2,
    price: 100.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCart', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getCart()

      expect(result).toEqual({
        success: false,
        message: 'You must be signed in to view your cart',
      })
    })

    it('should return existing cart with items', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)

      const cartWithItems = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            product: mockProduct,
          },
        ],
      }

      mockPrismaCart.findUnique.mockResolvedValue(cartWithItems)

      const result = await getCart()

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: cartWithItems.id,
        userId: cartWithItems.userId,
        items: expect.arrayContaining([
          expect.objectContaining({
            id: mockCartItem.id,
            cartId: mockCartItem.cartId,
            productId: mockCartItem.productId,
            quantity: mockCartItem.quantity,
            price: mockCartItem.price,
          })
        ])
      })
      expect(mockPrismaCart.findUnique).toHaveBeenCalledWith({
        where: { userId: '123e4567-e89b-12d3-a456-426614174000' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    })

    it('should create cart if it does not exist', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)

      const emptyCart = {
        ...mockCart,
        items: [],
      }

      mockPrismaCart.findUnique.mockResolvedValue(null)
      mockPrismaCart.create.mockResolvedValue(emptyCart)

      const result = await getCart()

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: emptyCart.id,
        userId: emptyCart.userId,
        items: [],
      })
      expect(mockPrismaCart.create).toHaveBeenCalledWith({
        data: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    })
  })

  describe('syncCart', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await syncCart([])

      expect(result).toEqual({
        success: false,
        message: 'You must be signed in to sync your cart',
      })
    })

    it('should sync local cart items to database', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)

      mockPrismaCart.findUnique.mockResolvedValue(mockCart)
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct)
      mockPrismaCartItem.findUnique.mockResolvedValue(null)
      mockPrismaCartItem.create.mockResolvedValue(mockCartItem)

      const items = [
        { productId: '223e4567-e89b-12d3-a456-426614174000', quantity: 2 },
      ]

      const result = await syncCart(items)

      expect(result).toEqual({
        success: true,
        message: 'Cart synced successfully',
      })
      expect(mockPrismaCartItem.create).toHaveBeenCalled()
    })

    it('should update existing cart item when syncing', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)

      mockPrismaCart.findUnique.mockResolvedValue(mockCart)
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct)
      mockPrismaCartItem.findUnique.mockResolvedValue(mockCartItem)
      mockPrismaCartItem.update.mockResolvedValue({
        ...mockCartItem,
        quantity: 4,
      })

      const items = [
        { productId: '223e4567-e89b-12d3-a456-426614174000', quantity: 2 },
      ]

      const result = await syncCart(items)

      expect(result).toEqual({
        success: true,
        message: 'Cart synced successfully',
      })
      expect(mockPrismaCartItem.update).toHaveBeenCalled()
    })

    it('should skip items with insufficient stock when syncing', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)

      mockPrismaCart.findUnique.mockResolvedValue(mockCart)
      mockPrismaProduct.findUnique.mockResolvedValue({
        ...mockProduct,
        stock: 1,
      })

      const items = [
        { productId: '223e4567-e89b-12d3-a456-426614174000', quantity: 5 }, // More than stock
      ]

      const result = await syncCart(items)

      expect(result).toEqual({
        success: true,
        message: 'Cart synced successfully',
      })
      expect(mockPrismaCartItem.create).not.toHaveBeenCalled()
    })
  })

  describe('addToCart', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await addToCart('product-123', 1)

      expect(result).toEqual({
        success: false,
        message: 'You must be signed in to add items to cart',
      })
    })

    it('should return error if product not found', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaProduct.findUnique.mockResolvedValue(null)

      const result = await addToCart('999e4567-e89b-12d3-a456-426614174000', 1)

      expect(result).toEqual({
        success: false,
        message: 'Product not found',
      })
    })

    it('should return error if insufficient stock', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaProduct.findUnique.mockResolvedValue({
        ...mockProduct,
        stock: 2,
      })

      const result = await addToCart('223e4567-e89b-12d3-a456-426614174000', 5)

      expect(result).toEqual({
        success: false,
        message: 'Only 2 item(s) available in stock',
      })
    })

    it('should add new item to cart', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct)
      mockPrismaCart.findUnique.mockResolvedValue(mockCart)
      mockPrismaCartItem.findUnique.mockResolvedValue(null)
      mockPrismaCartItem.create.mockResolvedValue(mockCartItem)

      const result = await addToCart('223e4567-e89b-12d3-a456-426614174000', 2)

      expect(result).toEqual({
        success: true,
        message: 'Item added to cart successfully',
      })
      expect(mockPrismaCartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: '323e4567-e89b-12d3-a456-426614174000',
          productId: '223e4567-e89b-12d3-a456-426614174000',
          quantity: 2,
          price: 100.0,
        },
      })
    })

    it('should update quantity if item exists in cart', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct)
      mockPrismaCart.findUnique.mockResolvedValue(mockCart)
      mockPrismaCartItem.findUnique.mockResolvedValue(mockCartItem)
      mockPrismaCartItem.update.mockResolvedValue({
        ...mockCartItem,
        quantity: 4,
      })

      const result = await addToCart('223e4567-e89b-12d3-a456-426614174000', 2)

      expect(result).toEqual({
        success: true,
        message: 'Item added to cart successfully',
      })
      expect(mockPrismaCartItem.update).toHaveBeenCalledWith({
        where: { id: '423e4567-e89b-12d3-a456-426614174000' },
        data: {
          quantity: 4,
          price: 100.0,
        },
      })
    })

    it('should return error if adding exceeds stock', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaProduct.findUnique.mockResolvedValue({
        ...mockProduct,
        stock: 5,
      })
      mockPrismaCart.findUnique.mockResolvedValue(mockCart)
      mockPrismaCartItem.findUnique.mockResolvedValue({
        ...mockCartItem,
        quantity: 4,
      })

      const result = await addToCart('223e4567-e89b-12d3-a456-426614174000', 3)

      expect(result).toEqual({
        success: false,
        message: 'Cannot add more items. Only 5 available in stock',
      })
    })
  })

  describe('updateCartItem', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateCartItem('423e4567-e89b-12d3-a456-426614174000', 5)

      expect(result).toEqual({
        success: false,
        message: 'You must be signed in to update cart items',
      })
    })

    it('should return error if cart item not found', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCartItem.findUnique.mockResolvedValue(null)

      const result = await updateCartItem('999e4567-e89b-12d3-a456-426614174000', 5)

      expect(result).toEqual({
        success: false,
        message: 'Cart item not found',
      })
    })

    it('should return error if user does not own the cart', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCartItem.findUnique.mockResolvedValue({
        ...mockCartItem,
        cart: { ...mockCart, userId: 'other-user' },
        product: mockProduct,
      })

      const result = await updateCartItem('423e4567-e89b-12d3-a456-426614174000', 5)

      expect(result).toEqual({
        success: false,
        message: 'Unauthorized',
      })
    })

    it('should return error if quantity exceeds stock', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCartItem.findUnique.mockResolvedValue({
        ...mockCartItem,
        cart: mockCart,
        product: { ...mockProduct, stock: 5 },
      })

      const result = await updateCartItem('423e4567-e89b-12d3-a456-426614174000', 10)

      expect(result).toEqual({
        success: false,
        message: 'Only 5 item(s) available in stock',
      })
    })

    it('should update cart item quantity', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCartItem.findUnique.mockResolvedValue({
        ...mockCartItem,
        cart: mockCart,
        product: mockProduct,
      })
      mockPrismaCartItem.update.mockResolvedValue({
        ...mockCartItem,
        quantity: 5,
      })

      const result = await updateCartItem('423e4567-e89b-12d3-a456-426614174000', 5)

      expect(result).toEqual({
        success: true,
        message: 'Cart item updated successfully',
      })
      expect(mockPrismaCartItem.update).toHaveBeenCalledWith({
        where: { id: '423e4567-e89b-12d3-a456-426614174000' },
        data: {
          quantity: 5,
          price: 100.0,
        },
      })
    })
  })

  describe('removeFromCart', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await removeFromCart('423e4567-e89b-12d3-a456-426614174000')

      expect(result).toEqual({
        success: false,
        message: 'You must be signed in to remove items from cart',
      })
    })

    it('should return error if cart item not found', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCartItem.findUnique.mockResolvedValue(null)

      const result = await removeFromCart('999e4567-e89b-12d3-a456-426614174000')

      expect(result).toEqual({
        success: false,
        message: 'Cart item not found',
      })
    })

    it('should return error if user does not own the cart', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCartItem.findUnique.mockResolvedValue({
        ...mockCartItem,
        cart: { ...mockCart, userId: 'other-user' },
      })

      const result = await removeFromCart('423e4567-e89b-12d3-a456-426614174000')

      expect(result).toEqual({
        success: false,
        message: 'Unauthorized',
      })
    })

    it('should remove item from cart', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCartItem.findUnique.mockResolvedValue({
        ...mockCartItem,
        cart: mockCart,
      })
      mockPrismaCartItem.delete.mockResolvedValue(mockCartItem)

      const result = await removeFromCart('423e4567-e89b-12d3-a456-426614174000')

      expect(result).toEqual({
        success: true,
        message: 'Item removed from cart successfully',
      })
      expect(mockPrismaCartItem.delete).toHaveBeenCalledWith({
        where: { id: '423e4567-e89b-12d3-a456-426614174000' },
      })
    })
  })

  describe('clearCart', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await clearCart()

      expect(result).toEqual({
        success: false,
        message: 'You must be signed in to clear your cart',
      })
    })

    it('should return success if cart does not exist', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCart.findUnique.mockResolvedValue(null)

      const result = await clearCart()

      expect(result).toEqual({
        success: true,
        message: 'Cart is already empty',
      })
    })

    it('should clear all items from cart', async () => {
      mockAuth.mockResolvedValue({ user: mockUser } as any)
      mockPrismaCart.findUnique.mockResolvedValue(mockCart)
      mockPrismaCartItem.deleteMany.mockResolvedValue({ count: 3 })

      const result = await clearCart()

      expect(result).toEqual({
        success: true,
        message: 'Cart cleared successfully',
      })
      expect(mockPrismaCartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: '323e4567-e89b-12d3-a456-426614174000' },
      })
    })
  })
})
