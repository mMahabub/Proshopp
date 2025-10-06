import CheckoutSteps from '@/components/checkout/checkout-steps'
import AddressForm from '@/components/checkout/address-form'

export default function CheckoutPage() {
  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <CheckoutSteps currentStep={1} />

      {/* Address Form */}
      <div className="mx-auto max-w-2xl">
        <AddressForm />
      </div>
    </div>
  )
}
