import { Metadata } from 'next'
import PlaceholderPage from '@/components/shared/placeholder-page'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - Proshopp',
  description: 'Our commitment to protecting your privacy and data',
}

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="Privacy Policy"
      description="Learn how we protect your personal information and respect your privacy"
      icon={Shield}
      expectedDate="Q1 2025"
    />
  )
}
