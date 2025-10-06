'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Printer, ShoppingBag } from 'lucide-react'
import { formatNumberWithDecimal } from '@/lib/utils'

interface OrderConfirmationProps {
  order: {
    id: string
    orderNumber: string
    status: string
    createdAt: Date
    subtotal: number
    tax: number
    totalPrice: number
    shippingAddress: {
      fullName: string
      streetAddress: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    items: Array<{
      id: string
      name: string
      slug: string
      image: string
      price: number
      quantity: number
    }>
  }
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  const router = useRouter()

  // Calculate estimated delivery (7-10 business days from now)
  const estimatedDeliveryStart = new Date(order.createdAt)
  estimatedDeliveryStart.setDate(estimatedDeliveryStart.getDate() + 7)

  const estimatedDeliveryEnd = new Date(order.createdAt)
  estimatedDeliveryEnd.setDate(estimatedDeliveryEnd.getDate() + 10)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your order. We&apos;ve sent a confirmation email to your inbox.
          </p>
        </div>
      </div>

      {/* Order Details Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order Details</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="print:hidden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-semibold">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Status</p>
              <p className="font-semibold capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-semibold">
                {formatDate(estimatedDeliveryStart)} - {formatDate(estimatedDeliveryEnd)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${formatNumberWithDecimal(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

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
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${formatNumberWithDecimal(order.totalPrice)}</span>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <div className="text-sm text-muted-foreground">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <Button
          onClick={() => router.push(`/orders/${order.id}`)}
          className="flex-1"
          size="lg"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          View Order
        </Button>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
