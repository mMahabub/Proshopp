'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/lib/store/cart-store'
import { mergeGuestCart } from '@/lib/actions/cart.actions'
import type { DBCartItem } from '@/types/cart'

/**
 * Hook to automatically merge guest cart with user's database cart on signin
 * This ensures that items added while not logged in are preserved after login
 */
export function useCartMerge() {
  const { data: session, status } = useSession()
  const { getCartItemsForSync, loadCartFromDB } = useCartStore()
  const hasAttemptedMerge = useRef(false)

  useEffect(() => {
    // Only run when:
    // 1. User is authenticated
    // 2. Session is loaded (not loading)
    // 3. Haven't attempted merge yet
    if (status === 'authenticated' && session?.user && !hasAttemptedMerge.current) {
      hasAttemptedMerge.current = true

      // Get guest cart items from localStorage (via Zustand)
      const guestItems = getCartItemsForSync()

      // Only merge if there are guest cart items
      if (guestItems.length > 0) {
        mergeGuestCart(guestItems)
          .then((result) => {
            if (result.success && result.data) {
              // Load merged cart from DB into Zustand store
              // This replaces localStorage cart with DB cart
              // Type assertion needed due to Prisma Decimal types and schema differences
              loadCartFromDB(result.data.items as unknown as DBCartItem[])
            }
          })
          .catch((error) => {
            console.error('Failed to merge cart:', error)
          })
      }
    }

    // Reset merge flag when user signs out
    if (status === 'unauthenticated') {
      hasAttemptedMerge.current = false
    }
  }, [status, session, getCartItemsForSync, loadCartFromDB])
}
