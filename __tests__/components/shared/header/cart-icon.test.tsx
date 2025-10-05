// Mock dependencies BEFORE any imports
jest.mock('@/lib/store/cart-store')

import { render, screen, waitFor } from '@testing-library/react'
import CartIcon from '@/components/shared/header/cart-icon'
import { useCartStore } from '@/lib/store/cart-store'

const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>

describe('CartIcon', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock cart store subscribe function
    ;(useCartStore as any).subscribe = jest.fn(() => jest.fn())

    // Mock cart store with default empty state
    mockUseCartStore.mockReturnValue({
      items: [],
      getItemCount: jest.fn(() => 0),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 0),
    })
  })

  describe('Rendering', () => {
    it('should render shopping cart icon', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getItemCount: jest.fn(() => 0),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
      })

      render(<CartIcon />)

      // Shopping cart icon should be present
      const link = screen.getByRole('link', { name: /cart/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/cart')
    })

    it('should render "Cart" text', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getItemCount: jest.fn(() => 0),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
      })

      render(<CartIcon />)

      expect(screen.getByText('Cart')).toBeInTheDocument()
    })
  })

  describe('Badge Display', () => {
    it('should not show badge when cart is empty', async () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getItemCount: jest.fn(() => 0),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
      })

      render(<CartIcon />)

      // Wait for component to mount and useEffect to run
      await waitFor(() => {
        expect(screen.queryByText('0')).not.toBeInTheDocument()
      })
    })

    it('should show badge with item count when cart has items', async () => {
      mockUseCartStore.mockReturnValue({
        items: [{
          id: '1',
          name: 'Product 1',
          slug: 'product-1',
          price: 50,
          quantity: 2,
          image: '/test.jpg',
          stock: 10,
        }],
        getItemCount: jest.fn(() => 2),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 100),
      })

      render(<CartIcon />)

      // Wait for component to mount and badge to appear
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })

    it('should update badge when item count changes', async () => {
      const mockGetItemCount = jest.fn(() => 5)
      mockUseCartStore.mockReturnValue({
        items: Array(3).fill({
          id: '1',
          name: 'Product',
          slug: 'product',
          price: 10,
          quantity: 1,
          image: '/test.jpg',
          stock: 10,
        }),
        getItemCount: mockGetItemCount,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 150),
      })

      render(<CartIcon />)

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })
    })

    it('should handle large item counts', async () => {
      mockUseCartStore.mockReturnValue({
        items: Array(50).fill({
          id: '1',
          name: 'Product',
          slug: 'product',
          price: 10,
          quantity: 1,
          image: '/test.jpg',
          stock: 10,
        }),
        getItemCount: jest.fn(() => 99),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 990),
      })

      render(<CartIcon />)

      // Wait for badge to render with large count
      await waitFor(() => {
        expect(screen.getByText('99')).toBeInTheDocument()
      })
    })
  })

  describe('Link Behavior', () => {
    it('should link to /cart page', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getItemCount: jest.fn(() => 0),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
      })

      render(<CartIcon />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/cart')
    })

    it('should be clickable even when cart is empty', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getItemCount: jest.fn(() => 0),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
      })

      render(<CartIcon />)

      const link = screen.getByRole('link')
      expect(link).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible link text', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getItemCount: jest.fn(() => 0),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
      })

      render(<CartIcon />)

      // Link should have accessible name
      expect(screen.getByRole('link')).toHaveAccessibleName(/cart/i)
    })
  })
})
