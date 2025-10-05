export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string
  stock: number
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}
