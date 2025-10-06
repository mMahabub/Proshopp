/**
 * Tests for Stripe client-side configuration
 */

// Mock @stripe/stripe-js before importing
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}))

describe('Stripe Client Configuration', () => {
  let mockLoadStripe: jest.Mock
  let getStripe: () => Promise<any>

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Reset modules to clear the singleton cache
    jest.resetModules()

    // Re-import fresh mocks and module
    const stripeJs = require('@stripe/stripe-js')
    mockLoadStripe = stripeJs.loadStripe as jest.Mock

    // Re-import getStripe to get fresh instance
    const stripeClient = require('@/lib/utils/stripe-client')
    getStripe = stripeClient.getStripe
  })

  describe('getStripe', () => {
    it('should load Stripe with publishable key', async () => {
      const mockStripeInstance = { id: 'mock-stripe' } as any
      mockLoadStripe.mockResolvedValue(mockStripeInstance)

      const stripe = await getStripe()

      expect(mockLoadStripe).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      )
      expect(stripe).toBe(mockStripeInstance)
    })

    it('should return same instance on multiple calls (singleton)', async () => {
      const mockStripeInstance = { id: 'mock-stripe' } as any
      mockLoadStripe.mockResolvedValue(mockStripeInstance)

      const stripe1 = await getStripe()
      const stripe2 = await getStripe()
      const stripe3 = await getStripe()

      // loadStripe should only be called once due to singleton pattern
      expect(mockLoadStripe).toHaveBeenCalledTimes(1)
      expect(stripe1).toBe(stripe2)
      expect(stripe2).toBe(stripe3)
    })

    it('should handle loadStripe returning null', async () => {
      mockLoadStripe.mockResolvedValue(null)

      const stripe = await getStripe()

      expect(stripe).toBeNull()
    })

    it('should cache the promise to prevent multiple loadStripe calls', async () => {
      const mockStripeInstance = { id: 'mock-stripe' } as any
      mockLoadStripe.mockResolvedValue(mockStripeInstance)

      // Call getStripe multiple times immediately (before promise resolves)
      const promises = [getStripe(), getStripe(), getStripe()]

      await Promise.all(promises)

      // Should only call loadStripe once, even with concurrent calls
      expect(mockLoadStripe).toHaveBeenCalledTimes(1)
    })
  })
})
