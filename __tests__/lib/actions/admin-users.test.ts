import { updateUserRole, getAllUsers } from '@/lib/actions/admin.actions'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// Mock dependencies
jest.mock('@/auth')
jest.mock('@/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockAuth = auth as jest.Mock
const mockFindUnique = prisma.user.findUnique as jest.Mock
const mockUpdate = prisma.user.update as jest.Mock
const mockFindMany = prisma.user.findMany as jest.Mock
const mockCount = prisma.user.count as jest.Mock

describe('Admin Users Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateUserRole', () => {
    const adminSession = {
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
    }

    const regularUserSession = {
      user: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
      },
    }

    it('should successfully update user role from user to admin', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockFindUnique.mockResolvedValue({
        id: 'user-456',
        email: 'target@example.com',
        name: 'Target User',
        role: 'user',
      })
      mockUpdate.mockResolvedValue({
        id: 'user-456',
        email: 'target@example.com',
        name: 'Target User',
        role: 'admin',
      })

      const result = await updateUserRole({
        userId: 'user-456',
        role: 'admin',
      })

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'user-456' },
        data: { role: 'admin' },
      })
    })

    it('should successfully update user role from admin to user', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockFindUnique.mockResolvedValue({
        id: 'user-456',
        email: 'target@example.com',
        name: 'Target User',
        role: 'admin',
      })
      mockUpdate.mockResolvedValue({
        id: 'user-456',
        email: 'target@example.com',
        name: 'Target User',
        role: 'user',
      })

      const result = await updateUserRole({
        userId: 'user-456',
        role: 'user',
      })

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'user-456' },
        data: { role: 'user' },
      })
    })

    it('should prevent users from changing their own role', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockFindUnique.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      })

      const result = await updateUserRole({
        userId: 'admin-123',
        role: 'user',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('You cannot change your own role')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should only allow admins to update roles', async () => {
      mockAuth.mockResolvedValue(regularUserSession as any)

      const result = await updateUserRole({
        userId: 'user-456',
        role: 'admin',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Only administrators can update user roles')
      expect(mockFindUnique).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should handle non-existent users', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockFindUnique.mockResolvedValue(null)

      const result = await updateUserRole({
        userId: 'non-existent',
        role: 'admin',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('User not found')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should validate role values', async () => {
      mockAuth.mockResolvedValue(adminSession as any)

      const result = await updateUserRole({
        userId: 'user-456',
        role: 'invalid-role' as any,
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid role')
      expect(mockFindUnique).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockFindUnique.mockRejectedValue(new Error('Database connection failed'))

      const result = await updateUserRole({
        userId: 'user-456',
        role: 'admin',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Database connection failed')
    })

    it('should require authentication', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateUserRole({
        userId: 'user-456',
        role: 'admin',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in')
    })
  })

  describe('getAllUsers', () => {
    const adminSession = {
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
    }

    const regularUserSession = {
      user: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
      },
    }

    const mockUsers = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date('2025-01-01'),
        emailVerified: new Date('2025-01-01'),
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        createdAt: new Date('2025-01-02'),
        emailVerified: new Date('2025-01-02'),
      },
    ]

    it('should fetch all users with pagination', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockCount.mockResolvedValue(2)
      mockFindMany.mockResolvedValue(mockUsers)

      const result = await getAllUsers({
        page: 1,
        limit: 10,
      })

      expect(result.success).toBe(true)
      expect(result.data?.users).toHaveLength(2)
      expect(result.data?.pagination.total).toBe(2)
      expect(result.data?.pagination.page).toBe(1)
      expect(result.data?.pagination.totalPages).toBe(1)
    })

    it('should search users by name (case-insensitive)', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([mockUsers[0]])

      const result = await getAllUsers({
        page: 1,
        limit: 10,
        search: 'john',
      })

      expect(result.success).toBe(true)
      expect(result.data?.users).toHaveLength(1)
      expect(result.data?.users[0].name).toBe('John Doe')
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
            ]),
          }),
        })
      )
    })

    it('should search users by email (case-insensitive)', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([mockUsers[1]])

      const result = await getAllUsers({
        page: 1,
        limit: 10,
        search: 'jane@example.com',
      })

      expect(result.success).toBe(true)
      expect(result.data?.users).toHaveLength(1)
      expect(result.data?.users[0].email).toBe('jane@example.com')
    })

    it('should only allow admins to fetch users', async () => {
      mockAuth.mockResolvedValue(regularUserSession as any)

      const result = await getAllUsers({
        page: 1,
        limit: 10,
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Only administrators can view users')
      expect(mockFindMany).not.toHaveBeenCalled()
    })

    it('should handle pagination correctly', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockCount.mockResolvedValue(25)
      mockFindMany.mockResolvedValue(mockUsers)

      const result = await getAllUsers({
        page: 2,
        limit: 10,
      })

      expect(result.success).toBe(true)
      expect(result.data?.pagination.page).toBe(2)
      expect(result.data?.pagination.totalPages).toBe(3)
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockFindMany.mockRejectedValue(new Error('Database connection failed'))

      const result = await getAllUsers({
        page: 1,
        limit: 10,
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Database connection failed')
    })

    it('should require authentication', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getAllUsers({
        page: 1,
        limit: 10,
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('You must be signed in')
    })

    it('should return empty array when no users found', async () => {
      mockAuth.mockResolvedValue(adminSession as any)
      mockCount.mockResolvedValue(0)
      mockFindMany.mockResolvedValue([])

      const result = await getAllUsers({
        page: 1,
        limit: 10,
      })

      expect(result.success).toBe(true)
      expect(result.data?.users).toHaveLength(0)
      expect(result.data?.pagination.total).toBe(0)
    })
  })
})
