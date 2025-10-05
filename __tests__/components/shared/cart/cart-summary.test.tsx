// Mock dependencies BEFORE any imports
jest.mock('@/lib/store/cart-store')

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartSummary from '@/components/shared/cart/cart-summary'
import { useCartStore } from '@/lib/store/cart-store'

const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('CartSummary', () => {
  const mockGetTotal = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock cart store with default empty state
    mockUseCartStore.mockReturnValue({
      items: [],
      getTotal: mockGetTotal,
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getItemCount: jest.fn(),
    })
  })

  describe('Rendering', () => {
    it('should render subtotal', () => {
      mockGetTotal.mockReturnValue(99.99)

      render(<CartSummary />)

      expect(screen.getByText('Subtotal')).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
    })

    it('should render tax (8% of subtotal)', () => {
      mockGetTotal.mockReturnValue(100)

      render(<CartSummary />)

      expect(screen.getByText('Tax (8%)')).toBeInTheDocument()
      expect(screen.getByText('$8.00')).toBeInTheDocument()
    })

    it('should render total (subtotal + tax)', () => {
      mockGetTotal.mockReturnValue(100)

      render(<CartSummary />)

      expect(screen.getByText('Total')).toBeInTheDocument()
      // $100 + $8 = $108
      expect(screen.getByText('$108.00')).toBeInTheDocument()
    })

    it('should render "Continue Shopping" button', () => {
      mockGetTotal.mockReturnValue(100)

      render(<CartSummary />)

      expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument()
    })

    it('should render "Proceed to Checkout" button', () => {
      mockGetTotal.mockReturnValue(100)

      render(<CartSummary />)

      expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument()
    })
  })

  describe('Calculations', () => {
    it('should calculate tax correctly for round numbers', () => {
      mockGetTotal.mockReturnValue(100)

      render(<CartSummary />)

      // 8% of $100 = $8.00
      expect(screen.getByText('$8.00')).toBeInTheDocument()
    })

    it('should calculate tax correctly for decimal values', () => {
      mockGetTotal.mockReturnValue(99.99)

      render(<CartSummary />)

      // 8% of $99.99 = $8.00 (rounded to 2 decimals)
      expect(screen.getByText('$8.00')).toBeInTheDocument()
    })

    it('should calculate total correctly', () => {
      mockGetTotal.mockReturnValue(150.50)

      render(<CartSummary />)

      // Tax: 8% of $150.50 = $12.04
      // Total: $150.50 + $12.04 = $162.54
      expect(screen.getByText('$162.54')).toBeInTheDocument()
    })

    it('should handle zero subtotal', () => {
      mockGetTotal.mockReturnValue(0)

      render(<CartSummary />)

      // Check that all values are $0.00
      const subtotalValue = screen.getAllByText('$0.00')
      expect(subtotalValue.length).toBe(3) // subtotal, tax, and total should all be $0.00
    })
  })

  describe('Navigation', () => {
    it('should navigate to home when "Continue Shopping" clicked', async () => {
      mockGetTotal.mockReturnValue(100)

      const user = userEvent.setup()
      render(<CartSummary />)

      const continueButton = screen.getByRole('button', { name: /continue shopping/i })
      await user.click(continueButton)

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate to checkout when "Proceed to Checkout" clicked', async () => {
      mockGetTotal.mockReturnValue(100)

      const user = userEvent.setup()
      render(<CartSummary />)

      const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i })
      await user.click(checkoutButton)

      expect(mockPush).toHaveBeenCalledWith('/checkout')
    })
  })

  describe('Display Formatting', () => {
    it('should format currency with 2 decimal places', () => {
      mockGetTotal.mockReturnValue(99.9)

      render(<CartSummary />)

      // Should display as $99.90, not $99.9
      expect(screen.getByText('$99.90')).toBeInTheDocument()
    })

    it('should format large amounts correctly', () => {
      mockGetTotal.mockReturnValue(1234.56)

      render(<CartSummary />)

      expect(screen.getByText('$1,234.56')).toBeInTheDocument()
      // Tax: 8% of $1234.56 = $98.76
      expect(screen.getByText('$98.76')).toBeInTheDocument()
      // Total: $1234.56 + $98.76 = $1333.32
      expect(screen.getByText('$1,333.32')).toBeInTheDocument()
    })
  })
})
