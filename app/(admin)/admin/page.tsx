import {
  getDashboardMetrics,
  getSalesChartData,
  getRecentOrders,
  getLowStockProducts,
  getTopSellingProducts,
} from '@/lib/actions/admin.actions'
import MetricCard from '@/components/admin/metric-card'
import SalesChart from '@/components/admin/sales-chart'
import RecentOrdersTable from '@/components/admin/recent-orders-table'
import LowStockAlert from '@/components/admin/low-stock-alert'
import TopProductsList from '@/components/admin/top-products-list'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard overview',
}

export default async function AdminDashboardPage() {
  // Fetch all data in parallel
  const [metricsResult, salesDataResult, ordersResult, lowStockResult, topProductsResult] =
    await Promise.all([
      getDashboardMetrics(),
      getSalesChartData(),
      getRecentOrders(),
      getLowStockProducts(),
      getTopSellingProducts(),
    ])

  // Handle errors - show error message if any fetch fails
  if (
    !metricsResult.success ||
    !salesDataResult.success ||
    !ordersResult.success ||
    !lowStockResult.success ||
    !topProductsResult.success
  ) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to the admin dashboard</p>
        </div>
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading dashboard data</p>
          <p className="text-sm mt-1">
            {metricsResult.error ||
              salesDataResult.error ||
              ordersResult.error ||
              lowStockResult.error ||
              topProductsResult.error}
          </p>
        </div>
      </div>
    )
  }

  const metrics = metricsResult.data!
  const salesData = salesDataResult.data!
  const orders = ordersResult.data!
  const lowStockProducts = lowStockResult.data!
  const topProducts = topProductsResult.data!

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the admin dashboard</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          description="From paid orders"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={ShoppingCart}
          description="All time orders"
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={Users}
          description="Registered users"
        />
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          icon={Package}
          description="In catalog"
        />
      </div>

      {/* Sales Chart */}
      <SalesChart data={salesData} />

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alert */}
        <LowStockAlert products={lowStockProducts} />

        {/* Top Products */}
        <TopProductsList products={topProducts} />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={orders} />
    </div>
  )
}
