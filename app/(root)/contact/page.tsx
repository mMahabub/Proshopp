import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - Proshopp',
  description: 'Get in touch with our customer support team',
}

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact Us"
      description="Get in touch with our team for support, inquiries, or feedback"
      icon={Mail}
      expectedDate="Q1 2025"
    />
  )
}
