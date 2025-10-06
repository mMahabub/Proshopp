import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/admin-sidebar'
import { signOutUser } from '@/lib/actions/auth.actions'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock auth actions
jest.mock('@/lib/actions/auth.actions', () => ({
  signOutUser: jest.fn(),
}))

describe('AdminSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/admin')
  })

  describe('Branding', () => {
    it('should display logo and brand name', () => {
      render(<AdminSidebar />)

      expect(screen.getByText('Proshopp')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /proshopp/i })).toHaveAttribute(
        'href',
        '/admin'
      )
    })

    it('should display admin badge', () => {
      render(<AdminSidebar />)

      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('should display all navigation links', () => {
      render(<AdminSidebar />)

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument()
    })

    it('should have correct href for each link', () => {
      render(<AdminSidebar />)

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
        'href',
        '/admin'
      )
      expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute(
        'href',
        '/admin/products'
      )
      expect(screen.getByRole('link', { name: /orders/i })).toHaveAttribute(
        'href',
        '/admin/orders'
      )
      expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute(
        'href',
        '/admin/users'
      )
    })

    it('should highlight active dashboard link when on /admin', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin')
      render(<AdminSidebar />)

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('bg-gray-800', 'text-white')
    })

    it('should highlight active products link when on /admin/products', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin/products')
      render(<AdminSidebar />)

      const productsLink = screen.getByRole('link', { name: /products/i })
      expect(productsLink).toHaveClass('bg-gray-800', 'text-white')
    })

    it('should highlight active products link when on /admin/products/123', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin/products/123')
      render(<AdminSidebar />)

      const productsLink = screen.getByRole('link', { name: /products/i })
      expect(productsLink).toHaveClass('bg-gray-800', 'text-white')
    })

    it('should highlight active orders link when on /admin/orders', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin/orders')
      render(<AdminSidebar />)

      const ordersLink = screen.getByRole('link', { name: /orders/i })
      expect(ordersLink).toHaveClass('bg-gray-800', 'text-white')
    })

    it('should highlight active users link when on /admin/users', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin/users')
      render(<AdminSidebar />)

      const usersLink = screen.getByRole('link', { name: /users/i })
      expect(usersLink).toHaveClass('bg-gray-800', 'text-white')
    })

    it('should not highlight dashboard when on other admin routes', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin/products')
      render(<AdminSidebar />)

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).not.toHaveClass('bg-gray-800')
      expect(dashboardLink).toHaveClass('text-gray-400')
    })

    it('should apply hover styles to non-active links', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin')
      render(<AdminSidebar />)

      const productsLink = screen.getByRole('link', { name: /products/i })
      expect(productsLink).toHaveClass('hover:text-white', 'hover:bg-gray-800')
    })
  })

  describe('Logout Functionality', () => {
    it('should display logout button', () => {
      render(<AdminSidebar />)

      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })

    it('should call signOutUser when logout button is clicked', async () => {
      const user = userEvent.setup()
      render(<AdminSidebar />)

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)

      expect(signOutUser).toHaveBeenCalledTimes(1)
    })

    it('should render logout button inside a form', () => {
      render(<AdminSidebar />)

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      const form = logoutButton.closest('form')

      expect(form).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should have dark background', () => {
      const { container } = render(<AdminSidebar />)

      const sidebar = container.firstChild as HTMLElement
      expect(sidebar).toHaveClass('bg-gray-900')
    })

    it('should use flex column layout', () => {
      const { container } = render(<AdminSidebar />)

      const sidebar = container.firstChild as HTMLElement
      expect(sidebar).toHaveClass('flex', 'h-full', 'flex-col')
    })
  })
})
