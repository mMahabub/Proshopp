import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Product Search - Proshopp',
  description: 'Search and browse our complete product catalog',
}

export default function SearchPage() {
  return (
    <PlaceholderPage
      title="Product Search"
      description="Browse our complete catalog with advanced filtering and search capabilities"
      icon={Search}
      expectedDate="Q2 2025"
    />
  )
}
