import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getUserOrders } from '@/lib/actions/order.actions'
import OrderList from '@/components/dashboard/order-list'

export const metadata = {
  title: 'My Orders',
  description: 'View and manage your orders',
}

export default async function OrdersPage() {
  // Check authentication
  const session = await auth()
  if (!session?.user) {
    redirect('/sign-in')
  }

  // Fetch user's orders
  const result = await getUserOrders()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Failed to load orders</h3>
        <p className="text-muted-foreground">
          {result.message || 'An error occurred while fetching your orders.'}
        </p>
      </div>
    )
  }

  // Transform orders data for the component
  const orders = result.data.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    totalPrice: parseFloat(order.totalPrice.toString()),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
    })),
  }))

  return (
    <div className="max-w-6xl mx-auto">
      <OrderList orders={orders} />
    </div>
  )
}
