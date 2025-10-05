import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUpForm from '@/components/auth/sign-up-form'

// Mock server actions
jest.mock('@/lib/actions/auth.actions', () => ({
  signUp: jest.fn(),
  signInWithOAuth: jest.fn(),
}))

describe('SignUpForm', () => {
  it('should render all form fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('should render sign up button', () => {
    render(<SignUpForm />)

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('should render OAuth buttons', () => {
    render(<SignUpForm />)

    const googleButton = screen.getByRole('button', { name: /google/i })
    const githubButton = screen.getByRole('button', { name: /github/i })

    expect(googleButton).toBeInTheDocument()
    expect(githubButton).toBeInTheDocument()
  })

  it('should render link to sign-in page', () => {
    render(<SignUpForm />)

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/sign-in')
  })

  it('should show password strength indicator when typing password', async () => {
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Type a weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } })

    await waitFor(() => {
      expect(screen.getByText(/weak/i)).toBeInTheDocument()
    })
  })

  it('should show "Strong" for a strong password', async () => {
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Type a strong password
    fireEvent.change(passwordInput, { target: { value: 'StrongP@ssw0rd!' } })

    await waitFor(() => {
      expect(screen.getByText(/strong/i)).toBeInTheDocument()
    })
  })

  it('should show password requirements text', async () => {
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    fireEvent.change(passwordInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(
        screen.getByText(/must be at least 8 characters with uppercase and number/i)
      ).toBeInTheDocument()
    })
  })

  it('should have required attributes on inputs', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/name/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('required')
  })

  it('should have correct input types', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/name/i)).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password')
  })

  it('should have placeholder text', () => {
    render(<SignUpForm />)

    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument()
  })

  it('should render header text', () => {
    render(<SignUpForm />)

    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your information to get started/i)).toBeInTheDocument()
  })

  it('should render "Or continue with" divider', () => {
    render(<SignUpForm />)

    expect(screen.getByText(/or continue with/i)).toBeInTheDocument()
  })

  it('should render "Already have an account?" text', () => {
    render(<SignUpForm />)

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })
})
