import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/shared/product/product-card'
import { Product } from '@/types'

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    category: 'Electronics',
    images: ['/test-image.jpg'],
    brand: 'Test Brand',
    description: 'Test description',
    stock: 10,
    price: '99.99',
    rating: '4.5',
    isFeatured: false,
    banner: null,
    createdAt: new Date('2025-01-01'),
  }

  it('should display rating', () => {
    render(<ProductCard product={mockProduct} />)

    // Should show "4.5" rating
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('should display price with dollar sign', () => {
    const { container } = render(<ProductCard product={mockProduct} />)

    // Price should have dollar sign - look for the primary color price element
    const priceElement = container.querySelector('.text-primary')
    expect(priceElement).toBeInTheDocument()
    expect(priceElement?.textContent).toContain('$')
    expect(priceElement?.textContent).toContain('99')
  })

  it('should display product name', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('should display product brand', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Brand')).toBeInTheDocument()
  })

  it('should display product image', () => {
    render(<ProductCard product={mockProduct} />)

    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('test-image.jpg'))
  })

  it('should show "Out of Stock" when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)

    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('should show "No Image" placeholder when no images available', () => {
    const noImageProduct = { ...mockProduct, images: [] }
    render(<ProductCard product={noImageProduct} />)

    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('should have correct link to product page', () => {
    render(<ProductCard product={mockProduct} />)

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/product/test-product')
  })
})
