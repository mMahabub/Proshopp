import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserButton from '@/components/shared/header/user-button'
import { signOutUser } from '@/lib/actions/auth.actions'

// Mock the server action
jest.mock('@/lib/actions/auth.actions', () => ({
  signOutUser: jest.fn(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('UserButton', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
  }

  const mockAdminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Avatar and Display', () => {
    it('should display user initials when no image provided', () => {
      render(<UserButton user={mockUser} />)

      // Should display initials "JD"
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should display user name', () => {
      render(<UserButton user={mockUser} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display user image when provided', () => {
      const userWithImage = {
        ...mockUser,
        image: 'https://example.com/avatar.jpg',
      }

      render(<UserButton user={userWithImage} />)

      const img = screen.getByAltText('John Doe')
      expect(img).toBeInTheDocument()
      // Next.js Image component transforms the src, so we just check if image exists
      expect(img).toHaveAttribute('alt', 'John Doe')
    })

    it('should generate correct initials for multi-word names', () => {
      const userWithLongName = {
        ...mockUser,
        name: 'John Michael Doe',
      }

      render(<UserButton user={userWithLongName} />)

      // Should take first 2 initials: "JM"
      expect(screen.getByText('JM')).toBeInTheDocument()
    })
  })

  describe('Dropdown Menu', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup()
      render(<UserButton user={mockUser} />)

      // Initially, dropdown items should not be visible
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()

      // Click the button to open dropdown
      const button = screen.getByRole('button')
      await user.click(button)

      // Now dropdown items should be visible
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Orders')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('should display user info in dropdown', async () => {
      const user = userEvent.setup()
      render(<UserButton user={mockUser} />)

      const button = screen.getByRole('button')
      await user.click(button)

      // Check for user email in dropdown
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should have Profile link', async () => {
      const user = userEvent.setup()
      render(<UserButton user={mockUser} />)

      const button = screen.getByRole('button')
      await user.click(button)

      const profileLink = screen.getByRole('link', { name: /profile/i })
      expect(profileLink).toBeInTheDocument()
      expect(profileLink).toHaveAttribute('href', '/profile')
    })

    it('should have Orders link', async () => {
      const user = userEvent.setup()
      render(<UserButton user={mockUser} />)

      const button = screen.getByRole('button')
      await user.click(button)

      const ordersLink = screen.getByRole('link', { name: /orders/i })
      expect(ordersLink).toBeInTheDocument()
      expect(ordersLink).toHaveAttribute('href', '/orders')
    })
  })

  describe('Admin Features', () => {
    it('should show Admin Panel link for admin users', async () => {
      const user = userEvent.setup()
      render(<UserButton user={mockAdminUser} />)

      const button = screen.getByRole('button')
      await user.click(button)

      const adminLink = screen.getByRole('link', { name: /admin panel/i })
      expect(adminLink).toBeInTheDocument()
      expect(adminLink).toHaveAttribute('href', '/admin')
    })

    it('should not show Admin Panel link for regular users', async () => {
      const user = userEvent.setup()
      render(<UserButton user={mockUser} />)

      const button = screen.getByRole('button')
      await user.click(button)

      const adminLink = screen.queryByRole('link', { name: /admin panel/i })
      expect(adminLink).not.toBeInTheDocument()
    })
  })

  describe('Sign Out Functionality', () => {
    it('should call signOutUser when Sign Out is clicked', async () => {
      const user = userEvent.setup()
      render(<UserButton user={mockUser} />)

      const button = screen.getByRole('button')
      await user.click(button)

      const signOutButton = screen.getByText('Sign Out')
      await user.click(signOutButton)

      expect(signOutUser).toHaveBeenCalledTimes(1)
    })
  })
})
