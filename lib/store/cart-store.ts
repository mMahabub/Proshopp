import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartState } from '@/types/cart'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)

          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }

          // Add new item
          return {
            items: [...state.items, { ...item, quantity }],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return {
              items: state.items.filter((i) => i.id !== productId),
            }
          }

          return {
            items: state.items.map((i) =>
              i.id === productId ? { ...i, quantity } : i
            ),
          }
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      // Get cart items in format needed for cart merge
      getCartItemsForSync: () => {
        const { items } = get()
        return items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        }))
      },

      // Load cart items from database after merge (replaces local cart)
      loadCartFromDB: (dbCartItems) => {
        const cartItems = dbCartItems.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.price), // Convert Decimal to number
          quantity: item.quantity,
          image: item.product.images?.[0] || '/placeholder.png',
          stock: item.product.stock,
        }))
        set({ items: cartItems })
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
