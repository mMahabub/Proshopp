import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ - Proshopp',
  description: 'Frequently asked questions and answers',
}

export default function FAQPage() {
  return (
    <PlaceholderPage
      title="Frequently Asked Questions"
      description="Find answers to common questions about orders, shipping, returns, and more"
      icon={HelpCircle}
      expectedDate="Q1 2025"
    />
  )
}
