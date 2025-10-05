'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartIconProps {
  className?: string
}

export default function CartIcon({ className }: CartIconProps = {}) {
  const { getItemCount } = useCartStore()
  const [itemCount, setItemCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only showing cart count after mount
  useEffect(() => {
    setIsMounted(true)
    setItemCount(getItemCount())
  }, [getItemCount])

  // Subscribe to cart changes after mount
  useEffect(() => {
    if (!isMounted) return

    const unsubscribe = useCartStore.subscribe((state) => {
      setItemCount(state.getItemCount())
    })

    return () => unsubscribe()
  }, [isMounted])

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "flex items-center gap-2 hover:bg-gray-200 transition-all duration-200 rounded-lg px-3 py-2 relative",
        className
      )}
    >
      <Link href="/cart">
        <ShoppingCart className="w-5 h-5" />
        <span>Cart</span>
        {isMounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
