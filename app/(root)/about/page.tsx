import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - Proshopp',
  description: 'Learn about our story, mission, and values',
}

export default function AboutPage() {
  return (
    <PlaceholderPage
      title="About Us"
      description="Learn about our story, mission, and commitment to providing quality products"
      icon={Info}
      expectedDate="Q1 2025"
    />
  )
}
