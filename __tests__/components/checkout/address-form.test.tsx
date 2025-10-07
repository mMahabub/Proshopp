import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AddressForm from '@/components/checkout/address-form'

// Mock server actions
jest.mock('@/lib/actions/checkout.actions', () => ({
  saveShippingAddress: jest.fn(),
}))

describe('AddressForm', () => {
  describe('Form Fields', () => {
    it('should render all form fields', () => {
      render(<AddressForm />)

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^city$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/state \/ province/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
    })

    it('should have all inputs required', () => {
      render(<AddressForm />)

      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/street address/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/^city$/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/state \/ province/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/postal code/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/country/i)).toHaveAttribute('required')
    })

    it('should have correct input types', () => {
      render(<AddressForm />)

      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/street address/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/^city$/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/state \/ province/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/postal code/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/country/i)).toHaveAttribute('type', 'text')
    })

    it('should have correct input names', () => {
      render(<AddressForm />)

      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('name', 'fullName')
      expect(screen.getByLabelText(/street address/i)).toHaveAttribute('name', 'streetAddress')
      expect(screen.getByLabelText(/^city$/i)).toHaveAttribute('name', 'city')
      expect(screen.getByLabelText(/state \/ province/i)).toHaveAttribute('name', 'state')
      expect(screen.getByLabelText(/postal code/i)).toHaveAttribute('name', 'postalCode')
      expect(screen.getByLabelText(/country/i)).toHaveAttribute('name', 'country')
    })
  })

  describe('Placeholders', () => {
    it('should have placeholder text for all fields', () => {
      render(<AddressForm />)

      expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/123 main st/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/new york/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/^ny$/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/10001/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/united states/i)).toBeInTheDocument()
    })
  })

  describe('Header and Labels', () => {
    it('should render header text', () => {
      render(<AddressForm />)

      expect(screen.getByRole('heading', { name: /shipping address/i })).toBeInTheDocument()
      expect(screen.getByText(/enter your shipping address to continue/i)).toBeInTheDocument()
    })

    it('should render field labels', () => {
      render(<AddressForm />)

      expect(screen.getByText('Full Name')).toBeInTheDocument()
      expect(screen.getByText('Street Address')).toBeInTheDocument()
      expect(screen.getByText('City')).toBeInTheDocument()
      expect(screen.getByText('State / Province')).toBeInTheDocument()
      expect(screen.getByText('Postal Code')).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
    })
  })

  describe('Submit Button', () => {
    it('should render submit button', () => {
      render(<AddressForm />)

      const submitButton = screen.getByRole('button', { name: /continue to review/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should have submit button enabled by default', () => {
      render(<AddressForm />)

      const submitButton = screen.getByRole('button', { name: /continue to review/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Default Values', () => {
    it('should populate fields with default values when provided', () => {
      const defaultValues = {
        fullName: 'Jane Smith',
        streetAddress: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'United States',
      }

      render(<AddressForm defaultValues={defaultValues} />)

      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
      expect(screen.getByDisplayValue('456 Oak Avenue')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Los Angeles')).toBeInTheDocument()
      expect(screen.getByDisplayValue('CA')).toBeInTheDocument()
      expect(screen.getByDisplayValue('90001')).toBeInTheDocument()
      expect(screen.getByDisplayValue('United States')).toBeInTheDocument()
    })

    it('should not populate fields when no default values provided', () => {
      render(<AddressForm />)

      const fullNameInput = screen.getByLabelText(/full name/i)
      expect(fullNameInput).toHaveValue('')
    })
  })

  describe('Form Layout', () => {
    it('should render city and state in a grid layout', () => {
      render(<AddressForm />)

      const cityInput = screen.getByLabelText(/^city$/i)
      const stateInput = screen.getByLabelText(/state \/ province/i)

      expect(cityInput.parentElement?.parentElement).toHaveClass('grid')
      expect(stateInput.parentElement?.parentElement).toHaveClass('grid')
    })

    it('should render postal code and country in a grid layout', () => {
      render(<AddressForm />)

      const postalCodeInput = screen.getByLabelText(/postal code/i)
      const countryInput = screen.getByLabelText(/country/i)

      expect(postalCodeInput.parentElement?.parentElement).toHaveClass('grid')
      expect(countryInput.parentElement?.parentElement).toHaveClass('grid')
    })
  })

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<AddressForm />)

      const fullNameInput = screen.getByLabelText(/full name/i)
      const streetInput = screen.getByLabelText(/street address/i)
      const cityInput = screen.getByLabelText(/^city$/i)
      const stateInput = screen.getByLabelText(/state \/ province/i)
      const postalInput = screen.getByLabelText(/postal code/i)
      const countryInput = screen.getByLabelText(/country/i)

      expect(fullNameInput).toHaveAttribute('id', 'fullName')
      expect(streetInput).toHaveAttribute('id', 'streetAddress')
      expect(cityInput).toHaveAttribute('id', 'city')
      expect(stateInput).toHaveAttribute('id', 'state')
      expect(postalInput).toHaveAttribute('id', 'postalCode')
      expect(countryInput).toHaveAttribute('id', 'country')
    })

    it('should be keyboard accessible', () => {
      render(<AddressForm />)

      const inputs = [
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/street address/i),
        screen.getByLabelText(/^city$/i),
        screen.getByLabelText(/state \/ province/i),
        screen.getByLabelText(/postal code/i),
        screen.getByLabelText(/country/i),
      ]

      inputs.forEach(input => {
        expect(input).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })
})
