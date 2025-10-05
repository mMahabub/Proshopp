import { APP_NAME } from '@/lib/constants'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <Image
            src="/images/logo.svg"
            width={48}
            height={48}
            alt={`${APP_NAME} logo`}
            priority
          />
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
