'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { shippingAddressSchema } from '@/lib/validations/checkout'

// Helper to check if error is a redirect
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  )
}

// Save shipping address to cookies and redirect to payment
export async function saveShippingAddress(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Extract and validate form data
    const data = {
      fullName: formData.get('fullName') as string,
      streetAddress: formData.get('streetAddress') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
    }

    const validatedData = shippingAddressSchema.parse(data)

    // Store address in cookies for checkout process
    const cookieStore = await cookies()
    cookieStore.set(
      'shipping_address',
      JSON.stringify(validatedData),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      }
    )

    // Redirect to review page
    redirect('/checkout/review')
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}

// Get shipping address from cookies
export async function getShippingAddress() {
  try {
    const cookieStore = await cookies()
    const addressCookie = cookieStore.get('shipping_address')

    if (!addressCookie) {
      return null
    }

    const address = JSON.parse(addressCookie.value)
    return shippingAddressSchema.parse(address)
  } catch (error) {
    console.error('Error getting shipping address:', error)
    return null
  }
}
