'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Printer } from 'lucide-react'
import { updateOrderStatus } from '@/lib/actions/order.actions'
import { toast } from 'sonner'
import { formatNumberWithDecimal } from '@/lib/utils'

interface OrderDetailProps {
  order: {
    id: string
    orderNumber: string
    status: string
    createdAt: Date
    updatedAt: Date
    subtotal: number
    tax: number
    shippingCost: number
    totalPrice: number
    shippingAddress: {
      fullName: string
      streetAddress: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    paymentMethod: string | null
    paymentResult: {
      paymentIntentId?: string
    } | null
    isPaid: boolean
    paidAt: Date | null
    isDelivered: boolean
    deliveredAt: Date | null
    customerName: string
    customerEmail: string
    items: Array<{
      id: string
      productId: string
      name: string
      slug: string
      image: string
      price: number
      quantity: number
    }>
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setIsUpdating(true)

      const result = await updateOrderStatus({
        orderId: order.id,
        status: newStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      })

      if (result.success) {
        toast.success('Order status updated successfully')
        router.refresh()
      } else {
        toast.error(result.message || 'Failed to update order status')
      }
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/orders')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-2">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content - Left Column (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                    <div className="relative h-20 w-20 rounded-md border overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-muted-foreground">
                          ${formatNumberWithDecimal(item.price)} each
                        </p>
                        <p className="font-semibold">
                          ${formatNumberWithDecimal(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${formatNumberWithDecimal(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${formatNumberWithDecimal(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shippingCost === 0
                      ? 'FREE'
                      : `$${formatNumberWithDecimal(order.shippingCost)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${formatNumberWithDecimal(order.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.streetAddress}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.country}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod || 'N/A'}
                  </span>
                </div>
                {order.paymentResult?.paymentIntentId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Intent ID</span>
                    <span className="font-mono text-xs">
                      {order.paymentResult.paymentIntentId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge
                    className={
                      order.isPaid ? 'bg-green-500' : 'bg-yellow-500'
                    }
                  >
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid On</span>
                    <span>{formatDate(order.paidAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <Badge
                  className={`${statusColors[order.status] || 'bg-gray-500'} text-white`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Update Status
                </label>
                <Select
                  defaultValue={order.status}
                  onValueChange={handleStatusUpdate}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Status</span>
                  <Badge
                    className={
                      order.isDelivered ? 'bg-green-500' : 'bg-yellow-500'
                    }
                  >
                    {order.isDelivered ? 'Delivered' : 'Not Delivered'}
                  </Badge>
                </div>
                {order.isDelivered && order.deliveredAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivered On</span>
                    <span>{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm">{order.customerEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(order.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
