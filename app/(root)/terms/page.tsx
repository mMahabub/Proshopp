import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - Proshopp',
  description: 'Terms and conditions for using our services',
}

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="Terms of Service"
      description="Read our terms and conditions for using Proshopp services"
      icon={FileText}
      expectedDate="Q1 2025"
    />
  )
}
