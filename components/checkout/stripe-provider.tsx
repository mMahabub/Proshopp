'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/utils/stripe-client'
import PaymentForm from '@/components/checkout/payment-form'

interface StripeProviderProps {
  clientSecret: string
  amount: number
}

export default function StripeProvider({ clientSecret, amount }: StripeProviderProps) {
  const stripePromise = getStripe()

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <PaymentForm amount={amount} />
    </Elements>
  )
}
