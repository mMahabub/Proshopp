import { redirect } from 'next/navigation'
import CheckoutSteps from '@/components/checkout/checkout-steps'
import StripeProvider from '@/components/checkout/stripe-provider'
import {
  createPaymentIntent,
  getPaymentDetails,
} from '@/lib/actions/payment.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatNumberWithDecimal } from '@/lib/utils'
import Image from 'next/image'

export default async function PaymentPage() {
  // Check if shipping address exists
  const shippingAddress = await getShippingAddress()
  if (!shippingAddress) {
    redirect('/checkout')
  }

  // Get payment details for order summary
  const paymentDetailsResult = await getPaymentDetails()
  if (!paymentDetailsResult.success || !paymentDetailsResult.data) {
    redirect('/cart')
  }

  const { items, subtotal, tax, total } = paymentDetailsResult.data

  // Create payment intent
  const paymentIntentResult = await createPaymentIntent()
  if (!paymentIntentResult.success || !paymentIntentResult.data) {
    redirect('/cart')
  }

  const { clientSecret, amount } = paymentIntentResult.data

  if (!clientSecret) {
    redirect('/cart')
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <CheckoutSteps currentStep={3} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary - Left Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
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

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${formatNumberWithDecimal(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${formatNumberWithDecimal(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${formatNumberWithDecimal(total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{shippingAddress.fullName}</p>
                  <p>{shippingAddress.streetAddress}</p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.state}{' '}
                    {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form - Right Column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <StripeProvider clientSecret={clientSecret} amount={amount} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
