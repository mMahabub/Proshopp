'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { redirect } from 'next/navigation'

/**
 * Verify user is admin, redirect if not
 */
async function verifyAdmin() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/')
  }

  return session
}

/**
 * Get dashboard metrics
 * Returns total revenue, orders, and users
 */
export async function getDashboardMetrics() {
  await verifyAdmin()

  try {
    const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
      // Calculate total revenue from paid orders
      prisma.order.aggregate({
        where: {
          isPaid: true,
        },
        _sum: {
          totalPrice: true,
        },
      }),
      // Count total orders
      prisma.order.count(),
      // Count total users
      prisma.user.count(),
      // Count total products
      prisma.product.count(),
    ])

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.totalPrice?.toNumber() || 0,
        totalOrders,
        totalUsers,
        totalProducts,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard metrics',
    }
  }
}

/**
 * Get sales data for the last 30 days
 * Returns daily sales totals
 */
export async function getSalesChartData() {
  await verifyAdmin()

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const orders = await prisma.order.findMany({
      where: {
        isPaid: true,
        paidAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        totalPrice: true,
        paidAt: true,
      },
      orderBy: {
        paidAt: 'asc',
      },
    })

    // Group sales by date
    const salesByDate: Record<string, number> = {}

    // Initialize all dates in the last 30 days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      salesByDate[dateKey] = 0
    }

    // Add actual sales data
    orders.forEach((order: { paidAt: Date | null; totalPrice: { toNumber: () => number } }) => {
      if (order.paidAt) {
        const dateKey = order.paidAt.toISOString().split('T')[0]
        salesByDate[dateKey] = (salesByDate[dateKey] || 0) + order.totalPrice.toNumber()
      }
    })

    // Convert to array and sort by date
    const chartData = Object.entries(salesByDate)
      .map(([date, sales]) => ({
        date,
        sales,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      success: true,
      data: chartData,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sales chart data',
    }
  }
}

/**
 * Get recent orders (last 10)
 */
export async function getRecentOrders() {
  await verifyAdmin()

  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    const formattedOrders = orders.map((order: {
      id: string
      orderNumber: string
      user: { name: string; email: string }
      totalPrice: { toNumber: () => number }
      status: string
      isPaid: boolean
      createdAt: Date
    }) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userName: order.user.name,
      userEmail: order.user.email,
      totalPrice: order.totalPrice.toNumber(),
      status: order.status,
      isPaid: order.isPaid,
      createdAt: order.createdAt,
    }))

    return {
      success: true,
      data: formattedOrders,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent orders',
    }
  }
}

/**
 * Get low stock products (stock < 5)
 */
export async function getLowStockProducts() {
  await verifyAdmin()

  try {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lt: 5,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        price: true,
        images: true,
      },
      orderBy: {
        stock: 'asc',
      },
    })

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: product.images[0] || '/placeholder.png',
    }))

    return {
      success: true,
      data: formattedProducts,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch low stock products',
    }
  }
}

/**
 * Get top selling products
 */
export async function getTopSellingProducts() {
  await verifyAdmin()

  try {
    // Get products with their order counts
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    })

    // Fetch product details
    const productIds = topProducts.map((item: { productId: string }) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
      },
    })

    // Combine data
    const formattedProducts = topProducts.map((item: {
      productId: string
      _sum: { quantity: number | null }
      _count: { productId: number }
    }) => {
      const product = products.find((p) => p.id === item.productId)
      const price = product?.price
      const priceNumber = typeof price === 'string' ? parseFloat(price) : (price || 0)
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        slug: product?.slug || '',
        price: priceNumber,
        image: product?.images[0] || '/placeholder.png',
        totalSales: item._sum.quantity || 0,
        orderCount: item._count.productId,
      }
    })

    return {
      success: true,
      data: formattedProducts,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top selling products',
    }
  }
}

/**
 * Get all orders with pagination, filtering, and search
 */
export async function getAllOrders(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  await verifyAdmin()

  try {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (params?.status) {
      where.status = params.status
    }

    if (params?.search) {
      where.OR = [
        {
          orderNumber: {
            contains: params.search,
            mode: 'insensitive' as const,
          },
        },
        {
          user: {
            name: {
              contains: params.search,
              mode: 'insensitive' as const,
            },
          },
        },
        {
          user: {
            email: {
              contains: params.search,
              mode: 'insensitive' as const,
            },
          },
        },
      ]
    }

    // Get total count
    const totalCount = await prisma.order.count({ where })

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.name,
      customerEmail: order.user.email,
      totalPrice: order.totalPrice.toNumber(),
      status: order.status,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))

    return {
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    }
  }
}

/**
 * Get all users with pagination and search
 */
export async function getAllUsers(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in',
      }
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return {
        success: false,
        message: 'Only administrators can view users',
      }
    }

    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (params?.search) {
      where.OR = [
        {
          name: {
            contains: params.search,
            mode: 'insensitive' as const,
          },
        },
        {
          email: {
            contains: params.search,
            mode: 'insensitive' as const,
          },
        },
      ]
    }

    // Get total count
    const totalCount = await prisma.user.count({ where })

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    return {
      success: true,
      data: {
        users,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch users',
    }
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(input: {
  userId: string
  role: 'user' | 'admin'
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be signed in',
      }
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return {
        success: false,
        message: 'Only administrators can update user roles',
      }
    }

    // Validate role
    if (input.role !== 'user' && input.role !== 'admin') {
      return {
        success: false,
        message: 'Invalid role. Must be "user" or "admin"',
      }
    }

    // Prevent users from changing their own role
    if (input.userId === session.user.id) {
      return {
        success: false,
        message: 'You cannot change your own role',
      }
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: input.userId },
    })

    if (!targetUser) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: input.userId },
      data: { role: input.role },
    })

    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update user role',
    }
  }
}
