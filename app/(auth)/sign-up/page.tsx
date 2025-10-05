import SignUpForm from '@/components/auth/sign-up-form'
import { APP_NAME } from '@/lib/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Sign Up - ${APP_NAME}`,
  description: 'Create a new account',
}

export default function SignUpPage() {
  return <SignUpForm />
}
