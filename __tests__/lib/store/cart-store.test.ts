import { useCartStore } from '@/lib/store/cart-store'
import type { CartItem } from '@/types/cart'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Cart Store', () => {
  const mockItem: Omit<CartItem, 'quantity'> = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: 100,
    image: '/test.jpg',
    stock: 10,
  }

  const mockItem2: Omit<CartItem, 'quantity'> = {
    id: '2',
    name: 'Test Product 2',
    slug: 'test-product-2',
    price: 200,
    image: '/test2.jpg',
    stock: 5,
  }

  beforeEach(() => {
    // Clear store before each test
    useCartStore.getState().clearCart()
    localStorageMock.clear()
  })

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { addItem, items } = useCartStore.getState()

      addItem(mockItem, 2)

      const updatedItems = useCartStore.getState().items
      expect(updatedItems).toHaveLength(1)
      expect(updatedItems[0]).toEqual({ ...mockItem, quantity: 2 })
    })

    it('should add item with default quantity of 1', () => {
      const { addItem } = useCartStore.getState()

      addItem(mockItem)

      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(1)
    })

    it('should update quantity if item already exists', () => {
      const { addItem } = useCartStore.getState()

      addItem(mockItem, 2)
      addItem(mockItem, 3)

      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(5)
    })

    it('should add multiple different items', () => {
      const { addItem } = useCartStore.getState()

      addItem(mockItem, 2)
      addItem(mockItem2, 1)

      const items = useCartStore.getState().items
      expect(items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { addItem, removeItem } = useCartStore.getState()

      addItem(mockItem, 2)
      addItem(mockItem2, 1)

      removeItem('1')

      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('2')
    })

    it('should do nothing if item not found', () => {
      const { addItem, removeItem } = useCartStore.getState()

      addItem(mockItem, 2)
      removeItem('999')

      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockItem, 2)
      updateQuantity('1', 5)

      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(5)
    })

    it('should remove item if quantity is 0', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockItem, 2)
      updateQuantity('1', 0)

      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should remove item if quantity is negative', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockItem, 2)
      updateQuantity('1', -1)

      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should not affect other items', () => {
      const { addItem, updateQuantity } = useCartStore.getState()

      addItem(mockItem, 2)
      addItem(mockItem2, 3)

      updateQuantity('1', 5)

      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(5)
      expect(items[1].quantity).toBe(3)
    })
  })

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const { addItem, clearCart } = useCartStore.getState()

      addItem(mockItem, 2)
      addItem(mockItem2, 1)

      clearCart()

      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })
  })

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      const { getTotal } = useCartStore.getState()

      expect(getTotal()).toBe(0)
    })

    it('should calculate total for single item', () => {
      const { addItem, getTotal } = useCartStore.getState()

      addItem(mockItem, 2)

      expect(getTotal()).toBe(200) // 100 * 2
    })

    it('should calculate total for multiple items', () => {
      const { addItem, getTotal } = useCartStore.getState()

      addItem(mockItem, 2) // 100 * 2 = 200
      addItem(mockItem2, 3) // 200 * 3 = 600

      expect(getTotal()).toBe(800)
    })

    it('should update total when quantity changes', () => {
      const { addItem, updateQuantity, getTotal } = useCartStore.getState()

      addItem(mockItem, 2)
      expect(getTotal()).toBe(200)

      updateQuantity('1', 5)
      expect(getTotal()).toBe(500)
    })
  })

  describe('getItemCount', () => {
    it('should return 0 for empty cart', () => {
      const { getItemCount } = useCartStore.getState()

      expect(getItemCount()).toBe(0)
    })

    it('should count items correctly', () => {
      const { addItem, getItemCount } = useCartStore.getState()

      addItem(mockItem, 2)

      expect(getItemCount()).toBe(2)
    })

    it('should count multiple items correctly', () => {
      const { addItem, getItemCount } = useCartStore.getState()

      addItem(mockItem, 2)
      addItem(mockItem2, 3)

      expect(getItemCount()).toBe(5)
    })

    it('should update count when quantity changes', () => {
      const { addItem, updateQuantity, getItemCount } = useCartStore.getState()

      addItem(mockItem, 2)
      expect(getItemCount()).toBe(2)

      updateQuantity('1', 5)
      expect(getItemCount()).toBe(5)
    })

    it('should update count when item removed', () => {
      const { addItem, removeItem, getItemCount } = useCartStore.getState()

      addItem(mockItem, 2)
      addItem(mockItem2, 3)
      expect(getItemCount()).toBe(5)

      removeItem('1')
      expect(getItemCount()).toBe(3)
    })
  })

  // Note: localStorage persistence is enabled via Zustand persist middleware
  // and works in browser environment. Testing persistence in Jest requires
  // complex mocking of Zustand's internal hydration mechanism.
  // The functionality has been manually verified in browser environment.
})
