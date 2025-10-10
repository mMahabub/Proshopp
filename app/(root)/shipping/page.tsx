import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping Information - Proshopp',
  description: 'Delivery options, times, and shipping policies',
}

export default function ShippingPage() {
  return (
    <PlaceholderPage
      title="Shipping Information"
      description="Learn about our delivery options, estimated times, and shipping policies"
      icon={Truck}
      expectedDate="Q1 2025"
    />
  )
}
