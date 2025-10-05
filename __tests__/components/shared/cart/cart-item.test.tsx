// Mock dependencies BEFORE any imports
jest.mock('@/lib/store/cart-store')
jest.mock('@/lib/actions/cart.actions', () => ({
  removeFromCart: jest.fn(),
  updateCartItem: jest.fn(),
}))
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartItem from '@/components/shared/cart/cart-item'
import { useCartStore } from '@/lib/store/cart-store'
import { removeFromCart, updateCartItem } from '@/lib/actions/cart.actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import type { CartItem as CartItemType } from '@/types/cart'

const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>
const mockRemoveFromCart = removeFromCart as jest.MockedFunction<typeof removeFromCart>
const mockUpdateCartItem = updateCartItem as jest.MockedFunction<typeof updateCartItem>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockToast = toast as jest.Mocked<typeof toast>

describe('CartItem', () => {
  const mockItem: CartItemType = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    slug: 'test-product',
    price: 99.99,
    quantity: 2,
    image: '/test.jpg',
    stock: 10,
  }

  const mockRemoveItem = jest.fn()
  const mockUpdateQuantity = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock cart store
    mockUseCartStore.mockReturnValue({
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      items: [mockItem],
      addItem: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(),
      getItemCount: jest.fn(),
    })

    // Mock toast
    mockToast.success = jest.fn()
    mockToast.error = jest.fn()
  })

  describe('Rendering', () => {
    it('should render product image', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      render(<CartItem item={mockItem} />)

      const image = screen.getByRole('img', { name: mockItem.name })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('alt', mockItem.name)
    })

    it('should render product name', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      render(<CartItem item={mockItem} />)

      expect(screen.getByText(mockItem.name)).toBeInTheDocument()
    })

    it('should render product price', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      render(<CartItem item={mockItem} />)

      expect(screen.getByText('$99.99')).toBeInTheDocument()
    })

    it('should render current quantity', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      render(<CartItem item={mockItem} />)

      const quantitySelect = screen.getByRole('combobox')
      expect(quantitySelect).toHaveValue('2')
    })

    it('should render quantity options based on stock', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      render(<CartItem item={mockItem} />)

      const quantitySelect = screen.getByRole('combobox')
      const options = quantitySelect.querySelectorAll('option')

      // Stock is 10, so should show options 1-10
      expect(options).toHaveLength(10)
    })

    it('should render remove button', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      render(<CartItem item={mockItem} />)

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
    })

    it('should render item subtotal', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      render(<CartItem item={mockItem} />)

      // 2 × $99.99 = $199.98
      expect(screen.getByText('$199.98')).toBeInTheDocument()
    })
  })

  describe('Quantity Updates', () => {
    it('should update quantity in cart store when quantity changes (unauthenticated)', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      const user = userEvent.setup()
      render(<CartItem item={mockItem} />)

      const quantitySelect = screen.getByRole('combobox')
      await user.selectOptions(quantitySelect, '5')

      expect(mockUpdateQuantity).toHaveBeenCalledWith(mockItem.id, 5)
    })

    it('should sync quantity to database when user is authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        status: 'authenticated',
      } as any)
      mockUpdateCartItem.mockResolvedValue({ success: true, message: 'Updated' })

      const user = userEvent.setup()
      render(<CartItem item={mockItem} />)

      const quantitySelect = screen.getByRole('combobox')
      await user.selectOptions(quantitySelect, '3')

      // Should update local store
      expect(mockUpdateQuantity).toHaveBeenCalledWith(mockItem.id, 3)

      // Should also sync to database
      await waitFor(() => {
        expect(mockUpdateCartItem).toHaveBeenCalledWith(mockItem.id, 3)
      })
    })

    it('should show error toast when database sync fails', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        status: 'authenticated',
      } as any)
      mockUpdateCartItem.mockResolvedValue({ success: false, message: 'Out of stock' })

      const user = userEvent.setup()
      render(<CartItem item={mockItem} />)

      const quantitySelect = screen.getByRole('combobox')
      await user.selectOptions(quantitySelect, '3')

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Out of stock')
      })
    })
  })

  describe('Remove Item', () => {
    it('should remove item from cart store when remove button clicked (unauthenticated)', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      const user = userEvent.setup()
      render(<CartItem item={mockItem} />)

      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      expect(mockRemoveItem).toHaveBeenCalledWith(mockItem.id)
      expect(mockToast.success).toHaveBeenCalledWith('Item removed from cart')
    })

    it('should sync removal to database when user is authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        status: 'authenticated',
      } as any)
      mockRemoveFromCart.mockResolvedValue({ success: true, message: 'Removed' })

      const user = userEvent.setup()
      render(<CartItem item={mockItem} />)

      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      // Should remove from local store
      expect(mockRemoveItem).toHaveBeenCalledWith(mockItem.id)

      // Should also sync to database
      await waitFor(() => {
        expect(mockRemoveFromCart).toHaveBeenCalledWith(mockItem.id)
      })
    })

    it('should show error toast when database removal fails', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        status: 'authenticated',
      } as any)
      mockRemoveFromCart.mockResolvedValue({ success: false, message: 'Failed to remove' })

      const user = userEvent.setup()
      render(<CartItem item={mockItem} />)

      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to remove')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle low stock items', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      const lowStockItem = { ...mockItem, stock: 3 }
      render(<CartItem item={lowStockItem} />)

      const quantitySelect = screen.getByRole('combobox')
      const options = quantitySelect.querySelectorAll('option')

      // Should only show 3 options
      expect(options).toHaveLength(3)
    })

    it('should calculate subtotal correctly', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

      const item = { ...mockItem, price: 50.5, quantity: 3 }
      render(<CartItem item={item} />)

      // 3 × $50.50 = $151.50
      expect(screen.getByText('$151.50')).toBeInTheDocument()
    })
  })
})
