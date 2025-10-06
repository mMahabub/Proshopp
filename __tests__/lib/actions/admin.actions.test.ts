import {
  getDashboardMetrics,
  getSalesChartData,
  getRecentOrders,
  getLowStockProducts,
  getTopSellingProducts,
} from '@/lib/actions/admin.actions'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('@/auth')
jest.mock('@/db/prisma', () => ({
  prisma: {
    order: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
  },
}))
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Admin Actions', () => {
  const mockAdminSession = {
    user: { id: 'admin-123', email: 'admin@test.com', role: 'admin' },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue(mockAdminSession)
  })

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics successfully', async () => {
      ;(prisma.order.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalPrice: 5000 },
      })
      ;(prisma.order.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(25)

      const result = await getDashboardMetrics()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        totalRevenue: 5000,
        totalOrders: 50,
        totalUsers: 100,
        totalProducts: 25,
      })
    })

    it('should handle zero revenue', async () => {
      ;(prisma.order.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalPrice: null },
      })
      ;(prisma.order.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.user.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      const result = await getDashboardMetrics()

      expect(result.success).toBe(true)
      expect(result.data?.totalRevenue).toBe(0)
    })

    it('should redirect non-admin users', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { role: 'user' },
      })

      await getDashboardMetrics()

      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should handle errors', async () => {
      ;(prisma.order.aggregate as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await getDashboardMetrics()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('getSalesChartData', () => {
    it('should return sales data for last 30 days', async () => {
      const mockOrders = [
        {
          totalPrice: 100,
          paidAt: new Date('2025-01-01'),
        },
        {
          totalPrice: 200,
          paidAt: new Date('2025-01-01'),
        },
      ]
      ;(prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders)

      const result = await getSalesChartData()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.length).toBe(30)
    })

    it('should handle empty sales data', async () => {
      ;(prisma.order.findMany as jest.Mock).mockResolvedValue([])

      const result = await getSalesChartData()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })
  })

  describe('getRecentOrders', () => {
    it('should return recent orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          totalPrice: 100,
          status: 'pending',
          isPaid: true,
          createdAt: new Date(),
          user: { name: 'Test User', email: 'test@example.com' },
        },
      ]
      ;(prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders)

      const result = await getRecentOrders()

      expect(result.success).toBe(true)
      expect(result.data?.length).toBe(1)
      expect(result.data?.[0].userName).toBe('Test User')
    })
  })

  describe('getLowStockProducts', () => {
    it('should return low stock products', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Low Stock Product',
          slug: 'low-stock',
          stock: 2,
          price: 50,
          images: ['/image.jpg'],
        },
      ]
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)

      const result = await getLowStockProducts()

      expect(result.success).toBe(true)
      expect(result.data?.length).toBe(1)
      expect(result.data?.[0].stock).toBe(2)
    })
  })

  describe('getTopSellingProducts', () => {
    it('should return top selling products', async () => {
      const mockTopProducts = [
        {
          productId: 'prod-1',
          _sum: { quantity: 100 },
          _count: { productId: 10 },
        },
      ]
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Top Product',
          slug: 'top-product',
          price: 100,
          images: ['/image.jpg'],
        },
      ]
      ;(prisma.orderItem.groupBy as jest.Mock).mockResolvedValue(mockTopProducts)
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)

      const result = await getTopSellingProducts()

      expect(result.success).toBe(true)
      expect(result.data?.length).toBe(1)
      expect(result.data?.[0].totalSales).toBe(100)
    })
  })
})
