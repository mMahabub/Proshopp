import { render, screen } from '@testing-library/react'
import SalesChart from '@/components/admin/sales-chart'

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

describe('SalesChart', () => {
  const mockData = [
    { date: '2025-01-01', sales: 100 },
    { date: '2025-01-02', sales: 200 },
    { date: '2025-01-03', sales: 150 },
  ]

  it('should display chart title and description', () => {
    render(<SalesChart data={mockData} />)

    expect(screen.getByText('Sales Overview')).toBeInTheDocument()
    expect(screen.getByText('Daily sales for the last 30 days')).toBeInTheDocument()
  })

  it('should render chart components', () => {
    render(<SalesChart data={mockData} />)

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('line')).toBeInTheDocument()
  })

  it('should handle empty data', () => {
    render(<SalesChart data={[]} />)

    expect(screen.getByText('Sales Overview')).toBeInTheDocument()
  })
})
