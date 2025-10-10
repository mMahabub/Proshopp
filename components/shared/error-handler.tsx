'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ErrorHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const error = searchParams.get('error')

    if (error === 'admin_required') {
      toast.error('Access denied. Admin privileges required.')

      // Remove error parameter from URL without page refresh
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  return null // This component doesn't render anything
}
