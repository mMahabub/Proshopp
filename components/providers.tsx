'use client'

import { SessionProvider } from 'next-auth/react'
import CartMergeHandler from './cart-merge-handler'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartMergeHandler />
      {children}
    </SessionProvider>
  )
}
