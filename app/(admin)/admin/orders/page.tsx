import { getAllOrders } from '@/lib/actions/admin.actions'
import OrdersTable from '@/components/admin/orders-table'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Orders Management - Admin',
  description: 'Manage all orders',
}

interface SearchParams {
  page?: string
  status?: string
  search?: string
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status = params.status || ''
  const search = params.search || ''

  const ordersResult = await getAllOrders({
    page,
    limit: 10,
    status: status || undefined,
    search: search || undefined,
  })

  if (!ordersResult.success) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage all orders</p>
        </div>
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading orders</p>
          <p className="text-sm mt-1">{ordersResult.error}</p>
        </div>
      </div>
    )
  }

  const { orders, pagination } = ordersResult.data!

  const handleFilterChange = async (status: string, search: string, page: number) => {
    'use server'
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())

    redirect(`/admin/orders${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">
          Manage all orders ({pagination.total} total)
        </p>
      </div>

      <OrdersTable
        initialOrders={orders}
        initialPagination={pagination}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
