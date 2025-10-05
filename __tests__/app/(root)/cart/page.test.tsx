// Mock dependencies BEFORE any imports
jest.mock('@/lib/store/cart-store')

import { render, screen } from '@testing-library/react'
import CartPage from '@/app/(root)/cart/page'
import { useCartStore } from '@/lib/store/cart-store'
import type { CartItem } from '@/types/cart'

const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock child components
jest.mock('@/components/shared/cart/cart-item', () => ({
  __esModule: true,
  default: ({ item }: { item: CartItem }) => (
    <div data-testid={`cart-item-${item.id}`}>{item.name}</div>
  ),
}))

jest.mock('@/components/shared/cart/cart-summary', () => ({
  __esModule: true,
  default: () => <div data-testid="cart-summary">Cart Summary</div>,
}))

describe('CartPage', () => {
  const mockItems: CartItem[] = [
    {
      id: '1',
      name: 'Product 1',
      slug: 'product-1',
      price: 50,
      quantity: 2,
      image: '/product1.jpg',
      stock: 10,
    },
    {
      id: '2',
      name: 'Product 2',
      slug: 'product-2',
      price: 30,
      quantity: 1,
      image: '/product2.jpg',
      stock: 5,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock cart store with default empty state
    mockUseCartStore.mockReturnValue({
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 0),
      getItemCount: jest.fn(() => 0),
    })
  })

  describe('Empty Cart State', () => {
    it('should render empty cart message when no items', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
        getItemCount: jest.fn(() => 0),
      })

      render(<CartPage />)

      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    })

    it('should render "Start Shopping" button in empty state', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
        getItemCount: jest.fn(() => 0),
      })

      render(<CartPage />)

      expect(screen.getByRole('button', { name: /start shopping/i })).toBeInTheDocument()
    })

    it('should not render CartSummary when cart is empty', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
        getItemCount: jest.fn(() => 0),
      })

      render(<CartPage />)

      expect(screen.queryByTestId('cart-summary')).not.toBeInTheDocument()
    })
  })

  describe('Cart with Items', () => {
    it('should render page title', () => {
      mockUseCartStore.mockReturnValue({
        items: mockItems,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 130),
        getItemCount: jest.fn(() => 3),
      })

      render(<CartPage />)

      expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument()
    })

    it('should render all cart items', () => {
      mockUseCartStore.mockReturnValue({
        items: mockItems,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 130),
        getItemCount: jest.fn(() => 3),
      })

      render(<CartPage />)

      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('cart-item-2')).toBeInTheDocument()
      expect(screen.getByText('Product 1')).toBeInTheDocument()
      expect(screen.getByText('Product 2')).toBeInTheDocument()
    })

    it('should render CartSummary when items exist', () => {
      mockUseCartStore.mockReturnValue({
        items: mockItems,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 130),
        getItemCount: jest.fn(() => 3),
      })

      render(<CartPage />)

      expect(screen.getByTestId('cart-summary')).toBeInTheDocument()
    })

    it('should render item count in heading', () => {
      mockUseCartStore.mockReturnValue({
        items: mockItems,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 130),
        getItemCount: jest.fn(() => 3),
      })

      render(<CartPage />)

      // Should show "Shopping Cart (3 items)" or similar
      expect(screen.getByText(/3 items?/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single item correctly', () => {
      const singleItem = [mockItems[0]]

      mockUseCartStore.mockReturnValue({
        items: singleItem,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 100),
        getItemCount: jest.fn(() => 2),
      })

      render(<CartPage />)

      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument()
      expect(screen.queryByTestId('cart-item-2')).not.toBeInTheDocument()
    })

    it('should handle many items', () => {
      const manyItems: CartItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Product ${i + 1}`,
        slug: `product-${i + 1}`,
        price: 10 * (i + 1),
        quantity: 1,
        image: `/product${i + 1}.jpg`,
        stock: 10,
      }))

      mockUseCartStore.mockReturnValue({
        items: manyItems,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 550),
        getItemCount: jest.fn(() => 10),
      })

      render(<CartPage />)

      // All 10 items should be rendered
      manyItems.forEach((item) => {
        expect(screen.getByTestId(`cart-item-${item.id}`)).toBeInTheDocument()
      })
    })
  })
})
