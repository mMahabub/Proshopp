import SignInForm from '@/components/auth/sign-in-form'
import { APP_NAME } from '@/lib/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Sign In - ${APP_NAME}`,
  description: 'Sign in to your account',
}

export default function SignInPage() {
  return <SignInForm />
}
