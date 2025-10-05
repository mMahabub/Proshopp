import { z } from 'zod'

// Add to cart validation schema
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>

// Update cart item quantity validation schema
export const updateCartItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
})

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>

// Remove from cart validation schema
export const removeFromCartSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
})

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>

// Sync cart validation schema (for syncing local cart to DB)
export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z
        .number()
        .int('Quantity must be an integer')
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Quantity cannot exceed 100'),
    })
  ),
})

export type SyncCartInput = z.infer<typeof syncCartSchema>
