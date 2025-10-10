import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import UsersPage from '@/app/(admin)/users/page'
import { getAllUsers } from '@/lib/actions/admin.actions'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@/lib/actions/admin.actions', () => ({
  getAllUsers: jest.fn(),
}))

jest.mock('@/components/admin/users-table', () => {
  return function MockUsersTable({
    initialUsers,
    initialPagination,
    currentUserId,
  }: {
    initialUsers: any[]
    initialPagination: any
    currentUserId: string
  }) {
    return (
      <div data-testid="users-table">
        <div data-testid="user-count">{initialUsers.length}</div>
        <div data-testid="total-count">{initialPagination.total}</div>
        <div data-testid="current-user-id">{currentUserId}</div>
        {initialUsers.map((user) => (
          <div key={user.id} data-testid={`user-${user.id}`}>
            {user.name} - {user.email} - {user.role}
          </div>
        ))}
      </div>
    )
  }
})

const mockGetAllUsers = getAllUsers as jest.MockedFunction<typeof getAllUsers>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('UsersPage', () => {
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

  const mockPagination = {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Data Fetching', () => {
    it('should fetch all users on mount', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: mockPagination,
        },
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      expect(mockGetAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      })

      render(component)

      expect(screen.getByTestId('users-table')).toBeInTheDocument()
    })

    it('should handle error when fetching users fails', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: false,
        message: 'Failed to fetch users',
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      render(component)

      expect(screen.getByText(/error loading users/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument()
    })

    it('should handle error when users data is null', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: null as any,
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      render(component)

      expect(screen.getByText(/error loading users/i)).toBeInTheDocument()
    })
  })

  describe('Next.js 15 searchParams (Promise)', () => {
    it('should await searchParams before using', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: mockPagination,
        },
      })

      let resolveParams: (value: any) => void
      const paramsPromise = new Promise((resolve) => {
        resolveParams = resolve
      })

      const pagePromise = UsersPage({ searchParams: paramsPromise as Promise<any> })

      // Params shouldn't be accessed yet
      expect(mockGetAllUsers).not.toHaveBeenCalled()

      // Resolve params
      resolveParams!({ page: '2', search: 'john' })

      await pagePromise

      // Now getAllUsers should have been called with awaited params
      expect(mockGetAllUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: 'john',
      })
    })

    it('should handle empty searchParams', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: mockPagination,
        },
      })

      const searchParams = Promise.resolve({})
      await UsersPage({ searchParams })

      expect(mockGetAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      })
    })
  })

  describe('URL Parameters', () => {
    it('should parse page parameter from URL', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: { ...mockPagination, page: 2 },
        },
      })

      const searchParams = Promise.resolve({ page: '2' })
      await UsersPage({ searchParams })

      expect(mockGetAllUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: undefined,
      })
    })

    it('should parse search parameter from URL', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: mockPagination,
        },
      })

      const searchParams = Promise.resolve({ search: 'john' })
      await UsersPage({ searchParams })

      expect(mockGetAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'john',
      })
    })

    it('should parse multiple parameters from URL', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: { ...mockPagination, page: 2 },
        },
      })

      const searchParams = Promise.resolve({ page: '2', search: 'admin' })
      await UsersPage({ searchParams })

      expect(mockGetAllUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: 'admin',
      })
    })

    it('should default to page 1 when page parameter is invalid', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: mockPagination,
        },
      })

      const searchParams = Promise.resolve({ page: 'invalid' })
      await UsersPage({ searchParams })

      expect(mockGetAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      })
    })
  })

  describe('Page Rendering', () => {
    it('should render page heading', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: mockPagination,
        },
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      render(component)

      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('should render total users count in description', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: { ...mockPagination, total: 25 },
        },
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      render(component)

      expect(screen.getByText(/25 total/i)).toBeInTheDocument()
    })

    it('should pass correct props to UsersTable', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: {
          users: mockUsers,
          pagination: mockPagination,
        },
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      render(component)

      expect(screen.getByTestId('user-count')).toHaveTextContent('2')
      expect(screen.getByTestId('total-count')).toHaveTextContent('2')
      expect(screen.getByTestId('user-user-1')).toHaveTextContent(
        'John Doe - john@example.com - user'
      )
      expect(screen.getByTestId('user-user-2')).toHaveTextContent(
        'Jane Smith - jane@example.com - admin'
      )
    })
  })

  describe('Error Handling', () => {
    it('should display error UI when data fetching fails', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: false,
        message: 'Database connection failed',
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      render(component)

      expect(screen.getByText(/error loading users/i)).toBeInTheDocument()
      expect(screen.getByText(/database connection failed/i)).toBeInTheDocument()
    })

    it('should not render UsersTable when data is missing', async () => {
      mockGetAllUsers.mockResolvedValue({
        success: true,
        data: null as any,
      })

      const searchParams = Promise.resolve({})
      const component = await UsersPage({ searchParams })

      render(component)

      expect(screen.queryByTestId('users-table')).not.toBeInTheDocument()
    })
  })

  describe('Metadata', () => {
    it('should export metadata object', async () => {
      const { metadata } = await import('@/app/(admin)/users/page')

      expect(metadata).toBeDefined()
      expect(metadata.title).toBe('Users - Admin')
      expect(metadata.description).toBe('Manage user accounts and roles')
    })
  })
})
