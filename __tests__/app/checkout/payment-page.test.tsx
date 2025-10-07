import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PaymentPage from '@/app/(root)/checkout/payment/page'
import { redirect } from 'next/navigation'
import {
  createPaymentIntent,
  getPaymentDetails,
} from '@/lib/actions/payment.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'

// Mock @auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

// Mock Stripe
jest.mock('@/lib/utils/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
    },
  },
  formatAmountForStripe: jest.fn((amount: number) => Math.round(amount * 100)),
}))

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@/lib/actions/payment.actions')
jest.mock('@/lib/actions/checkout.actions')
jest.mock('@/lib/actions/cart.actions')
jest.mock('@/lib/utils/stripe-client', () => ({
  getStripe: jest.fn(() => Promise.resolve(null)),
}))

// Mock child components
jest.mock('@/components/checkout/checkout-steps', () => {
  return function MockCheckoutSteps({ currentStep }: { currentStep: number }) {
    return <div data-testid="checkout-steps">Step {currentStep}</div>
  }
})

jest.mock('@/components/checkout/payment-form', () => {
  return function MockPaymentForm({ amount }: { amount: number }) {
    return <div data-testid="payment-form">Payment Form - ${amount}</div>
  }
})

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
}))

describe('PaymentPage', () => {
  const mockGetShippingAddress = getShippingAddress as jest.MockedFunction<
    typeof getShippingAddress
  >
  const mockGetPaymentDetails = getPaymentDetails as jest.MockedFunction<
    typeof getPaymentDetails
  >
  const mockCreatePaymentIntent = createPaymentIntent as jest.MockedFunction<
    typeof createPaymentIntent
  >
  const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockShippingAddress = {
    fullName: 'John Doe',
    streetAddress: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
  }

  const mockPaymentDetails = {
    success: true,
    data: {
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          price: '29.99',
          product: {
            id: 'product-1',
            name: 'Test Product',
            images: ['/test.jpg'],
          },
        },
      ],
      subtotal: 59.98,
      tax: 5.998,
      total: 65.978,
    },
  }

  const mockPaymentIntent = {
    success: true,
    data: {
      clientSecret: 'pi_test_secret_123',
      amount: 65.978,
      subtotal: 59.98,
      tax: 5.998,
    },
  }

  describe('Rendering', () => {
    it('should render checkout steps with step 3', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByTestId('checkout-steps')).toHaveTextContent('Step 3')
    })

    it('should render order summary title', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })

    it('should render payment title', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('Payment')).toBeInTheDocument()
    })

    it('should render Stripe Elements', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
    })

    it('should render payment form', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByTestId('payment-form')).toBeInTheDocument()
    })
  })

  describe('Order Summary', () => {
    it('should display cart items', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText(/Qty: 2/)).toBeInTheDocument()
    })

    it('should display subtotal', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('Subtotal')).toBeInTheDocument()
      expect(screen.getAllByText('$59.98').length).toBeGreaterThan(0)
    })

    it('should display tax', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('Tax')).toBeInTheDocument()
      expect(screen.getAllByText(/\$[56]\.\d{2}/).length).toBeGreaterThan(0)
    })

    it('should display total', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getAllByText(/\$65\.\d{2}/).length).toBeGreaterThan(0)
    })
  })

  describe('Shipping Address Display', () => {
    it('should display shipping address title', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('Shipping Address')).toBeInTheDocument()
    })

    it('should display full name', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display street address', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('123 Main St')).toBeInTheDocument()
    })

    it('should display city, state, and postal code', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText(/New York, NY 10001/)).toBeInTheDocument()
    })

    it('should display country', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      render(await PaymentPage())

      expect(screen.getByText('United States')).toBeInTheDocument()
    })
  })

  describe('Redirects', () => {
    it('should redirect to checkout if no shipping address', async () => {
      mockGetShippingAddress.mockResolvedValue(null)

      try {
        await PaymentPage()
      } catch (error) {
        // Redirect may throw in tests
      }

      expect(mockRedirect).toHaveBeenCalledWith('/checkout')
    })

    it('should redirect to cart if payment details fail', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue({
        success: false,
        message: 'Cart is empty',
      } as any)

      try {
        await PaymentPage()
      } catch (error) {
        // Redirect may throw in tests
      }

      expect(mockRedirect).toHaveBeenCalledWith('/cart')
    })

    it('should redirect to cart if no payment details data', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue({
        success: true,
        data: null,
      } as any)

      try {
        await PaymentPage()
      } catch (error) {
        // Redirect may throw in tests
      }

      expect(mockRedirect).toHaveBeenCalledWith('/cart')
    })

    it('should redirect to cart if payment intent fails', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue({
        success: false,
        message: 'Failed to create payment intent',
      } as any)

      try {
        await PaymentPage()
      } catch (error) {
        // Redirect may throw in tests
      }

      expect(mockRedirect).toHaveBeenCalledWith('/cart')
    })

    it('should redirect to cart if no client secret', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue({
        success: true,
        data: {
          clientSecret: null,
          amount: 65.978,
          subtotal: 59.98,
          tax: 5.998,
        },
      } as any)

      try {
        await PaymentPage()
      } catch (error) {
        // Redirect may throw in tests
      }

      expect(mockRedirect).toHaveBeenCalledWith('/cart')
    })
  })

  describe('Layout', () => {
    it('should have grid layout', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      const { container } = render(await PaymentPage())

      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should have responsive columns', async () => {
      mockGetShippingAddress.mockResolvedValue(mockShippingAddress)
      mockGetPaymentDetails.mockResolvedValue(mockPaymentDetails as any)
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent as any)

      const { container } = render(await PaymentPage())

      const gridContainer = container.querySelector('.lg\\:grid-cols-3')
      expect(gridContainer).toBeInTheDocument()
    })
  })
})
