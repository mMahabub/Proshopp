import { z } from 'zod'

/**
 * Validation schema for creating an order
 */
export const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  cartId: z.string().min(1, 'Cart ID is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        name: z.string().min(1, 'Product name is required'),
        slug: z.string().min(1, 'Product slug is required'),
        image: z.string().min(1, 'Product image is required'),
        price: z.number().positive('Price must be positive'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
      })
    )
    .min(1, 'Order must have at least one item'),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().nonnegative('Tax must be non-negative'),
  totalPrice: z.number().positive('Total price must be positive'),
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    streetAddress: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

/**
 * Validation schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

/**
 * Validation schema for cancelling an order
 */
export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
})

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
