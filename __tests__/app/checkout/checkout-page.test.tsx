import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import CheckoutPage from '@/app/(root)/checkout/page'

// Mock child components
jest.mock('@/components/checkout/checkout-steps', () => {
  return function MockCheckoutSteps({ currentStep }: { currentStep: number }) {
    return <div data-testid="checkout-steps">Step {currentStep}</div>
  }
})

jest.mock('@/components/checkout/address-form', () => {
  return function MockAddressForm() {
    return <div data-testid="address-form">Address Form</div>
  }
})

// Mock server actions
jest.mock('@/lib/actions/checkout.actions', () => ({
  saveShippingAddress: jest.fn(),
  getShippingAddress: jest.fn(),
}))

describe('CheckoutPage', () => {
  it('should render the checkout steps', () => {
    render(<CheckoutPage />)

    const checkoutSteps = screen.getByTestId('checkout-steps')
    expect(checkoutSteps).toBeInTheDocument()
    expect(checkoutSteps).toHaveTextContent('Step 1')
  })

  it('should render the address form', () => {
    render(<CheckoutPage />)

    const addressForm = screen.getByTestId('address-form')
    expect(addressForm).toBeInTheDocument()
  })

  it('should set current step to 1', () => {
    render(<CheckoutPage />)

    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('should have proper layout structure', () => {
    const { container } = render(<CheckoutPage />)

    // Check that there's a main container with space-y-8
    const mainContainer = container.querySelector('.space-y-8')
    expect(mainContainer).toBeInTheDocument()
  })

  it('should center the address form with max width', () => {
    const { container } = render(<CheckoutPage />)

    // Check for centered form container
    const formContainer = container.querySelector('.max-w-2xl')
    expect(formContainer).toBeInTheDocument()
  })
})
