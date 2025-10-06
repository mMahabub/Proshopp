'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  syncCartSchema,
} from '@/lib/validations/cart'
import { revalidatePath } from 'next/cache'

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
 * Get the current user's cart with all items and product details
 */
export async function getCart() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to view your cart',
      }
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    }

    return {
      success: true,
      data: cart,
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    console.error('Error fetching cart:', error)
    return {
      success: false,
      message: 'Failed to fetch cart',
    }
  }
}

/**
 * Sync local cart (from localStorage) to database when user signs in
 */
export async function syncCart(items: { productId: string; quantity: number }[]) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to sync your cart',
      }
    }

    // Validate input
    const validatedData = syncCartSchema.parse({ items })

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    // Process each item from local cart
    for (const item of validatedData.items) {
      // Check if product exists and has sufficient stock
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        continue // Skip if product doesn't exist
      }

      if (product.stock < item.quantity) {
        continue // Skip if insufficient stock
      }

      // Check if item already exists in DB cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId,
          },
        },
      })

      if (existingItem) {
        // Update quantity (add to existing)
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: Math.min(
              existingItem.quantity + item.quantity,
              product.stock
            ),
            price: product.price,
          },
        })
      } else {
        // Create new cart item
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        })
      }
    }

    revalidatePath('/cart')

    return {
      success: true,
      message: 'Cart synced successfully',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to sync cart',
    }
  }
}

/**
 * Add a product to the cart with stock validation
 */
export async function addToCart(productId: string, quantity: number) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to add items to cart',
      }
    }

    // Validate input
    const validatedData = addToCartSchema.parse({ productId, quantity })

    // Check if product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
      }
    }

    if (product.stock < validatedData.quantity) {
      return {
        success: false,
        message: `Only ${product.stock} item(s) available in stock`,
      }
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: validatedData.productId,
        },
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + validatedData.quantity

      if (newQuantity > product.stock) {
        return {
          success: false,
          message: `Cannot add more items. Only ${product.stock} available in stock`,
        }
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: product.price,
        },
      })
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          price: product.price,
        },
      })
    }

    revalidatePath('/cart')

    return {
      success: true,
      message: 'Item added to cart successfully',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to add item to cart',
    }
  }
}

/**
 * Update the quantity of a cart item
 */
export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to update cart items',
      }
    }

    // Validate input
    const validatedData = updateCartItemSchema.parse({ itemId, quantity })

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: validatedData.itemId },
      include: {
        cart: true,
        product: true,
      },
    })

    if (!cartItem) {
      return {
        success: false,
        message: 'Cart item not found',
      }
    }

    if (cartItem.cart.userId !== session.user.id) {
      return {
        success: false,
        message: 'Unauthorized',
      }
    }

    // Check stock availability
    if (validatedData.quantity > cartItem.product.stock) {
      return {
        success: false,
        message: `Only ${cartItem.product.stock} item(s) available in stock`,
      }
    }

    // Update cart item quantity
    await prisma.cartItem.update({
      where: { id: validatedData.itemId },
      data: {
        quantity: validatedData.quantity,
        price: cartItem.product.price,
      },
    })

    revalidatePath('/cart')

    return {
      success: true,
      message: 'Cart item updated successfully',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to update cart item',
    }
  }
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(itemId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to remove items from cart',
      }
    }

    // Validate input
    const validatedData = removeFromCartSchema.parse({ itemId })

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: validatedData.itemId },
      include: {
        cart: true,
      },
    })

    if (!cartItem) {
      return {
        success: false,
        message: 'Cart item not found',
      }
    }

    if (cartItem.cart.userId !== session.user.id) {
      return {
        success: false,
        message: 'Unauthorized',
      }
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: validatedData.itemId },
    })

    revalidatePath('/cart')

    return {
      success: true,
      message: 'Item removed from cart successfully',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to remove item from cart',
    }
  }
}

/**
 * Clear all items from the user's cart
 */
export async function clearCart() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to clear your cart',
      }
    }

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return {
        success: true,
        message: 'Cart is already empty',
      }
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    revalidatePath('/cart')

    return {
      success: true,
      message: 'Cart cleared successfully',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to clear cart',
    }
  }
}

/**
 * Merge guest cart (from localStorage) with user's database cart on login
 * This combines items from both carts, summing quantities for duplicates
 */
export async function mergeGuestCart(
  guestItems: { productId: string; quantity: number }[]
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to merge your cart',
      }
    }

    // Validate input
    const validatedData = syncCartSchema.parse({ items: guestItems })

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    // Process each item from guest cart
    for (const item of validatedData.items) {
      // Check if product exists and has sufficient stock
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        continue // Skip if product doesn't exist
      }

      if (product.stock < item.quantity) {
        continue // Skip if insufficient stock
      }

      // Check if item already exists in DB cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId,
          },
        },
      })

      if (existingItem) {
        // Update quantity (add to existing, cap at stock)
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: Math.min(
              existingItem.quantity + item.quantity,
              product.stock
            ),
            price: product.price,
          },
        })
      } else {
        // Create new cart item
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        })
      }
    }

    // Fetch and return the merged cart with all items
    const mergedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    revalidatePath('/cart')

    return {
      success: true,
      message: 'Cart merged successfully',
      data: mergedCart,
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'Failed to merge cart',
    }
  }
}
