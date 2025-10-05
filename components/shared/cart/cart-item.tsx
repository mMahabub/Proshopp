'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { removeFromCart, updateCartItem } from '@/lib/actions/cart.actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types/cart'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { removeItem, updateQuantity } = useCartStore()
  const { data: session } = useSession()

  const handleQuantityChange = async (newQuantity: number) => {
    try {
      setIsUpdating(true)

      // Update local store immediately (optimistic update)
      updateQuantity(item.id, newQuantity)

      // If user is authenticated, sync to database
      if (session?.user) {
        const result = await updateCartItem(item.id, newQuantity)

        if (!result.success) {
          toast.error(result.message)
          // Revert optimistic update on error
          updateQuantity(item.id, item.quantity)
        }
      }
    } catch {
      toast.error('Failed to update quantity')
      // Revert optimistic update on error
      updateQuantity(item.id, item.quantity)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    try {
      // Remove from local store immediately (optimistic update)
      removeItem(item.id)
      toast.success('Item removed from cart')

      // If user is authenticated, sync to database
      if (session?.user) {
        const result = await removeFromCart(item.id)

        if (!result.success) {
          toast.error(result.message)
        }
      }
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const subtotal = item.price * item.quantity

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Product Image */}
      <Link href={`/product/${item.slug}`} className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Name and Price */}
        <div className="flex-1">
          <Link href={`/product/${item.slug}`} className="hover:text-blue-600">
            <h3 className="font-medium text-lg">{item.name}</h3>
          </Link>
          <p className="text-gray-600 mt-1">${item.price.toFixed(2)}</p>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600">
              Qty:
            </label>
            <select
              id={`quantity-${item.id}`}
              value={item.quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              disabled={isUpdating}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: Math.min(item.stock, 10) }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Subtotal */}
          <div className="text-right min-w-[80px]">
            <p className="font-semibold">${subtotal.toFixed(2)}</p>
          </div>

          {/* Remove Button */}
          <Button
            onClick={handleRemove}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
