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
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
