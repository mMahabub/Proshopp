import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import OrdersTable from '@/components/admin/orders-table'
import { updateOrderStatus } from '@/lib/actions/order.actions'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/actions/order.actions')
jest.mock('sonner')

const mockOrders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    totalPrice: 100,
    status: 'pending',
    isPaid: true,
    isDelivered: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    totalPrice: 200,
    status: 'delivered',
    isPaid: true,
    isDelivered: true,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
]

const mockPagination = {
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
}

const mockOnFilterChange = jest.fn()

describe('OrdersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render orders table with data', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Check if order numbers are displayed
    expect(screen.getByText('ORD-001')).toBeInTheDocument()
    expect(screen.getByText('ORD-002')).toBeInTheDocument()

    // Check if customer names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    // Check if prices are formatted correctly
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('$200.00')).toBeInTheDocument()

    // Check if status badges are displayed
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('delivered')).toBeInTheDocument()
  })

  it('should render empty state when no orders', () => {
    render(
      <OrdersTable
        initialOrders={[]}
        initialPagination={{ ...mockPagination, total: 0 }}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('No orders found')).toBeInTheDocument()
  })

  it('should filter orders by status', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    const statusFilter = screen.getAllByRole('combobox')[0]
    fireEvent.click(statusFilter)

    const pendingOption = screen.getByText('Pending', { selector: '[role="option"]' })
    fireEvent.click(pendingOption)

    expect(mockOnFilterChange).toHaveBeenCalledWith('pending', '', 1)
  })

  it('should handle search input', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by order number or customer name/i)
    const searchButton = screen.getByRole('button', { name: /search/i })

    fireEvent.change(searchInput, { target: { value: 'ORD-001' } })
    fireEvent.click(searchButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith('all', 'ORD-001', 1)
  })

  it('should search on Enter key press', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by order number or customer name/i)

    fireEvent.change(searchInput, { target: { value: 'Jane' } })
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })

    expect(mockOnFilterChange).toHaveBeenCalledWith('all', 'Jane', 1)
  })

  it('should handle pagination', () => {
    const multiPagePagination = {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    }

    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={multiPagePagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith('all', '', 2)
  })

  it('should disable Previous button on first page', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={{
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        }}
        onFilterChange={mockOnFilterChange}
      />
    )

    const prevButton = screen.getByRole('button', { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('should disable Next button on last page', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={{
          total: 25,
          page: 3,
          limit: 10,
          totalPages: 3,
        }}
        onFilterChange={mockOnFilterChange}
      />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('should update order status successfully', async () => {
    ;(updateOrderStatus as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Order status updated successfully',
    })

    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Find the status dropdown for the first order
    const statusDropdowns = screen.getAllByRole('combobox')
    const firstStatusDropdown = statusDropdowns[statusDropdowns.length - 2]

    fireEvent.click(firstStatusDropdown)

    // Select "Processing" option
    const processingOption = screen.getByText('Processing', { selector: '[role="option"]' })
    fireEvent.click(processingOption)

    await waitFor(() => {
      expect(updateOrderStatus).toHaveBeenCalledWith({
        orderId: 'order-1',
        status: 'processing',
      })
      expect(toast.success).toHaveBeenCalledWith('Order status updated successfully')
    })
  })

  it('should handle order status update error', async () => {
    ;(updateOrderStatus as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Failed to update status',
    })

    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    const statusDropdowns = screen.getAllByRole('combobox')
    const firstStatusDropdown = statusDropdowns[statusDropdowns.length - 2]

    fireEvent.click(firstStatusDropdown)

    const processingOption = screen.getByText('Processing', { selector: '[role="option"]' })
    fireEvent.click(processingOption)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update status')
    })
  })

  it('should display payment status correctly', () => {
    const ordersWithMixedPayment = [
      { ...mockOrders[0], isPaid: true },
      { ...mockOrders[1], isPaid: false },
    ]

    render(
      <OrdersTable
        initialOrders={ordersWithMixedPayment}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Unpaid')).toBeInTheDocument()
  })

  it('should render order links correctly', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    const orderLink = screen.getByRole('link', { name: 'ORD-001' })
    expect(orderLink).toHaveAttribute('href', '/admin/orders/order-1')
  })

  it('should not show pagination when only one page', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={mockPagination}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.queryByText(/previous/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/next/i)).not.toBeInTheDocument()
  })

  it('should display pagination info correctly', () => {
    render(
      <OrdersTable
        initialOrders={mockOrders}
        initialPagination={{
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
        }}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByText(/showing 11 to 20 of 25 orders/i)).toBeInTheDocument()
  })
})
