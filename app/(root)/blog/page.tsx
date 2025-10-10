import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - Proshopp',
  description: 'Latest news, tips, and updates from Proshopp',
}

export default function BlogPage() {
  return (
    <PlaceholderPage
      title="Blog"
      description="Read the latest news, product updates, and shopping tips from our team"
      icon={BookOpen}
      expectedDate="Q2 2025"
    />
  )
}
