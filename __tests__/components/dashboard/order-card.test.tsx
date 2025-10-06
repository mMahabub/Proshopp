import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import OrderCard from '@/components/dashboard/order-card'

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

describe('OrderCard', () => {
  const mockPush = jest.fn()
  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-20250105-001',
    status: 'pending',
    createdAt: new Date('2025-01-05T10:00:00Z'),
    totalPrice: 120.96,
    items: [
      {
        id: 'item-1',
        name: 'Test Product 1',
        image: '/test-image-1.jpg',
        quantity: 2,
      },
      {
        id: 'item-2',
        name: 'Test Product 2',
        image: '/test-image-2.jpg',
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

  describe('Order Information Display', () => {
    it('should display order number', () => {
      render(<OrderCard order={mockOrder} />)

      expect(screen.getByText('ORD-20250105-001')).toBeInTheDocument()
    })

    it('should display formatted order date', () => {
      render(<OrderCard order={mockOrder} />)

      expect(screen.getByText('Ordered on Jan 5, 2025')).toBeInTheDocument()
    })

    it('should display order status with correct capitalization', () => {
      render(<OrderCard order={mockOrder} />)

      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('should display total price', () => {
      render(<OrderCard order={mockOrder} />)

      expect(screen.getByText('$120.96')).toBeInTheDocument()
    })

    it('should display item count', () => {
      render(<OrderCard order={mockOrder} />)

      expect(screen.getByText('2 items')).toBeInTheDocument()
    })

    it('should display singular "item" for single item order', () => {
      const singleItemOrder = {
        ...mockOrder,
        items: [mockOrder.items[0]],
      }

      render(<OrderCard order={singleItemOrder} />)

      expect(screen.getByText('1 item')).toBeInTheDocument()
    })
  })

  describe('Product Images', () => {
    it('should display up to 3 product images', () => {
      render(<OrderCard order={mockOrder} />)

      const image1 = screen.getByAltText('Test Product 1')
      const image2 = screen.getByAltText('Test Product 2')

      expect(image1).toHaveAttribute('src', '/test-image-1.jpg')
      expect(image2).toHaveAttribute('src', '/test-image-2.jpg')
    })

    it('should show "+X more" text when more than 3 items', () => {
      const manyItemsOrder = {
        ...mockOrder,
        items: [
          ...mockOrder.items,
          {
            id: 'item-3',
            name: 'Test Product 3',
            image: '/test-image-3.jpg',
            quantity: 1,
          },
          {
            id: 'item-4',
            name: 'Test Product 4',
            image: '/test-image-4.jpg',
            quantity: 1,
          },
        ],
      }

      render(<OrderCard order={manyItemsOrder} />)

      expect(screen.getByText(/\+\d+ more/)).toBeInTheDocument()
    })

    it('should handle missing product images with placeholder', () => {
      const orderWithoutImage = {
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[0],
            image: '',
          },
        ],
      }

      render(<OrderCard order={orderWithoutImage} />)

      const image = screen.getByAltText('Test Product 1')
      expect(image).toHaveAttribute('src', '/placeholder.png')
    })
  })

  describe('Status Badge Colors', () => {
    it('should apply yellow color for pending status', () => {
      render(<OrderCard order={mockOrder} />)

      const badge = screen.getByText('Pending')
      expect(badge).toHaveClass('bg-yellow-500')
    })

    it('should apply blue color for processing status', () => {
      const processingOrder = { ...mockOrder, status: 'processing' }
      render(<OrderCard order={processingOrder} />)

      const badge = screen.getByText('Processing')
      expect(badge).toHaveClass('bg-blue-500')
    })

    it('should apply purple color for shipped status', () => {
      const shippedOrder = { ...mockOrder, status: 'shipped' }
      render(<OrderCard order={shippedOrder} />)

      const badge = screen.getByText('Shipped')
      expect(badge).toHaveClass('bg-purple-500')
    })

    it('should apply green color for delivered status', () => {
      const deliveredOrder = { ...mockOrder, status: 'delivered' }
      render(<OrderCard order={deliveredOrder} />)

      const badge = screen.getByText('Delivered')
      expect(badge).toHaveClass('bg-green-500')
    })

    it('should apply red color for cancelled status', () => {
      const cancelledOrder = { ...mockOrder, status: 'cancelled' }
      render(<OrderCard order={cancelledOrder} />)

      const badge = screen.getByText('Cancelled')
      expect(badge).toHaveClass('bg-red-500')
    })
  })

  describe('Navigation', () => {
    it('should navigate to order details when card is clicked', async () => {
      const user = userEvent.setup()
      render(<OrderCard order={mockOrder} />)

      const card = screen.getByText('ORD-20250105-001').closest('div')?.parentElement
      if (card) {
        await user.click(card)
      }

      expect(mockPush).toHaveBeenCalledWith('/orders/order-123')
    })

    it('should navigate to order details when "View Details" button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrderCard order={mockOrder} />)

      const viewButton = screen.getByRole('button', { name: /view details/i })
      await user.click(viewButton)

      expect(mockPush).toHaveBeenCalledWith('/orders/order-123')
    })
  })

  describe('Responsive Layout', () => {
    it('should render all sections correctly', () => {
      render(<OrderCard order={mockOrder} />)

      // Check all main sections exist
      expect(screen.getByText('ORD-20250105-001')).toBeInTheDocument()
      expect(screen.getByText('Ordered on Jan 5, 2025')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument()
    })
  })
})
