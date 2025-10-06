import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout - Proshopp',
  description: 'Complete your purchase securely',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6">
      {children}
    </div>
  )
}
