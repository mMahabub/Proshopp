'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { formatNumberWithDecimal } from '@/lib/utils'
import { Edit } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    slug: string
    images: string[]
  }
}

interface ShippingAddress {
  fullName: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface OrderReviewProps {
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  shippingAddress: ShippingAddress
}

export default function OrderReview({
  items,
  subtotal,
  tax,
  total,
  shippingAddress,
}: OrderReviewProps) {
  const router = useRouter()
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleProceedToPayment = () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    // Proceed to payment page
    router.push('/checkout/payment')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Order Details - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Cart Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/cart')}
              className="text-primary hover:text-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Cart
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image
                      src={item.product.images[0] || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${formatNumberWithDecimal(parseFloat(item.price.toString()) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Shipping Address</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/checkout')}
              className="text-primary hover:text-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Address
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">{shippingAddress.fullName}</p>
              <p className="text-muted-foreground">{shippingAddress.streetAddress}</p>
              <p className="text-muted-foreground">
                {shippingAddress.city}, {shippingAddress.state}{' '}
                {shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{shippingAddress.country}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary - Right Column */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${formatNumberWithDecimal(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${formatNumberWithDecimal(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${formatNumberWithDecimal(total)}</span>
              </div>
            </div>

            <Separator />

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:underline" target="_blank">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </a>
              </Label>
            </div>

            {/* Proceed to Payment Button */}
            <Button
              onClick={handleProceedToPayment}
              disabled={!agreedToTerms}
              className="w-full"
              size="lg"
            >
              Proceed to Payment
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your payment information will be processed securely.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
