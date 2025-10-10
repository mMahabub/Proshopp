import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import OrderDetail from '@/components/admin/order-detail'
import { getOrder } from '@/lib/actions/order.actions'

export const metadata: Metadata = {
  title: 'Order Details - Admin',
  description: 'View and manage order details',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  // Await params (Next.js 15 compatibility)
  const { id } = await params

  // Fetch order data
  const result = await getOrder(id)

  // Handle errors - redirect to orders list
  if (!result.success || !result.data) {
    redirect('/admin/orders')
  }

  const order = result.data

  // Transform order data for client component (convert Decimal to number)
  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    subtotal: parseFloat(order.subtotal.toString()),
    tax: parseFloat(order.tax.toString()),
    shippingCost: parseFloat(order.shippingCost.toString()),
    totalPrice: parseFloat(order.totalPrice.toString()),
    shippingAddress: order.shippingAddress as {
      fullName: string
      streetAddress: string
      city: string
      state: string
      postalCode: string
      country: string
    },
    paymentMethod: order.paymentMethod,
    paymentResult: order.paymentResult as { paymentIntentId?: string } | null,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    customerName: order.user.name,
    customerEmail: order.user.email,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: parseFloat(item.price.toString()),
      quantity: item.quantity,
    })),
  }

  return <OrderDetail order={orderData} />
}
