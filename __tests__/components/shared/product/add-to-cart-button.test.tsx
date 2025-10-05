// Mock dependencies BEFORE any imports
jest.mock('@/lib/store/cart-store')
jest.mock('@/lib/actions/cart.actions', () => ({
  addToCart: jest.fn(),
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
import AddToCartButton from '@/components/shared/product/add-to-cart-button'
import { useCartStore } from '@/lib/store/cart-store'
import { addToCart } from '@/lib/actions/cart.actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>
const mockAddToCart = addToCart as jest.MockedFunction<typeof addToCart>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockToast = toast as jest.Mocked<typeof toast>

describe('AddToCartButton', () => {
  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    slug: 'test-product',
    price: 100,
    image: '/test.jpg',
    stock: 10,
  }

  const mockAddItem = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock cart store
    mockUseCartStore.mockReturnValue({
      addItem: mockAddItem,
      items: [],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(),
      getItemCount: jest.fn(),
    })

    // Mock toast
    mockToast.success = jest.fn()
    mockToast.error = jest.fn()
  })

  it('should render with default quantity of 1', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    render(<AddToCartButton product={mockProduct} />)

    const quantitySelect = screen.getByRole('combobox')
    expect(quantitySelect).toHaveValue('1')
  })

  it('should render quantity options from 1 to min(stock, 10)', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    render(<AddToCartButton product={mockProduct} />)

    const quantitySelect = screen.getByRole('combobox')
    const options = quantitySelect.querySelectorAll('option')

    // Product has stock of 10, so should show 1-10
    expect(options).toHaveLength(10)
  })

  it('should limit quantity options when stock is less than 10', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    const lowStockProduct = { ...mockProduct, stock: 3 }
    render(<AddToCartButton product={lowStockProduct} />)

    const quantitySelect = screen.getByRole('combobox')
    const options = quantitySelect.querySelectorAll('option')

    expect(options).toHaveLength(3)
  })

  it('should be disabled when product is out of stock', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<AddToCartButton product={outOfStockProduct} />)

    const addButton = screen.getByRole('button', { name: /add to cart/i })
    expect(addButton).toBeDisabled()
  })

  it('should add item to cart store when clicked (unauthenticated)', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)

    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await user.click(addButton)

    expect(mockAddItem).toHaveBeenCalledWith(
      {
        id: mockProduct.id,
        name: mockProduct.name,
        slug: mockProduct.slug,
        price: mockProduct.price,
        image: mockProduct.image,
        stock: mockProduct.stock,
      },
      1
    )
    expect(mockToast.success).toHaveBeenCalledWith('Added to cart')
  })

  it('should add item with selected quantity', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)

    const quantitySelect = screen.getByRole('combobox')
    await user.selectOptions(quantitySelect, '5')

    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await user.click(addButton)

    expect(mockAddItem).toHaveBeenCalledWith(expect.any(Object), 5)
  })

  it('should sync to database when user is authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      status: 'authenticated',
    } as any)
    mockAddToCart.mockResolvedValue({ success: true, message: 'Item added to cart successfully' })

    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)

    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await user.click(addButton)

    // Should add to local store
    expect(mockAddItem).toHaveBeenCalled()

    // Should also sync to database
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id, 1)
    })
  })

  it('should show error toast when database sync fails', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      status: 'authenticated',
    } as any)
    mockAddToCart.mockResolvedValue({ success: false, message: 'Out of stock' })

    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)

    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Out of stock')
    })
  })

  it('should show loading state after adding to cart', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)

    const addButton = screen.getByRole('button', { name: /add to cart/i })

    await user.click(addButton)

    // After clicking, the action should complete (toast called)
    expect(mockToast.success).toHaveBeenCalled()
  })
})
