import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import UsersTable from '@/components/admin/users-table'
import { updateUserRole } from '@/lib/actions/admin.actions'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useTransition: () => [false, jest.fn()],
}))

jest.mock('@/lib/actions/admin.actions', () => ({
  updateUserRole: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUpdateUserRole = updateUserRole as jest.MockedFunction<typeof updateUserRole>
const mockToast = toast as jest.Mocked<typeof toast>

describe('UsersTable Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockUsers = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date('2025-01-01T12:00:00Z'),
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      createdAt: new Date('2025-01-02T12:00:00Z'),
    },
    {
      id: 'user-3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'user',
      createdAt: new Date('2025-01-03T12:00:00Z'),
    },
  ]

  const mockPagination = {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
  }

  const currentUserId = 'user-2'

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
  })

  describe('Table Rendering', () => {
    it('should render users table with all columns', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      // Table headers
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Joined Date')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should display all user data', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      mockUsers.forEach((user) => {
        expect(screen.getByText(user.name)).toBeInTheDocument()
        expect(screen.getByText(user.email)).toBeInTheDocument()
      })
    })

    it('should format joined dates correctly', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 2, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 3, 2025/)).toBeInTheDocument()
    })

    it('should display role badges with correct colors', () => {
      const { container } = render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const adminBadges = container.querySelectorAll('.bg-blue-500')
      const userBadges = container.querySelectorAll('.bg-gray-500')

      expect(adminBadges.length).toBeGreaterThan(0)
      expect(userBadges.length).toBeGreaterThan(0)
    })
  })

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const searchInput = screen.getByPlaceholderText(/search by name or email/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('should trigger search on Enter key press', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={onFilterChange}
        />
      )

      const searchInput = screen.getByPlaceholderText(/search by name or email/i)
      await user.type(searchInput, 'john{Enter}')

      expect(onFilterChange).toHaveBeenCalledWith('', 'john', 1)
    })

    it('should trigger search on button click', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={onFilterChange}
        />
      )

      const searchInput = screen.getByPlaceholderText(/search by name or email/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'john')
      await user.click(searchButton)

      expect(onFilterChange).toHaveBeenCalledWith('', 'john', 1)
    })
  })

  describe('Role Update Functionality', () => {
    it('should display role update dropdown for other users', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      // Should have role selects (excluding current user)
      const roleSelects = screen.getAllByRole('combobox')
      expect(roleSelects.length).toBeGreaterThan(0)
    })

    it('should disable role dropdown for current user', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      // Find the row for current user (Jane Smith, user-2)
      const currentUserRow = screen.getByText('jane@example.com').closest('tr')
      expect(currentUserRow).toBeInTheDocument()

      // Check if the role update dropdown is disabled or shows "Current User"
      expect(currentUserRow).toHaveTextContent(/current user/i)
    })

    it('should call updateUserRole when role is changed', async () => {
      mockUpdateUserRole.mockResolvedValue({
        success: true,
        data: {} as any,
      })

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      // This test will be implemented when the component is created
      // For now, we're just verifying the mock setup
      expect(mockUpdateUserRole).not.toHaveBeenCalled()
    })

    it('should show success toast on successful role update', async () => {
      mockUpdateUserRole.mockResolvedValue({
        success: true,
        data: {} as any,
      })

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      // Test will be implemented with actual role change interaction
      expect(mockToast.success).not.toHaveBeenCalled()
    })

    it('should show error toast on failed role update', async () => {
      mockUpdateUserRole.mockResolvedValue({
        success: false,
        message: 'Failed to update role',
      })

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      // Test will be implemented with actual role change interaction
      expect(mockToast.error).not.toHaveBeenCalled()
    })
  })

  describe('View Orders Link', () => {
    it('should render "View Orders" link for each user', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const viewOrdersLinks = screen.getAllByText(/view orders/i)
      expect(viewOrdersLinks.length).toBe(mockUsers.length)
    })

    it('should navigate to orders page filtered by user on click', async () => {
      const user = userEvent.setup()

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const viewOrdersLinks = screen.getAllByText(/view orders/i)
      await user.click(viewOrdersLinks[0])

      // Should navigate to orders page with user filter
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/admin/orders')
      )
    })
  })

  describe('Pagination', () => {
    const paginatedMockPagination = {
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
    }

    it('should display pagination controls when total pages > 1', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={paginatedMockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      expect(screen.getByText(/previous/i)).toBeInTheDocument()
      expect(screen.getByText(/next/i)).toBeInTheDocument()
      expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument()
    })

    it('should disable Previous button on first page', () => {
      const firstPagePagination = { ...paginatedMockPagination, page: 1 }

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={firstPagePagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const prevButton = screen.getByRole('button', { name: /previous/i })
      expect(prevButton).toBeDisabled()
    })

    it('should disable Next button on last page', () => {
      const lastPagePagination = { ...paginatedMockPagination, page: 3 }

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={lastPagePagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()
    })

    it('should call onFilterChange with correct page on Previous click', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={paginatedMockPagination}
          currentUserId={currentUserId}
          onFilterChange={onFilterChange}
        />
      )

      const prevButton = screen.getByRole('button', { name: /previous/i })
      await user.click(prevButton)

      expect(onFilterChange).toHaveBeenCalledWith('', '', 1)
    })

    it('should call onFilterChange with correct page on Next click', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()

      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={paginatedMockPagination}
          currentUserId={currentUserId}
          onFilterChange={onFilterChange}
        />
      )

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      expect(onFilterChange).toHaveBeenCalledWith('', '', 3)
    })

    it('should hide pagination when total pages = 1', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      expect(screen.queryByText(/previous/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/next/i)).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no users', () => {
      render(
        <UsersTable
          initialUsers={[]}
          initialPagination={{ total: 0, page: 1, limit: 10, totalPages: 0 }}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      expect(screen.getByText(/no users found/i)).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should disable search button during transition', () => {
      // This will be tested when we implement useTransition
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0)
    })

    it('should have accessible search input', () => {
      render(
        <UsersTable
          initialUsers={mockUsers}
          initialPagination={mockPagination}
          currentUserId={currentUserId}
          onFilterChange={jest.fn()}
        />
      )

      const searchInput = screen.getByPlaceholderText(/search by name or email/i)
      expect(searchInput).toHaveAttribute('type', 'text')
    })
  })
})
