'use client'

import { useCartMerge } from '@/lib/hooks/use-cart-merge'

/**
 * Client component that handles cart merging on user signin
 * Should be placed in the root layout to run on all pages
 */
export default function CartMergeHandler() {
  useCartMerge()
  return null // This component doesn't render anything
}
