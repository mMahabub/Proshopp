/**
 * Cart Debug Utilities
 * Helper functions to debug and clear cart data
 */

/**
 * Clear all cart data from localStorage
 * Use this to reset the cart if you see unexpected item counts
 *
 * Usage in browser console:
 * localStorage.removeItem('cart-storage')
 * window.location.reload()
 */
export function clearLocalStorageCart() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart-storage')
    console.log('✅ Cart cleared from localStorage')
  }
}

/**
 * Get cart data from localStorage for debugging
 *
 * Usage in browser console:
 * const cart = JSON.parse(localStorage.getItem('cart-storage') || '{}')
 * console.log('Cart items:', cart.state?.items)
 * console.log('Total items:', cart.state?.items?.reduce((sum, item) => sum + item.quantity, 0))
 */
export function getLocalStorageCart() {
  if (typeof window !== 'undefined') {
    const cartData = localStorage.getItem('cart-storage')
    if (cartData) {
      try {
        const cart = JSON.parse(cartData)
        console.log('🛒 Cart data:', cart)
        if (cart.state?.items) {
          console.log('📦 Items:', cart.state.items)
          const totalQty = cart.state.items.reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
          )
          console.log('🔢 Total quantity:', totalQty)
          console.log('🆔 Unique products:', cart.state.items.length)
        }
        return cart
      } catch (error) {
        console.error('❌ Error parsing cart data:', error)
      }
    } else {
      console.log('📭 No cart data in localStorage')
    }
  }
  return null
}
