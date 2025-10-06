'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { formatNumberWithDecimal } from '@/lib/utils'

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    status: string
    createdAt: Date
    totalPrice: number
    items: Array<{
      id: string
      name: string
      image: string
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

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const handleViewOrder = () => {
    router.push(`/orders/${order.id}`)
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewOrder}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Section: Order Info */}
          <div className="flex-1 space-y-3">
            {/* Order Number and Status */}
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
              <Badge className={statusColors[order.status] || 'bg-gray-500'}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            {/* Order Date */}
            <p className="text-sm text-muted-foreground">
              Ordered on {formatDate(order.createdAt)}
            </p>

            {/* Product Images Preview */}
            <div className="flex items-center gap-2">
              {order.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="relative h-12 w-12 rounded-md border overflow-hidden"
                >
                  <Image
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <span className="text-sm text-muted-foreground">
                  +{order.items.length - 3} more
                </span>
              )}
            </div>

            {/* Item Count */}
            <p className="text-sm text-muted-foreground">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Right Section: Price and Action */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
            {/* Total Price */}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">${formatNumberWithDecimal(order.totalPrice)}</p>
            </div>

            {/* View Details Button */}
            <Button variant="outline" size="sm" className="gap-2">
              View Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
