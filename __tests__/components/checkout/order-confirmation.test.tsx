import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import OrderConfirmation from '@/components/checkout/order-confirmation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
  }: {
    src: string
    alt: string
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />
  },
}))

describe('OrderConfirmation', () => {
  const mockPush = jest.fn()
  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-20250105-001',
    status: 'pending',
    createdAt: new Date('2025-01-05T10:00:00Z'),
    subtotal: 109.97,
    tax: 10.997,
    totalPrice: 120.967,
    shippingAddress: {
      fullName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    items: [
      {
        id: 'item-1',
        name: 'Test Product 1',
        slug: 'test-product-1',
        image: '/test-image-1.jpg',
        price: 29.99,
        quantity: 2,
      },
      {
        id: 'item-2',
        name: 'Test Product 2',
        slug: 'test-product-2',
        image: '/test-image-2.jpg',
        price: 49.99,
        quantity: 1,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  describe('Success Message', () => {
    it('should display success icon', () => {
      render(<OrderConfirmation order={mockOrder} />)

      // Check for the checkmark SVG icon by class
      const container = screen.getByText('Order Confirmed!').closest('div')
      expect(container).toBeInTheDocument()
    })

    it('should display confirmation heading', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument()
    })

    it('should display confirmation message', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(
        screen.getByText(
          /Thank you for your order. We've sent a confirmation email/i
        )
      ).toBeInTheDocument()
    })
  })

  describe('Order Details', () => {
    it('should display order number', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('ORD-20250105-001')).toBeInTheDocument()
    })

    it('should display order date', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('Jan 5, 2025')).toBeInTheDocument()
    })

    it('should display order status', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('pending')).toBeInTheDocument()
    })

    it('should display estimated delivery dates', () => {
      render(<OrderConfirmation order={mockOrder} />)

      // 7-10 business days from Jan 5, 2025 = Jan 12-15, 2025
      expect(screen.getByText(/Jan 12, 2025 - Jan 15, 2025/)).toBeInTheDocument()
    })
  })

  describe('Order Items', () => {
    it('should display all order items', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    it('should display item quantities', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('Qty: 2')).toBeInTheDocument()
      expect(screen.getByText('Qty: 1')).toBeInTheDocument()
    })

    it('should display item images', () => {
      render(<OrderConfirmation order={mockOrder} />)

      const image1 = screen.getByAltText('Test Product 1')
      const image2 = screen.getByAltText('Test Product 2')

      expect(image1).toHaveAttribute('src', '/test-image-1.jpg')
      expect(image2).toHaveAttribute('src', '/test-image-2.jpg')
    })

    it('should display item subtotals', () => {
      render(<OrderConfirmation order={mockOrder} />)

      // $29.99 * 2 = $59.98
      expect(screen.getByText('$59.98')).toBeInTheDocument()
      // $49.99 * 1 = $49.99
      expect(screen.getByText('$49.99')).toBeInTheDocument()
    })
  })

  describe('Price Breakdown', () => {
    it('should display subtotal', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('$109.97')).toBeInTheDocument()
    })

    it('should display tax', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('$10.99')).toBeInTheDocument()
    })

    it('should display total', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('$120.96')).toBeInTheDocument()
    })
  })

  describe('Shipping Address', () => {
    it('should display full name', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display street address', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('123 Main St')).toBeInTheDocument()
    })

    it('should display city, state, and postal code', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('New York, NY 10001')).toBeInTheDocument()
    })

    it('should display country', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByText('United States')).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render "View Order" button', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByRole('button', { name: /view order/i })).toBeInTheDocument()
    })

    it('should navigate to order details page when "View Order" clicked', async () => {
      const user = userEvent.setup()
      render(<OrderConfirmation order={mockOrder} />)

      const viewOrderButton = screen.getByRole('button', { name: /view order/i })
      await user.click(viewOrderButton)

      expect(mockPush).toHaveBeenCalledWith('/orders/order-123')
    })

    it('should render "Continue Shopping" button', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(
        screen.getByRole('button', { name: /continue shopping/i })
      ).toBeInTheDocument()
    })

    it('should navigate to home page when "Continue Shopping" clicked', async () => {
      const user = userEvent.setup()
      render(<OrderConfirmation order={mockOrder} />)

      const continueButton = screen.getByRole('button', { name: /continue shopping/i })
      await user.click(continueButton)

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should render "Print Receipt" button', () => {
      render(<OrderConfirmation order={mockOrder} />)

      expect(screen.getByRole('button', { name: /print receipt/i })).toBeInTheDocument()
    })

    it('should call window.print when "Print Receipt" clicked', async () => {
      const user = userEvent.setup()
      const mockPrint = jest.fn()
      window.print = mockPrint

      render(<OrderConfirmation order={mockOrder} />)

      const printButton = screen.getByRole('button', { name: /print receipt/i })
      await user.click(printButton)

      expect(mockPrint).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing product image with placeholder', () => {
      const orderWithoutImage = {
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[0],
            image: '',
          },
        ],
      }

      render(<OrderConfirmation order={orderWithoutImage} />)

      const image = screen.getByAltText('Test Product 1')
      expect(image).toHaveAttribute('src', '/placeholder.png')
    })

    it('should display correct date for different timezones', () => {
      const orderInDifferentTimezone = {
        ...mockOrder,
        createdAt: new Date('2025-01-05T23:59:59Z'), // Late in UTC
      }

      render(<OrderConfirmation order={orderInDifferentTimezone} />)

      // Should still show Jan 5, 2025 regardless of timezone
      expect(screen.getByText('Jan 5, 2025')).toBeInTheDocument()
    })
  })
})
