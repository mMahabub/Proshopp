/**
 * Tests for Stripe server-side configuration
 */

// Mock Stripe module before importing
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {},
    customers: {},
  }))
})

import { formatAmountForStripe, formatAmountFromStripe } from '@/lib/utils/stripe'

describe('Stripe Server Configuration', () => {
  describe('formatAmountForStripe', () => {
    it('should convert dollars to cents correctly', () => {
      expect(formatAmountForStripe(10)).toBe(1000)
      expect(formatAmountForStripe(10.99)).toBe(1099)
      expect(formatAmountForStripe(0.5)).toBe(50)
      expect(formatAmountForStripe(100.55)).toBe(10055)
    })

    it('should handle zero amount', () => {
      expect(formatAmountForStripe(0)).toBe(0)
    })

    it('should round fractional cents correctly', () => {
      expect(formatAmountForStripe(10.995)).toBe(1100) // Rounds up
      expect(formatAmountForStripe(10.994)).toBe(1099) // Rounds down
      expect(formatAmountForStripe(10.999)).toBe(1100) // Rounds up
    })

    it('should handle large amounts', () => {
      expect(formatAmountForStripe(1000000)).toBe(100000000)
      expect(formatAmountForStripe(999999.99)).toBe(99999999)
    })

    it('should handle very small amounts', () => {
      expect(formatAmountForStripe(0.01)).toBe(1)
      expect(formatAmountForStripe(0.1)).toBe(10)
    })

    it('should handle negative amounts', () => {
      expect(formatAmountForStripe(-10)).toBe(-1000)
      expect(formatAmountForStripe(-10.99)).toBe(-1099)
    })
  })

  describe('formatAmountFromStripe', () => {
    it('should convert cents to dollars correctly', () => {
      expect(formatAmountFromStripe(1000)).toBe(10)
      expect(formatAmountFromStripe(1099)).toBe(10.99)
      expect(formatAmountFromStripe(50)).toBe(0.5)
      expect(formatAmountFromStripe(10055)).toBe(100.55)
    })

    it('should handle zero amount', () => {
      expect(formatAmountFromStripe(0)).toBe(0)
    })

    it('should handle single cent', () => {
      expect(formatAmountFromStripe(1)).toBe(0.01)
      expect(formatAmountFromStripe(10)).toBe(0.1)
    })

    it('should handle large amounts', () => {
      expect(formatAmountFromStripe(100000000)).toBe(1000000)
      expect(formatAmountFromStripe(99999999)).toBe(999999.99)
    })

    it('should handle negative amounts', () => {
      expect(formatAmountFromStripe(-1000)).toBe(-10)
      expect(formatAmountFromStripe(-1099)).toBe(-10.99)
    })
  })

  describe('Round-trip conversion', () => {
    it('should maintain precision through round-trip conversion', () => {
      const amounts = [0, 0.01, 0.1, 1, 10, 10.99, 100, 1000, 999.99]

      amounts.forEach((amount) => {
        const cents = formatAmountForStripe(amount)
        const dollars = formatAmountFromStripe(cents)
        expect(dollars).toBeCloseTo(amount, 2)
      })
    })

    it('should handle edge case amounts in round-trip', () => {
      const edgeCases = [0.01, 0.99, 9.99, 99.99, 999.99]

      edgeCases.forEach((amount) => {
        const cents = formatAmountForStripe(amount)
        const dollars = formatAmountFromStripe(cents)
        expect(dollars).toBe(amount)
      })
    })
  })
})
