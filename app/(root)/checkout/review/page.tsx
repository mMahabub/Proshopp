import { redirect } from 'next/navigation'
import CheckoutSteps from '@/components/checkout/checkout-steps'
import OrderReview from '@/components/checkout/order-review'
import { getPaymentDetails } from '@/lib/actions/payment.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'

export default async function ReviewPage() {
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

  // Convert Decimal prices to numbers for the component
  const formattedItems = items.map((item) => ({
    ...item,
    price: parseFloat(item.price.toString()),
  }))

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <CheckoutSteps currentStep={2} />

      {/* Order Review */}
      <OrderReview
        items={formattedItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
        shippingAddress={shippingAddress}
      />
    </div>
  )
}
