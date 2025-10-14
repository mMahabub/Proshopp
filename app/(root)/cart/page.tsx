'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import CartItem from '@/components/shared/cart/cart-item'
import CartSummary from '@/components/shared/cart/cart-summary'
import { ShoppingCart } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { items, getItemCount } = useCartStore()

  const itemCount = getItemCount()
  const isEmpty = items.length === 0

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          {items.length} {items.length === 1 ? 'product' : 'products'} • {itemCount} total {itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-0">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
