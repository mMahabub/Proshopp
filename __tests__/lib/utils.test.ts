import { cn, convertToPlainObject, formatNumberWithDecimal } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', false && 'hidden', 'show')).toBe('base show')
    })

    it('should merge conflicting Tailwind classes', () => {
      // tailwind-merge should keep the last class when they conflict
      expect(cn('p-4', 'p-6')).toBe('p-6')
    })

    it('should handle empty strings', () => {
      expect(cn('base', '', 'end')).toBe('base end')
    })

    it('should handle single class', () => {
      expect(cn('single')).toBe('single')
    })
  })

  describe('convertToPlainObject', () => {
    it('should convert object to plain object', () => {
      const input = { name: 'Test', value: 123 }
      const result = convertToPlainObject(input)
      expect(result).toEqual(input)
    })

    it('should handle nested objects', () => {
      const input = { user: { name: 'John', age: 30 } }
      const result = convertToPlainObject(input)
      expect(result).toEqual(input)
    })

    it('should handle arrays', () => {
      const input = { items: [1, 2, 3] }
      const result = convertToPlainObject(input)
      expect(result).toEqual(input)
    })

    it('should handle null and undefined', () => {
      const input = { a: null, b: undefined }
      const result = convertToPlainObject(input)
      expect(result).toEqual({ a: null })
    })

    it('should handle Date objects by converting to string', () => {
      const date = new Date('2025-01-01')
      const input = { date }
      const result = convertToPlainObject(input)
      // Date should be converted to ISO string
      expect(typeof result.date).toBe('string')
    })
  })

  describe('formatNumberWithDecimal', () => {
    it('should format integer with two decimal places', () => {
      // This test will FAIL initially due to the bug (uses comma instead of dot)
      expect(formatNumberWithDecimal(10)).toBe('10.00')
    })

    it('should format single decimal place', () => {
      expect(formatNumberWithDecimal(10.5)).toBe('10.50')
    })

    it('should format two decimal places', () => {
      expect(formatNumberWithDecimal(99.99)).toBe('99.99')
    })

    it('should handle zero', () => {
      expect(formatNumberWithDecimal(0)).toBe('0.00')
    })

    it('should handle large numbers', () => {
      expect(formatNumberWithDecimal(1234567.89)).toBe('1234567.89')
    })

    it('should handle very small decimals', () => {
      expect(formatNumberWithDecimal(0.01)).toBe('0.01')
    })

    it('should handle numbers with more than 2 decimal places', () => {
      expect(formatNumberWithDecimal(10.999)).toBe('10.99')
    })
  })
})
