import {
  generateVerificationToken,
  createVerificationToken,
  verifyToken,
} from '@/lib/utils/email'
import { prisma } from '@/db/prisma'

// Mock Prisma
jest.mock('@/db/prisma', () => ({
  prisma: {
    verificationToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}))

describe('Email Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateVerificationToken', () => {
    it('should generate a token', () => {
      const token = generateVerificationToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate unique tokens', () => {
      const token1 = generateVerificationToken()
      const token2 = generateVerificationToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate URL-safe tokens', () => {
      const token = generateVerificationToken()
      // base64url tokens should only contain alphanumeric, -, and _
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    })
  })

  describe('createVerificationToken', () => {
    it('should delete existing tokens for email', async () => {
      const email = 'test@example.com'
      const mockToken = 'mock-token'

      ;(prisma.verificationToken.create as jest.Mock).mockResolvedValue({
        identifier: email,
        token: mockToken,
        expires: new Date(),
      })

      await createVerificationToken(email)

      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: email },
      })
    })

    it('should create new token with 24-hour expiry', async () => {
      const email = 'test@example.com'
      const now = new Date()

      ;(prisma.verificationToken.create as jest.Mock).mockResolvedValue({
        identifier: email,
        token: 'mock-token',
        expires: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      })

      await createVerificationToken(email)

      expect(prisma.verificationToken.create).toHaveBeenCalled()
      const createCall = (prisma.verificationToken.create as jest.Mock).mock
        .calls[0][0]

      expect(createCall.data.identifier).toBe(email)
      expect(createCall.data.token).toBeDefined()

      // Check expiry is approximately 24 hours from now
      const expiryTime = createCall.data.expires.getTime()
      const expectedExpiry = now.getTime() + 24 * 60 * 60 * 1000
      expect(Math.abs(expiryTime - expectedExpiry)).toBeLessThan(1000) // Within 1 second
    })

    it('should return the generated token', async () => {
      const email = 'test@example.com'
      const mockToken = 'mock-token-123'

      ;(prisma.verificationToken.create as jest.Mock).mockResolvedValue({
        identifier: email,
        token: mockToken,
        expires: new Date(),
      })

      const token = await createVerificationToken(email)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })

  describe('verifyToken', () => {
    it('should return false for non-existent token', async () => {
      const email = 'test@example.com'
      const token = 'invalid-token'

      ;(prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(
        null
      )

      const result = await verifyToken(email, token)

      expect(result).toBe(false)
    })

    it('should return false and delete expired token', async () => {
      const email = 'test@example.com'
      const token = 'expired-token'
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

      ;(prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue({
        identifier: email,
        token,
        expires: yesterday,
      })

      const result = await verifyToken(email, token)

      expect(result).toBe(false)
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      })
    })

    it('should return true and delete valid token', async () => {
      const email = 'test@example.com'
      const token = 'valid-token'
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

      ;(prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue({
        identifier: email,
        token,
        expires: tomorrow,
      })

      const result = await verifyToken(email, token)

      expect(result).toBe(true)
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      })
    })

    it('should use one-time tokens (delete after verification)', async () => {
      const email = 'test@example.com'
      const token = 'one-time-token'
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

      ;(prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue({
        identifier: email,
        token,
        expires: tomorrow,
      })

      await verifyToken(email, token)

      expect(prisma.verificationToken.delete).toHaveBeenCalledTimes(1)
    })
  })
})
