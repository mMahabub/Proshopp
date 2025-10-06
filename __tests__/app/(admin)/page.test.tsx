import { render, screen } from '@testing-library/react'
import AdminDashboardPage from '@/app/(admin)/admin/page'

describe('AdminDashboardPage', () => {
  describe('Page Layout', () => {
    it('should display page heading', () => {
      render(<AdminDashboardPage />)

      expect(screen.getByRole('heading', { name: /^dashboard$/i, level: 1 })).toBeInTheDocument()
    })

    it('should display welcome message', () => {
      render(<AdminDashboardPage />)

      expect(screen.getByText('Welcome to the admin dashboard')).toBeInTheDocument()
    })
  })

  describe('Metric Cards', () => {
    it('should display all four metric cards', () => {
      render(<AdminDashboardPage />)

      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Total Orders')).toBeInTheDocument()
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Total Products')).toBeInTheDocument()
    })

    it('should display placeholder revenue value', () => {
      render(<AdminDashboardPage />)

      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('should display placeholder count values', () => {
      render(<AdminDashboardPage />)

      // Should have three "0" values (Orders, Users, Products)
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues.length).toBe(3)
    })

    it('should display placeholder text for all metrics', () => {
      render(<AdminDashboardPage />)

      const placeholderTexts = screen.getAllByText('Placeholder for TASK-402')
      expect(placeholderTexts.length).toBe(4)
    })
  })

  describe('Dashboard Metrics Section', () => {
    it('should display dashboard metrics card', () => {
      render(<AdminDashboardPage />)

      expect(screen.getByText('Dashboard Metrics')).toBeInTheDocument()
    })

    it('should display placeholder text for detailed metrics', () => {
      render(<AdminDashboardPage />)

      expect(
        screen.getByText('Detailed metrics and charts will be implemented in TASK-402')
      ).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('should render metric cards in a grid', () => {
      const { container } = render(<AdminDashboardPage />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('gap-4', 'md:grid-cols-2', 'lg:grid-cols-4')
    })

    it('should use space-y for vertical spacing', () => {
      const { container } = render(<AdminDashboardPage />)

      const mainDiv = container.querySelector('.space-y-8')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  describe('Card Structure', () => {
    it('should render each metric in a Card component', () => {
      const { container } = render(<AdminDashboardPage />)

      // Count all Card components - should be 5 (4 metrics + 1 dashboard metrics card)
      const cards = container.querySelectorAll('[class*="rounded-lg"][class*="border"]')
      expect(cards.length).toBeGreaterThanOrEqual(5)
    })

    it('should have CardHeader with title in each metric card', () => {
      render(<AdminDashboardPage />)

      // All metric titles should be in CardHeader with proper styling
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Total Orders')).toBeInTheDocument()
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Total Products')).toBeInTheDocument()
    })

    it('should have CardContent with values in each metric card', () => {
      render(<AdminDashboardPage />)

      // Values should be displayed with proper text sizes
      expect(screen.getByText('$0.00')).toHaveClass('text-2xl', 'font-bold')

      const zeroValues = screen.getAllByText('0')
      zeroValues.forEach((element) => {
        expect(element).toHaveClass('text-2xl', 'font-bold')
      })
    })
  })

  describe('Metadata', () => {
    it('should export correct metadata', () => {
      const { metadata } = require('@/app/(admin)/admin/page')

      expect(metadata.title).toBe('Admin Dashboard')
      expect(metadata.description).toBe('Admin dashboard overview')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AdminDashboardPage />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Dashboard')
    })

    it('should have descriptive text for context', () => {
      render(<AdminDashboardPage />)

      expect(screen.getByText('Welcome to the admin dashboard')).toHaveClass('text-muted-foreground')
    })
  })

  describe('Future Implementation Indicators', () => {
    it('should clearly indicate features are placeholders', () => {
      render(<AdminDashboardPage />)

      // All placeholder texts should reference TASK-402
      const task402References = screen.getAllByText(/TASK-402/)
      expect(task402References.length).toBeGreaterThanOrEqual(4)
    })

    it('should show zero values as starting point for metrics', () => {
      render(<AdminDashboardPage />)

      // Verify all metrics start at zero/empty state
      expect(screen.getByText('$0.00')).toBeInTheDocument()
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBe(3)
    })
  })
})
