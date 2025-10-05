'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { addToCart as addToCartAction } from '@/lib/actions/cart.actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
    stock: number
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCartStore()
  const { data: session } = useSession()

  const maxQuantity = Math.min(product.stock, 10)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async () => {
    try {
      setIsLoading(true)

      // Add to local cart store (optimistic update)
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          stock: product.stock,
        },
        quantity
      )

      toast.success('Added to cart')

      // If user is authenticated, sync to database
      if (session?.user) {
        const result = await addToCartAction(product.id, quantity)

        if (!result.success) {
          toast.error(result.message)
        }
      }
    } catch {
      toast.error('Failed to add item to cart')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center justify-between">
          <label htmlFor="quantity" className="text-sm text-gray-600">
            Quantity
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
      >
        {isLoading ? (
          <span>Adding...</span>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  )
}
