import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import OrderConfirmation from '@/components/checkout/order-confirmation'
import { createOrder } from '@/lib/actions/order.actions'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function OrderConfirmationContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get payment intent client secret from URL
  const paymentIntentClientSecret = searchParams.payment_intent_client_secret as
    | string
    | undefined

  if (!paymentIntentClientSecret) {
    redirect('/cart')
  }

  // Extract payment intent ID from client secret
  // Format: pi_xxx_secret_yyy → we want pi_xxx
  const paymentIntentId = paymentIntentClientSecret.split('_secret_')[0]

  if (!paymentIntentId) {
    redirect('/cart')
  }

  // Create order with payment intent ID
  const result = await createOrder(paymentIntentId)

  if (!result.success || !result.data) {
    redirect('/cart')
  }

  const order = result.data

  // Transform order data to match OrderConfirmation component props
  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    subtotal: parseFloat(order.subtotal.toString()),
    tax: parseFloat(order.tax.toString()),
    totalPrice: parseFloat(order.totalPrice.toString()),
    shippingAddress: order.shippingAddress as {
      fullName: string
      streetAddress: string
      city: string
      state: string
      postalCode: string
      country: string
    },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: parseFloat(item.price.toString()),
      quantity: item.quantity,
    })),
  }

  return <OrderConfirmation order={orderData} />
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-semibold">Processing your order...</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we confirm your order details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Suspense fallback={<LoadingFallback />}>
        <OrderConfirmationContent searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  )
}
