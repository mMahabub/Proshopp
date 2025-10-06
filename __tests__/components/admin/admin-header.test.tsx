import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'
import AdminHeader from '@/components/admin/admin-header'
import { signOutUser } from '@/lib/actions/auth.actions'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock auth actions
jest.mock('@/lib/actions/auth.actions', () => ({
  signOutUser: jest.fn(),
}))

describe('AdminHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/admin')
  })

  describe('Header Display', () => {
    it('should display hamburger menu button', () => {
      render(<AdminHeader />)

      const menuButton = screen.getByRole('button', { name: /open sidebar/i })
      expect(menuButton).toBeInTheDocument()
    })

    it('should display logo and brand name in header', () => {
      render(<AdminHeader />)

      // There will be multiple "Proshopp" texts (one in header, one in mobile menu)
      const headerLinks = screen.getAllByRole('link', { name: /proshopp/i })
      expect(headerLinks.length).toBeGreaterThanOrEqual(1)
      headerLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/admin')
      })
    })

    it('should display admin badge in header', () => {
      render(<AdminHeader />)

      const badges = screen.getAllByText('Admin')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('should have sticky positioning', () => {
      const { container } = render(<AdminHeader />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('sticky', 'top-0')
    })

    it('should be hidden on large screens', () => {
      const { container } = render(<AdminHeader />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('lg:hidden')
    })
  })

  describe('Mobile Menu', () => {
    it('should open mobile menu when hamburger is clicked', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      // Initially, navigation links should not be visible in the document
      // (they're in the Sheet which is closed)
      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      // After clicking, we should see the navigation in the mobile menu
      // Wait for the dialog to open
      const dialog = await screen.findByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should display all navigation links in mobile menu', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      // Get the dialog element
      const dialog = await screen.findByRole('dialog')

      // Use within to query inside the dialog
      expect(within(dialog).getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(within(dialog).getByRole('link', { name: /products/i })).toBeInTheDocument()
      expect(within(dialog).getByRole('link', { name: /orders/i })).toBeInTheDocument()
      expect(within(dialog).getByRole('link', { name: /users/i })).toBeInTheDocument()
    })

    it('should have correct href for each link in mobile menu', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')

      expect(within(dialog).getByRole('link', { name: /dashboard/i })).toHaveAttribute(
        'href',
        '/admin'
      )
      expect(within(dialog).getByRole('link', { name: /products/i })).toHaveAttribute(
        'href',
        '/admin/products'
      )
      expect(within(dialog).getByRole('link', { name: /orders/i })).toHaveAttribute(
        'href',
        '/admin/orders'
      )
      expect(within(dialog).getByRole('link', { name: /users/i })).toHaveAttribute(
        'href',
        '/admin/users'
      )
    })

    it('should close mobile menu when a navigation link is clicked', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      // Open menu
      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')
      const dashboardLink = within(dialog).getByRole('link', { name: /dashboard/i })

      // Click a link
      await user.click(dashboardLink)

      // Menu should close (dialog should not be in document)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should highlight active dashboard link in mobile menu', async () => {
      const user = userEvent.setup()
      ;(usePathname as jest.Mock).mockReturnValue('/admin')
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')
      const dashboardLink = within(dialog).getByRole('link', { name: /dashboard/i })

      expect(dashboardLink).toHaveClass('bg-gray-800', 'text-white')
    })

    it('should highlight active products link in mobile menu', async () => {
      const user = userEvent.setup()
      ;(usePathname as jest.Mock).mockReturnValue('/admin/products')
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')
      const productsLink = within(dialog).getByRole('link', { name: /products/i })

      expect(productsLink).toHaveClass('bg-gray-800', 'text-white')
    })

    it('should display admin badge in mobile menu', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')
      const badges = within(dialog).getAllByText('Admin')

      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('should have dark background in mobile menu', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')

      // The SheetContent should have dark background
      expect(dialog).toHaveClass('bg-gray-900')
    })
  })

  describe('Logout Functionality in Mobile Menu', () => {
    it('should display logout button in mobile menu', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })

    it('should call signOutUser when logout button is clicked', async () => {
      const user = userEvent.setup()
      render(<AdminHeader />)

      const hamburger = screen.getByRole('button', { name: /open sidebar/i })
      await user.click(hamburger)

      const dialog = await screen.findByRole('dialog')
      const logoutButton = within(dialog).getByRole('button', { name: /logout/i })
      await user.click(logoutButton)

      expect(signOutUser).toHaveBeenCalledTimes(1)
    })
  })
})
