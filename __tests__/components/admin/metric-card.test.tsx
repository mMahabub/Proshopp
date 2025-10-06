import { render, screen } from '@testing-library/react'
import MetricCard from '@/components/admin/metric-card'
import { DollarSign } from 'lucide-react'

describe('MetricCard', () => {
  it('should display title, value, and icon', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$5,000.00"
        icon={DollarSign}
      />
    )

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$5,000.00')).toBeInTheDocument()
  })

  it('should display description when provided', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$5,000.00"
        icon={DollarSign}
        description="From paid orders"
      />
    )

    expect(screen.getByText('From paid orders')).toBeInTheDocument()
  })

  it('should display positive trend when provided', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$5,000.00"
        icon={DollarSign}
        trend={{ value: 15, isPositive: true }}
      />
    )

    expect(screen.getByText('+15% from last month')).toBeInTheDocument()
  })

  it('should display negative trend when provided', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$5,000.00"
        icon={DollarSign}
        trend={{ value: -10, isPositive: false }}
      />
    )

    expect(screen.getByText('-10% from last month')).toBeInTheDocument()
  })

  it('should handle numeric values', () => {
    render(
      <MetricCard
        title="Total Orders"
        value={100}
        icon={DollarSign}
      />
    )

    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
