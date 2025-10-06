export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string
  stock: number
}

// Decimal type from Prisma
import type { Decimal } from '@prisma/client/runtime/library'

export interface DBCartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  price: Decimal
  product: {
    id: string
    name: string
    slug: string
    price: Decimal
    stock: number
    images: string[]
  }
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  getCartItemsForSync: () => { productId: string; quantity: number }[]
  loadCartFromDB: (dbCartItems: DBCartItem[]) => void
}
