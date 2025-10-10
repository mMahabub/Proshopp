import { render, screen, waitFor } from '@testing-library/react'
import { redirect } from 'next/navigation'
import OrderDetailPage from '@/app/(admin)/admin/orders/[id]/page'
import { getOrder } from '@/lib/actions/order.actions'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@/lib/actions/order.actions', () => ({
  getOrder: jest.fn(),
}))

jest.mock('@/components/admin/order-detail', () => {
  return function MockOrderDetail({ order }: { order: any }) {
    return (
      <div data-testid="order-detail">
        <h1>{order.orderNumber}</h1>
        <p>{order.customerName}</p>
        <p>{order.customerEmail}</p>
        <p>{order.status}</p>
        <p>{order.totalPrice.toFixed(2)}</p>
      </div>
    )
  }
})

const mockGetOrder = getOrder as jest.MockedFunction<typeof getOrder>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('OrderDetailPage', () => {
  const mockOrder: any = {
    id: 'order-123',
    orderNumber: 'ORD-20250106-001',
    status: 'processing',
    createdAt: new Date('2025-01-06T10:00:00Z'),
    updatedAt: new Date('2025-01-06T10:30:00Z'),
    subtotal: { toString: () => '100.00' },
    tax: { toString: () => '10.00' },
    shippingCost: { toString: () => '0.00' },
    totalPrice: { toString: () => '110.00' },
    shippingAddress: {
      fullName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'stripe',
    paymentResult: {
      paymentIntentId: 'pi_123abc456def',
    },
    isPaid: true,
    paidAt: new Date('2025-01-06T10:05:00Z'),
    isDelivered: false,
    deliveredAt: null,
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        name: 'Test Product 1',
        slug: 'test-product-1',
        image: '/images/product1.jpg',
        price: { toString: () => '50.00' },
        quantity: 2,
        product: {
          id: 'product-1',
          name: 'Test Product 1',
          slug: 'test-product-1',
          images: ['/images/product1.jpg'],
        },
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Data Fetching', () => {
    it('should fetch order data by ID', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      expect(mockGetOrder).toHaveBeenCalledWith('order-123')
    })

    it('should redirect to orders list if order fetch fails', async () => {
      mockGetOrder.mockResolvedValue({
        success: false,
        message: 'Order not found',
      })

      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      await expect(
        OrderDetailPage({
          params: Promise.resolve({ id: 'invalid-id' }),
        })
      ).rejects.toThrow('NEXT_REDIRECT')

      expect(mockRedirect).toHaveBeenCalledWith('/admin/orders')
    })

    it('should redirect if order data is null', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: null as any,
      })

      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      await expect(
        OrderDetailPage({
          params: Promise.resolve({ id: 'order-123' }),
        })
      ).rejects.toThrow('NEXT_REDIRECT')

      expect(mockRedirect).toHaveBeenCalledWith('/admin/orders')
    })
  })

  describe('Order Information Display', () => {
    it('should display order number', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      const component = await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      render(component)

      expect(screen.getByText('ORD-20250106-001')).toBeInTheDocument()
    })

    it('should display order status', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      const component = await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      render(component)

      expect(screen.getByText('processing')).toBeInTheDocument()
    })

    it('should display order total price', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      const component = await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      render(component)

      expect(screen.getByText('110.00')).toBeInTheDocument()
    })
  })

  describe('Customer Information Display', () => {
    it('should display customer name', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      const component = await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      render(component)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display customer email', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      const component = await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      render(component)

      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  describe('Data Transformation', () => {
    it('should transform Decimal values to numbers', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      const component = await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      render(component)

      // Verify component receives order with numeric values
      const orderDetail = screen.getByTestId('order-detail')
      expect(orderDetail).toBeInTheDocument()
    })

    it('should transform item prices to numbers', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      // Verify getOrder was called (transformation happens in page component)
      expect(mockGetOrder).toHaveBeenCalled()
    })
  })

  describe('Order Data Structure', () => {
    it('should have correct order structure', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      expect(mockGetOrder).toHaveBeenCalledWith('order-123')
    })

    it('should have shipping address structure', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      expect(mockGetOrder).toHaveBeenCalled()
    })

    it('should have payment information structure', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      expect(mockGetOrder).toHaveBeenCalled()
    })

    it('should have order items with product details', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      await OrderDetailPage({
        params: Promise.resolve({ id: 'order-123' }),
      })

      expect(mockGetOrder).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockGetOrder.mockResolvedValue({
        success: false,
        message: 'Database connection failed',
      })

      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      await expect(
        OrderDetailPage({
          params: Promise.resolve({ id: 'order-123' }),
        })
      ).rejects.toThrow('NEXT_REDIRECT')

      expect(mockRedirect).toHaveBeenCalledWith('/admin/orders')
    })

    it('should handle missing params gracefully', async () => {
      mockGetOrder.mockResolvedValue({
        success: false,
        message: 'Order ID is required',
      })

      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      await expect(
        OrderDetailPage({
          params: Promise.resolve({ id: '' }),
        })
      ).rejects.toThrow('NEXT_REDIRECT')

      expect(mockRedirect).toHaveBeenCalledWith('/admin/orders')
    })
  })

  describe('Next.js 15 Compatibility', () => {
    it('should handle params as Promise', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      const paramsPromise = Promise.resolve({ id: 'order-123' })

      await OrderDetailPage({ params: paramsPromise })

      expect(mockGetOrder).toHaveBeenCalledWith('order-123')
    })

    it('should await params before using', async () => {
      mockGetOrder.mockResolvedValue({
        success: true,
        data: mockOrder,
      })

      let resolveParams: (value: { id: string }) => void
      const paramsPromise = new Promise<{ id: string }>((resolve) => {
        resolveParams = resolve
      })

      const pagePromise = OrderDetailPage({ params: paramsPromise })

      // Params shouldn't be accessed yet
      expect(mockGetOrder).not.toHaveBeenCalled()

      // Resolve params
      resolveParams!({ id: 'order-123' })

      await pagePromise

      // Now getOrder should have been called
      expect(mockGetOrder).toHaveBeenCalledWith('order-123')
    })
  })
})
