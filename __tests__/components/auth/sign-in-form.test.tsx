import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import SignInForm from '@/components/auth/sign-in-form'

// Mock server actions
jest.mock('@/lib/actions/auth.actions', () => ({
  signInWithCredentials: jest.fn(),
  signInWithOAuth: jest.fn(),
}))

describe('SignInForm', () => {
  it('should render all form fields', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('should render sign in button', () => {
    render(<SignInForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('should render remember me checkbox', () => {
    render(<SignInForm />)

    const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
    expect(checkbox).toBeInTheDocument()
  })

  it('should render forgot password link', () => {
    render(<SignInForm />)

    const forgotLink = screen.getByRole('link', { name: /forgot password/i })
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('should render OAuth buttons', () => {
    render(<SignInForm />)

    const googleButton = screen.getByRole('button', { name: /google/i })
    const githubButton = screen.getByRole('button', { name: /github/i })

    expect(googleButton).toBeInTheDocument()
    expect(githubButton).toBeInTheDocument()
  })

  it('should render link to sign-up page', () => {
    render(<SignInForm />)

    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/sign-up')
  })

  it('should have required attributes on inputs', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('required')
  })

  it('should have correct input types', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password')
  })

  it('should have checkbox type for remember me', () => {
    render(<SignInForm />)

    const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
    expect(checkbox).toHaveAttribute('type', 'checkbox')
  })

  it('should have placeholder text', () => {
    render(<SignInForm />)

    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
  })

  it('should render header text', () => {
    render(<SignInForm />)

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByText(/sign in to your account to continue/i)).toBeInTheDocument()
  })

  it('should render "Or continue with" divider', () => {
    render(<SignInForm />)

    expect(screen.getByText(/or continue with/i)).toBeInTheDocument()
  })

  it('should render "Don\'t have an account?" text', () => {
    render(<SignInForm />)

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('should have remember me label text', () => {
    render(<SignInForm />)

    expect(screen.getByText(/remember me for 30 days/i)).toBeInTheDocument()
  })

  it('should render email and password labels', () => {
    render(<SignInForm />)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })
})
