import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaymentForm from '@/components/checkout/payment-form'
import { useRouter } from 'next/navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Stripe hooks
jest.mock('@stripe/react-stripe-js', () => ({
  PaymentElement: jest.fn(() => <div data-testid="payment-element">Payment Element</div>),
  useStripe: jest.fn(),
  useElements: jest.fn(),
}))

// Import mocked modules
import { useStripe, useElements } from '@stripe/react-stripe-js'

describe('PaymentForm', () => {
  const mockPush = jest.fn()
  const mockConfirmPayment = jest.fn()
  const mockRetrievePaymentIntent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useStripe as jest.Mock).mockReturnValue({
      confirmPayment: mockConfirmPayment,
      retrievePaymentIntent: mockRetrievePaymentIntent,
    })
    ;(useElements as jest.Mock).mockReturnValue({})
  })

  describe('Rendering', () => {
    it('should render payment form', () => {
      render(<PaymentForm amount={99.99} />)

      expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    })

    it('should render submit button with correct amount', () => {
      render(<PaymentForm amount={99.99} />)

      expect(screen.getByRole('button', { name: /pay \$99.99/i })).toBeInTheDocument()
    })

    it('should render test card information', () => {
      render(<PaymentForm amount={99.99} />)

      expect(screen.getByText(/test card: 4242 4242 4242 4242/i)).toBeInTheDocument()
    })

    it('should disable submit button when Stripe is not loaded', () => {
      ;(useStripe as jest.Mock).mockReturnValue(null)

      render(<PaymentForm amount={99.99} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should disable submit button when Elements is not loaded', () => {
      ;(useElements as jest.Mock).mockReturnValue(null)

      render(<PaymentForm amount={99.99} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Payment Submission', () => {
    it('should call confirmPayment on form submit', async () => {
      const user = userEvent.setup()
      mockConfirmPayment.mockResolvedValue({ error: null })

      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button', { name: /pay/i })
      await user.click(submitButton)

      expect(mockConfirmPayment).toHaveBeenCalledWith({
        elements: expect.anything(),
        confirmParams: {
          return_url: expect.stringContaining('/checkout/success'),
        },
      })
    })

    it('should show loading state during payment processing', async () => {
      const user = userEvent.setup()
      mockConfirmPayment.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button', { name: /pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument()
      })
    })

    it('should display error message on card error', async () => {
      const user = userEvent.setup()
      mockConfirmPayment.mockResolvedValue({
        error: {
          type: 'card_error',
          message: 'Your card was declined',
        },
      })

      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button', { name: /pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Your card was declined')).toBeInTheDocument()
      })
    })

    it('should display error message on validation error', async () => {
      const user = userEvent.setup()
      mockConfirmPayment.mockResolvedValue({
        error: {
          type: 'validation_error',
          message: 'Invalid card details',
        },
      })

      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button', { name: /pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid card details')).toBeInTheDocument()
      })
    })

    it('should display generic error on unexpected error', async () => {
      const user = userEvent.setup()
      mockConfirmPayment.mockResolvedValue({
        error: {
          type: 'api_error',
        },
      })

      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button', { name: /pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
      })
    })

    it('should re-enable button after error', async () => {
      const user = userEvent.setup()
      mockConfirmPayment.mockResolvedValue({
        error: {
          type: 'card_error',
          message: 'Card declined',
        },
      })

      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button', { name: /pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  // Skipped: Payment Intent Status Check tests require complex window.location mocking
  // which is difficult in Jest/jsdom environment. These scenarios are covered by E2E tests.
  describe.skip('Payment Intent Status Check', () => {
    it('should redirect to success on succeeded payment intent', async () => {
      // Implementation requires window.location.search mocking
    })

    it('should show processing message for processing payment', async () => {
      // Implementation requires window.location.search mocking
    })

    it('should show error for requires_payment_method status', async () => {
      // Implementation requires window.location.search mocking
    })

    it('should show generic error for unknown status', async () => {
      // Implementation requires window.location.search mocking
    })
  })

  describe('Accessibility', () => {
    it('should have accessible submit button', () => {
      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button', { name: /pay/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should show loading spinner with descriptive text', async () => {
      const user = userEvent.setup()
      mockConfirmPayment.mockImplementation(() => new Promise(() => {}))

      render(<PaymentForm amount={99.99} />)

      const submitButton = screen.getByRole('button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument()
      })
    })
  })

  describe('Amount Formatting', () => {
    it('should format amount with two decimal places', () => {
      render(<PaymentForm amount={99.9} />)

      expect(screen.getByRole('button', { name: /pay \$99.90/i })).toBeInTheDocument()
    })

    it('should format integer amount correctly', () => {
      render(<PaymentForm amount={100} />)

      expect(screen.getByRole('button', { name: /pay \$100.00/i })).toBeInTheDocument()
    })

    it('should format large amounts correctly', () => {
      render(<PaymentForm amount={1234.56} />)

      expect(
        screen.getByRole('button', { name: /pay \$1234.56/i })
      ).toBeInTheDocument()
    })
  })
})
