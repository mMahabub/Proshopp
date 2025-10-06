'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  type CancelOrderInput,
} from '@/lib/validations/order'
import { getCart } from '@/lib/actions/cart.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'
import { revalidatePath } from 'next/cache'

/**
 * Generate unique order number in format: ORD-YYYYMMDD-XXX
 */
async function generateOrderNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

  // Find the last order created today
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `ORD-${dateStr}`,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
  })

  let sequence = 1
  if (lastOrder) {
    // Extract sequence number from last order
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2])
    sequence = lastSequence + 1
  }

  // Format sequence with leading zeros (001, 002, etc.)
  const sequenceStr = sequence.toString().padStart(3, '0')

  return `ORD-${dateStr}-${sequenceStr}`
}

/**
 * Create a new order from cart items
 */
export async function createOrder(paymentIntentId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to create an order',
      }
    }

    // Get cart with items
    const cartResult = await getCart()
    if (!cartResult.success || !cartResult.data) {
      return {
        success: false,
        message: 'Your cart is empty',
      }
    }

    const cart = cartResult.data
    if (!cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
      }
    }

    // Get shipping address
    const shippingAddress = await getShippingAddress()
    if (!shippingAddress) {
      return {
        success: false,
        message: 'Shipping address is required',
      }
    }

    // Calculate order totals
    let subtotal = 0
    for (const item of cart.items) {
      const itemPrice = parseFloat(item.price.toString())
      subtotal += itemPrice * item.quantity
    }

    const taxRate = 0.1
    const tax = subtotal * taxRate
    const total = subtotal + tax

    // Prepare order data
    const orderData: CreateOrderInput = {
      userId: session.user.id,
      cartId: cart.id,
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0] || '/placeholder.png',
        price: parseFloat(item.price.toString()),
        quantity: item.quantity,
      })),
      subtotal,
      tax,
      totalPrice: total,
      shippingAddress,
      paymentIntentId,
    }

    // Validate order data
    const validatedData = createOrderSchema.parse(orderData)

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: validatedData.userId,
          subtotal: validatedData.subtotal,
          tax: validatedData.tax,
          shippingCost: 0,
          totalPrice: validatedData.totalPrice,
          shippingAddress: validatedData.shippingAddress,
          paymentResult: {
            paymentIntentId: validatedData.paymentIntentId,
          },
          status: 'pending',
          items: {
            create: validatedData.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              slug: item.slug,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // Reduce product stock for each item
      for (const item of validatedData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: {
          cartId: validatedData.cartId,
        },
      })

      return newOrder
    })

    revalidatePath('/cart')
    revalidatePath('/orders')

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create order',
    }
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to view orders',
      }
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Check if user owns the order or is admin
    if (order.userId !== session.user.id && session.user.role !== 'admin') {
      return {
        success: false,
        message: 'You do not have permission to view this order',
      }
    }

    return {
      success: true,
      data: order,
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return {
      success: false,
      message: 'Failed to fetch order',
    }
  }
}

/**
 * Get all orders for the authenticated user
 */
export async function getUserOrders() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in to view orders',
      }
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: orders,
    }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return {
      success: false,
      message: 'Failed to fetch orders',
    }
  }
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in',
      }
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return {
        success: false,
        message: 'Only administrators can update order status',
      }
    }

    // Validate input
    const validatedData = updateOrderStatusSchema.parse(input)

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: validatedData.orderId,
      },
    })

    if (!existingOrder) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: {
        id: validatedData.orderId,
      },
      data: {
        status: validatedData.status,
      },
      include: {
        items: true,
      },
    })

    revalidatePath('/orders')
    revalidatePath(`/orders/${validatedData.orderId}`)

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update order status',
    }
  }
}

/**
 * Cancel an order (User can only cancel pending orders)
 */
export async function cancelOrder(input: CancelOrderInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in',
      }
    }

    // Validate input
    const validatedData = cancelOrderSchema.parse(input)

    // Get order
    const order = await prisma.order.findUnique({
      where: {
        id: validatedData.orderId,
      },
      include: {
        items: true,
      },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Check ownership
    if (order.userId !== session.user.id && session.user.role !== 'admin') {
      return {
        success: false,
        message: 'You do not have permission to cancel this order',
      }
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return {
        success: false,
        message: 'Only pending orders can be cancelled',
      }
    }

    // Update order status to cancelled in transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }

      // Update order status
      return await tx.order.update({
        where: {
          id: validatedData.orderId,
        },
        data: {
          status: 'cancelled',
        },
        include: {
          items: true,
        },
      })
    })

    revalidatePath('/orders')
    revalidatePath(`/orders/${validatedData.orderId}`)

    return {
      success: true,
      message: 'Order cancelled successfully',
      data: cancelledOrder,
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel order',
    }
  }
}
