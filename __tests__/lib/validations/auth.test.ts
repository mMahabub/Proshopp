import {
  signUpSchema,
  signInSchema,
  emailSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

describe('Auth Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('should validate valid sign-up data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject name less than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject name more than 50 characters', () => {
      const invalidData = {
        name: 'J'.repeat(51),
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 50 characters')
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email')
      }
    })

    it('should reject password less than 8 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 8 characters')
      }
    })

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('uppercase letter')
      }
    })

    it('should reject password without number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('number')
      }
    })

    it('should reject when passwords do not match', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('do not match')
      }
    })
  })

  describe('signInSchema', () => {
    it('should validate valid sign-in data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      }

      const result = signInSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email')
      }
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required')
      }
    })
  })

  describe('emailSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        email: 'john@example.com',
      }

      const result = emailSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      }

      const result = emailSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email')
      }
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate valid password reset data', () => {
      const validData = {
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }

      const result = resetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject password less than 8 characters', () => {
      const invalidData = {
        password: 'Pass1',
        confirmPassword: 'Pass1',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 8 characters')
      }
    })

    it('should reject password without uppercase', () => {
      const invalidData = {
        password: 'password123',
        confirmPassword: 'password123',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('uppercase')
      }
    })

    it('should reject password without number', () => {
      const invalidData = {
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('number')
      }
    })

    it('should reject when passwords do not match', () => {
      const invalidData = {
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('do not match')
      }
    })
  })
})
