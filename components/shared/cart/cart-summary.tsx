'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { clearCart } from '@/lib/actions/cart.actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'

const TAX_RATE = 0.08 // 8% tax

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function CartSummary() {
  const router = useRouter()
  const { getTotal, clearCart: clearLocalCart } = useCartStore()
  const { data: session } = useSession()
  const [isClearing, setIsClearing] = useState(false)

  const subtotal = getTotal()
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to remove all items from your cart?')) {
      return
    }

    try {
      setIsClearing(true)

      // Clear local cart (localStorage)
      clearLocalCart()

      // Clear database cart if user is authenticated
      if (session?.user) {
        const result = await clearCart()
        if (result.success) {
          toast.success('Cart cleared successfully')
        } else {
          toast.error(result.message || 'Failed to clear cart')
        }
      } else {
        toast.success('Cart cleared successfully')
      }

      // Refresh the page to update UI
      router.refresh()
    } catch (error) {
      toast.error('Failed to clear cart')
      console.error('Clear cart error:', error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Order Summary</h2>

      {/* Subtotal */}
      <div className="flex justify-between text-gray-700">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      {/* Tax */}
      <div className="flex justify-between text-gray-700">
        <span>Tax (8%)</span>
        <span>{formatCurrency(tax)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300"></div>

      {/* Total */}
      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {/* Proceed to Checkout */}
        <Button
          onClick={() => router.push('/checkout')}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
        >
          Proceed to Checkout
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Continue Shopping */}
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="w-full"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>
      </div>

      {/* Shipping Note */}
      <p className="text-xs text-gray-500 text-center pt-4">
        Shipping calculated at checkout
      </p>

      {/* Clear Cart Button */}
      <div className="border-t border-gray-300 pt-4 mt-4">
        <Button
          onClick={handleClearCart}
          disabled={isClearing}
          variant="ghost"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isClearing ? 'Clearing...' : 'Clear Cart'}
        </Button>
      </div>
    </div>
  )
}
