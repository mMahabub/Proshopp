'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { saveShippingAddress } from '@/lib/actions/checkout.actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Saving...' : 'Continue to Review'}
    </Button>
  )
}

interface AddressFormProps {
  defaultValues?: {
    fullName?: string
    streetAddress?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

export default function AddressForm({ defaultValues }: AddressFormProps) {
  const [state, formAction] = useActionState(saveShippingAddress, undefined)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Shipping Address</h2>
        <p className="text-muted-foreground">
          Enter your shipping address to continue
        </p>
      </div>

      {/* Error Message */}
      {state?.success === false && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      {/* Success Message */}
      {state?.success === true && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-400">
          {state.message}
        </div>
      )}

      {/* Address Form */}
      <form action={formAction} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={defaultValues?.fullName}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="John Doe"
          />
        </div>

        {/* Street Address Field */}
        <div className="space-y-2">
          <label htmlFor="streetAddress" className="text-sm font-medium">
            Street Address
          </label>
          <input
            id="streetAddress"
            name="streetAddress"
            type="text"
            required
            defaultValue={defaultValues?.streetAddress}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="123 Main St, Apt 4B"
          />
        </div>

        {/* City and State Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              defaultValue={defaultValues?.city}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="New York"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium">
              State / Province
            </label>
            <input
              id="state"
              name="state"
              type="text"
              required
              defaultValue={defaultValues?.state}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="NY"
            />
          </div>
        </div>

        {/* Postal Code and Country Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="postalCode" className="text-sm font-medium">
              Postal Code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              required
              defaultValue={defaultValues?.postalCode}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="10001"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              defaultValue={defaultValues?.country}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="United States"
            />
          </div>
        </div>

        {/* Submit Button */}
        <SubmitButton />
      </form>
    </div>
  )
}
