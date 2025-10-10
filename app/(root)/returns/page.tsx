import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Returns & Exchanges - Proshopp',
  description: 'Return and exchange policies and procedures',
}

export default function ReturnsPage() {
  return (
    <PlaceholderPage
      title="Returns & Exchanges"
      description="Learn about our hassle-free return and exchange process"
      icon={RefreshCw}
      expectedDate="Q1 2025"
    />
  )
}
