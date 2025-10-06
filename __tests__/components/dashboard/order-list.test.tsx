import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import OrderList from '@/components/dashboard/order-list'

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

describe('OrderList', () => {
  const mockPush = jest.fn()

  const mockOrders = [
    {
      id: 'order-1',
      orderNumber: 'ORD-20250105-001',
      status: 'pending',
      createdAt: new Date('2025-01-05T10:00:00Z'),
      totalPrice: 120.96,
      items: [
        {
          id: 'item-1',
          name: 'Product 1',
          image: '/image-1.jpg',
          quantity: 2,
        },
      ],
    },
    {
      id: 'order-2',
      orderNumber: 'ORD-20250104-001',
      status: 'processing',
      createdAt: new Date('2025-01-04T10:00:00Z'),
      totalPrice: 89.99,
      items: [
        {
          id: 'item-2',
          name: 'Product 2',
          image: '/image-2.jpg',
          quantity: 1,
        },
      ],
    },
    {
      id: 'order-3',
      orderNumber: 'ORD-20250103-001',
      status: 'delivered',
      createdAt: new Date('2025-01-03T10:00:00Z'),
      totalPrice: 49.99,
      items: [
        {
          id: 'item-3',
          name: 'Product 3',
          image: '/image-3.jpg',
          quantity: 1,
        },
      ],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no orders', () => {
      render(<OrderList orders={[]} />)

      expect(screen.getByText('No orders yet')).toBeInTheDocument()
      expect(
        screen.getByText('When you place an order, it will appear here.')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start shopping/i })).toBeInTheDocument()
    })
  })

  describe('Order Display', () => {
    it('should display all orders', () => {
      render(<OrderList orders={mockOrders} />)

      expect(screen.getByText('ORD-20250105-001')).toBeInTheDocument()
      expect(screen.getByText('ORD-20250104-001')).toBeInTheDocument()
      expect(screen.getByText('ORD-20250103-001')).toBeInTheDocument()
    })

    it('should display correct order count', () => {
      render(<OrderList orders={mockOrders} />)

      expect(screen.getByText('3 orders')).toBeInTheDocument()
    })

    it('should display singular "order" for single order', () => {
      render(<OrderList orders={[mockOrders[0]]} />)

      expect(screen.getByText('1 order')).toBeInTheDocument()
    })

    it('should display page heading', () => {
      render(<OrderList orders={mockOrders} />)

      expect(screen.getByText('My Orders')).toBeInTheDocument()
    })
  })

  describe('Status Filtering', () => {
    it('should display filter dropdown with "All Orders" by default', () => {
      render(<OrderList orders={mockOrders} />)

      expect(screen.getByRole('button', { name: /all orders/i })).toBeInTheDocument()
    })

    it('should filter orders by pending status', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={mockOrders} />)

      // Open filter dropdown
      const filterButton = screen.getByRole('button', { name: /all orders/i })
      await user.click(filterButton)

      // Click pending filter - use getAllByText and select the one in the dropdown
      const pendingOptions = screen.getAllByText('Pending')
      // The last one should be in the dropdown (badges come first)
      await user.click(pendingOptions[pendingOptions.length - 1])

      // Should only show pending order
      expect(screen.getByText('ORD-20250105-001')).toBeInTheDocument()
      expect(screen.queryByText('ORD-20250104-001')).not.toBeInTheDocument()
      expect(screen.queryByText('ORD-20250103-001')).not.toBeInTheDocument()

      // Should update count
      expect(screen.getByText('1 order (Pending)')).toBeInTheDocument()
    })

    it('should filter orders by processing status', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={mockOrders} />)

      // Open filter dropdown
      const filterButton = screen.getByRole('button', { name: /all orders/i })
      await user.click(filterButton)

      // Click processing filter
      const processingOptions = screen.getAllByText('Processing')
      await user.click(processingOptions[processingOptions.length - 1])

      // Should only show processing order
      expect(screen.queryByText('ORD-20250105-001')).not.toBeInTheDocument()
      expect(screen.getByText('ORD-20250104-001')).toBeInTheDocument()
      expect(screen.queryByText('ORD-20250103-001')).not.toBeInTheDocument()
    })

    it('should filter orders by delivered status', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={mockOrders} />)

      // Open filter dropdown
      const filterButton = screen.getByRole('button', { name: /all orders/i })
      await user.click(filterButton)

      // Click delivered filter
      const deliveredOptions = screen.getAllByText('Delivered')
      await user.click(deliveredOptions[deliveredOptions.length - 1])

      // Should only show delivered order
      expect(screen.queryByText('ORD-20250105-001')).not.toBeInTheDocument()
      expect(screen.queryByText('ORD-20250104-001')).not.toBeInTheDocument()
      expect(screen.getByText('ORD-20250103-001')).toBeInTheDocument()
    })

    it('should show filtered empty state when no orders match filter', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={mockOrders} />)

      // Open filter dropdown
      const filterButton = screen.getByRole('button', { name: /all orders/i })
      await user.click(filterButton)

      // Click cancelled filter (no cancelled orders)
      const cancelledOption = screen.getByText('Cancelled')
      await user.click(cancelledOption)

      // Should show filtered empty state
      expect(screen.getByText('No cancelled found.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view all orders/i })).toBeInTheDocument()
    })

    it('should reset to all orders from filtered empty state', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={mockOrders} />)

      // Filter to cancelled (no results)
      const filterButton = screen.getByRole('button', { name: /all orders/i })
      await user.click(filterButton)
      const cancelledOption = screen.getByText('Cancelled')
      await user.click(cancelledOption)

      // Click "View all orders"
      const viewAllButton = screen.getByRole('button', { name: /view all orders/i })
      await user.click(viewAllButton)

      // Should show all orders again
      expect(screen.getByText('ORD-20250105-001')).toBeInTheDocument()
      expect(screen.getByText('ORD-20250104-001')).toBeInTheDocument()
      expect(screen.getByText('ORD-20250103-001')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    // Create 15 orders to test pagination (10 per page)
    const manyOrders = Array.from({ length: 15 }, (_, i) => ({
      id: `order-${i + 1}`,
      orderNumber: `ORD-2025010${i + 1}-001`,
      status: 'pending',
      createdAt: new Date('2025-01-05T10:00:00Z'),
      totalPrice: 100.0,
      items: [
        {
          id: `item-${i + 1}`,
          name: `Product ${i + 1}`,
          image: `/image-${i + 1}.jpg`,
          quantity: 1,
        },
      ],
    }))

    it('should show pagination controls when more than 10 orders', () => {
      render(<OrderList orders={manyOrders} />)

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('should disable previous button on first page', () => {
      render(<OrderList orders={manyOrders} />)

      const previousButton = screen.getByRole('button', { name: /previous/i })
      expect(previousButton).toBeDisabled()
    })

    it('should navigate to next page', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={manyOrders} />)

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    })

    it('should disable next button on last page', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={manyOrders} />)

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      expect(nextButton).toBeDisabled()
    })

    it('should navigate to previous page', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={manyOrders} />)

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // Go back to page 1
      const previousButton = screen.getByRole('button', { name: /previous/i })
      await user.click(previousButton)

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    })

    it('should reset to page 1 when filter changes', async () => {
      const user = userEvent.setup()
      render(<OrderList orders={manyOrders} />)

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

      // Change filter
      const filterButton = screen.getByRole('button', { name: /all orders/i })
      await user.click(filterButton)
      const pendingOptions = screen.getAllByText('Pending')
      await user.click(pendingOptions[pendingOptions.length - 1])

      // Should be back on page 1
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    })

    it('should not show pagination when 10 or fewer orders', () => {
      render(<OrderList orders={mockOrders} />)

      expect(screen.queryByText(/page/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    })
  })
})
