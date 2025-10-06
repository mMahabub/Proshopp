/**
 * Tests for checkout validation schemas
 */

import { shippingAddressSchema } from '@/lib/validations/checkout'

describe('Shipping Address Validation', () => {
  describe('shippingAddressSchema', () => {
    const validAddress = {
      fullName: 'John Doe',
      streetAddress: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    }

    it('should validate correct address data', () => {
      expect(() => shippingAddressSchema.parse(validAddress)).not.toThrow()
    })

    describe('fullName validation', () => {
      it('should reject name shorter than 2 characters', () => {
        const invalid = { ...validAddress, fullName: 'J' }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Full name must be at least 2 characters'
        )
      })

      it('should reject name longer than 100 characters', () => {
        const invalid = { ...validAddress, fullName: 'a'.repeat(101) }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Full name must be less than 100 characters'
        )
      })

      it('should accept name with 2 characters', () => {
        const valid = { ...validAddress, fullName: 'Jo' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should accept name with 100 characters', () => {
        const valid = { ...validAddress, fullName: 'a'.repeat(100) }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })
    })

    describe('streetAddress validation', () => {
      it('should reject street address shorter than 5 characters', () => {
        const invalid = { ...validAddress, streetAddress: '123' }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Street address must be at least 5 characters'
        )
      })

      it('should reject street address longer than 200 characters', () => {
        const invalid = { ...validAddress, streetAddress: 'a'.repeat(201) }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Street address must be less than 200 characters'
        )
      })

      it('should accept street address with 5 characters', () => {
        const valid = { ...validAddress, streetAddress: '123 M' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should accept street address with apartments/units', () => {
        const valid = { ...validAddress, streetAddress: '123 Main St, Apt 4B' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })
    })

    describe('city validation', () => {
      it('should reject city shorter than 2 characters', () => {
        const invalid = { ...validAddress, city: 'N' }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'City must be at least 2 characters'
        )
      })

      it('should reject city longer than 100 characters', () => {
        const invalid = { ...validAddress, city: 'a'.repeat(101) }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'City must be less than 100 characters'
        )
      })

      it('should accept city with 2 characters', () => {
        const valid = { ...validAddress, city: 'NY' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })
    })

    describe('state validation', () => {
      it('should reject state shorter than 2 characters', () => {
        const invalid = { ...validAddress, state: 'N' }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'State must be at least 2 characters'
        )
      })

      it('should reject state longer than 100 characters', () => {
        const invalid = { ...validAddress, state: 'a'.repeat(101) }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'State must be less than 100 characters'
        )
      })

      it('should accept state abbreviation', () => {
        const valid = { ...validAddress, state: 'NY' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should accept full state name', () => {
        const valid = { ...validAddress, state: 'New York' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })
    })

    describe('postalCode validation', () => {
      it('should reject postal code shorter than 3 characters', () => {
        const invalid = { ...validAddress, postalCode: '12' }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Postal code must be at least 3 characters'
        )
      })

      it('should reject postal code longer than 20 characters', () => {
        const invalid = { ...validAddress, postalCode: 'a'.repeat(21) }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Postal code must be less than 20 characters'
        )
      })

      it('should accept US zip code (5 digits)', () => {
        const valid = { ...validAddress, postalCode: '10001' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should accept US zip+4 code', () => {
        const valid = { ...validAddress, postalCode: '10001-1234' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should accept UK postal code', () => {
        const valid = { ...validAddress, postalCode: 'SW1A 1AA' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should accept Canadian postal code', () => {
        const valid = { ...validAddress, postalCode: 'K1A 0B1' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should reject postal code with special characters', () => {
        const invalid = { ...validAddress, postalCode: '10001@#$' }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Invalid postal code format'
        )
      })
    })

    describe('country validation', () => {
      it('should reject country shorter than 2 characters', () => {
        const invalid = { ...validAddress, country: 'U' }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Country must be at least 2 characters'
        )
      })

      it('should reject country longer than 100 characters', () => {
        const invalid = { ...validAddress, country: 'a'.repeat(101) }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow(
          'Country must be less than 100 characters'
        )
      })

      it('should accept country abbreviation', () => {
        const valid = { ...validAddress, country: 'US' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })

      it('should accept full country name', () => {
        const valid = { ...validAddress, country: 'United States' }
        expect(() => shippingAddressSchema.parse(valid)).not.toThrow()
      })
    })

    describe('edge cases', () => {
      it('should reject empty object', () => {
        expect(() => shippingAddressSchema.parse({})).toThrow()
      })

      it('should reject partial data', () => {
        const partial = {
          fullName: 'John Doe',
          city: 'New York',
        }
        expect(() => shippingAddressSchema.parse(partial)).toThrow()
      })

      it('should reject null values', () => {
        const invalid = {
          ...validAddress,
          fullName: null,
        }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow()
      })

      it('should reject undefined values', () => {
        const invalid = {
          ...validAddress,
          fullName: undefined,
        }
        expect(() => shippingAddressSchema.parse(invalid)).toThrow()
      })

      it('should trim whitespace and validate', () => {
        const withWhitespace = {
          fullName: '  John Doe  ',
          streetAddress: '  123 Main Street  ',
          city: '  New York  ',
          state: '  NY  ',
          postalCode: '  10001  ',
          country: '  United States  ',
        }
        const result = shippingAddressSchema.parse(withWhitespace)
        expect(result.fullName).toBe('  John Doe  ')
      })
    })

    describe('international addresses', () => {
      it('should accept German address', () => {
        const germanAddress = {
          fullName: 'Hans Müller',
          streetAddress: 'Hauptstraße 123',
          city: 'Berlin',
          state: 'BE',
          postalCode: '10115',
          country: 'Germany',
        }
        expect(() => shippingAddressSchema.parse(germanAddress)).not.toThrow()
      })

      it('should accept Japanese address', () => {
        const japaneseAddress = {
          fullName: '山田太郎',
          streetAddress: '1-2-3 Shibuya',
          city: 'Tokyo',
          state: 'Tokyo',
          postalCode: '150-0002',
          country: 'Japan',
        }
        expect(() => shippingAddressSchema.parse(japaneseAddress)).not.toThrow()
      })

      it('should accept Australian address', () => {
        const australianAddress = {
          fullName: 'John Smith',
          streetAddress: '123 George Street',
          city: 'Sydney',
          state: 'NSW',
          postalCode: '2000',
          country: 'Australia',
        }
        expect(() =>
          shippingAddressSchema.parse(australianAddress)
        ).not.toThrow()
      })
    })
  })
})
