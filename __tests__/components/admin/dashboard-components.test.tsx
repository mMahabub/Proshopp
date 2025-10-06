import { render, screen } from '@testing-library/react'
import RecentOrdersTable from '@/components/admin/recent-orders-table'
import LowStockAlert from '@/components/admin/low-stock-alert'
import TopProductsList from '@/components/admin/top-products-list'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />
  },
}))

describe('RecentOrdersTable', () => {
  const mockOrders = [
    {
      id: 'order-1',
      orderNumber: 'ORD-001',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      totalPrice: 100.50,
      status: 'pending',
      isPaid: true,
      createdAt: new Date('2025-01-01'),
    },
  ]

  it('should display table headers', () => {
    render(<RecentOrdersTable orders={mockOrders} />)

    expect(screen.getByText('Order Number')).toBeInTheDocument()
    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
  })

  it('should display order data', () => {
    render(<RecentOrdersTable orders={mockOrders} />)

    expect(screen.getByText('ORD-001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('$100.50')).toBeInTheDocument()
  })

  it('should display empty state when no orders', () => {
    render(<RecentOrdersTable orders={[]} />)

    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('should display status badges with correct colors', () => {
    render(<RecentOrdersTable orders={mockOrders} />)

    const statusBadge = screen.getByText('pending')
    expect(statusBadge).toHaveClass('bg-yellow-500')
  })

  it('should display payment status', () => {
    render(<RecentOrdersTable orders={mockOrders} />)

    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})

describe('LowStockAlert', () => {
  const mockProducts = [
    {
      id: 'prod-1',
      name: 'Low Stock Product',
      slug: 'low-stock',
      stock: 2,
      price: 50,
      image: '/image.jpg',
    },
  ]

  it('should display low stock products', () => {
    render(<LowStockAlert products={mockProducts} />)

    expect(screen.getByText('Low Stock Alert')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Product')).toBeInTheDocument()
    expect(screen.getByText('Stock: 2 units')).toBeInTheDocument()
  })

  it('should display empty state when no low stock products', () => {
    render(<LowStockAlert products={[]} />)

    expect(screen.getByText('No low stock products')).toBeInTheDocument()
  })

  it('should display singular unit for stock of 1', () => {
    const singleStockProduct = [{ ...mockProducts[0], stock: 1 }]
    render(<LowStockAlert products={singleStockProduct} />)

    expect(screen.getByText('Stock: 1 unit')).toBeInTheDocument()
  })

  it('should display product image', () => {
    render(<LowStockAlert products={mockProducts} />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})

describe('TopProductsList', () => {
  const mockProducts = [
    {
      id: 'prod-1',
      name: 'Top Product',
      slug: 'top-product',
      price: 100,
      image: '/image.jpg',
      totalSales: 50,
      orderCount: 10,
    },
  ]

  it('should display top products', () => {
    render(<TopProductsList products={mockProducts} />)

    expect(screen.getByText('Top Selling Products')).toBeInTheDocument()
    expect(screen.getByText('Top Product')).toBeInTheDocument()
    expect(screen.getByText('50 units sold')).toBeInTheDocument()
    expect(screen.getByText('10 orders')).toBeInTheDocument()
  })

  it('should display empty state when no products', () => {
    render(<TopProductsList products={[]} />)

    expect(screen.getByText('No sales data yet')).toBeInTheDocument()
  })

  it('should display product ranking', () => {
    const multipleProducts = [
      mockProducts[0],
      { ...mockProducts[0], id: 'prod-2', name: 'Second Product' },
    ]
    render(<TopProductsList products={multipleProducts} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should display product images', () => {
    render(<TopProductsList products={mockProducts} />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})
