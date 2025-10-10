import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductImageUpload from '@/components/shared/product/product-image-upload'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('sonner')
jest.mock('@uploadthing/react', () => ({
  UploadButton: ({ onClientUploadComplete, onUploadError, onUploadBegin, disabled }: any) => (
    <button
      data-testid="upload-button"
      onClick={() => {
        onUploadBegin?.()
        setTimeout(() => {
          onClientUploadComplete?.([
            { url: 'https://utfs.io/test-image-1.jpg' },
            { url: 'https://utfs.io/test-image-2.jpg' },
          ])
        }, 100)
      }}
      disabled={disabled}
    >
      Upload Images
    </button>
  ),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('ProductImageUpload', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Empty State', () => {
    it('should render empty state when no images are provided', () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} />)

      expect(screen.getByText('No images uploaded')).toBeInTheDocument()
      expect(screen.getByText(/Upload up to 5 product images/i)).toBeInTheDocument()
      expect(screen.getByText(/Supported formats: JPEG, PNG, WebP, GIF/i)).toBeInTheDocument()
    })

    it('should show upload button in empty state', () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} />)

      expect(screen.getByTestId('upload-button')).toBeInTheDocument()
      expect(screen.getByText(/0 \/ 5 images uploaded/i)).toBeInTheDocument()
    })

    it('should show custom maxImages in empty state message', () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} maxImages={3} />)

      expect(screen.getByText(/Upload up to 3 product images/i)).toBeInTheDocument()
      expect(screen.getByText(/0 \/ 3 images uploaded/i)).toBeInTheDocument()
    })
  })

  describe('Upload Button', () => {
    it('should render upload button when below max images', () => {
      render(<ProductImageUpload images={['https://utfs.io/image1.jpg']} onChange={mockOnChange} />)

      expect(screen.getByTestId('upload-button')).toBeInTheDocument()
      expect(screen.getByText(/1 \/ 5 images uploaded/i)).toBeInTheDocument()
    })

    it('should not render upload button when at max images', () => {
      const images = [
        'https://utfs.io/image1.jpg',
        'https://utfs.io/image2.jpg',
        'https://utfs.io/image3.jpg',
        'https://utfs.io/image4.jpg',
        'https://utfs.io/image5.jpg',
      ]
      render(<ProductImageUpload images={images} onChange={mockOnChange} maxImages={5} />)

      expect(screen.queryByTestId('upload-button')).not.toBeInTheDocument()
    })

    it('should not render upload button when disabled', () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} disabled />)

      expect(screen.queryByTestId('upload-button')).not.toBeInTheDocument()
    })

    it('should call onUploadBegin when upload starts', async () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} />)

      const uploadButton = screen.getByTestId('upload-button')
      fireEvent.click(uploadButton)

      expect(toast.info).toHaveBeenCalledWith('Uploading images...')
    })

    it('should call onChange with new images on successful upload', async () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} />)

      const uploadButton = screen.getByTestId('upload-button')
      fireEvent.click(uploadButton)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          'https://utfs.io/test-image-1.jpg',
          'https://utfs.io/test-image-2.jpg',
        ])
      })
    })

    it('should show success toast on successful upload', async () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} />)

      const uploadButton = screen.getByTestId('upload-button')
      fireEvent.click(uploadButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('2 image(s) uploaded successfully')
      })
    })

    it('should respect maxImages limit when uploading', async () => {
      const existingImages = [
        'https://utfs.io/existing-1.jpg',
        'https://utfs.io/existing-2.jpg',
        'https://utfs.io/existing-3.jpg',
      ]
      render(<ProductImageUpload images={existingImages} onChange={mockOnChange} maxImages={4} />)

      const uploadButton = screen.getByTestId('upload-button')
      fireEvent.click(uploadButton)

      await waitFor(() => {
        // Should only add 1 more image (3 existing + 1 new = 4 max)
        expect(mockOnChange).toHaveBeenCalledWith([
          'https://utfs.io/existing-1.jpg',
          'https://utfs.io/existing-2.jpg',
          'https://utfs.io/existing-3.jpg',
          'https://utfs.io/test-image-1.jpg',
        ])
      })
    })
  })

  describe('Image Preview Grid', () => {
    it('should render image preview grid with provided images', () => {
      const images = [
        'https://utfs.io/image1.jpg',
        'https://utfs.io/image2.jpg',
        'https://utfs.io/image3.jpg',
      ]
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      const imageElements = screen.getAllByRole('img')
      expect(imageElements).toHaveLength(3)
      expect(imageElements[0]).toHaveAttribute('src', 'https://utfs.io/image1.jpg')
      expect(imageElements[1]).toHaveAttribute('src', 'https://utfs.io/image2.jpg')
      expect(imageElements[2]).toHaveAttribute('src', 'https://utfs.io/image3.jpg')
    })

    it('should show primary badge on first image', () => {
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      expect(screen.getByText('Primary')).toBeInTheDocument()
    })

    it('should show helper text when images are present', () => {
      render(<ProductImageUpload images={['https://utfs.io/image1.jpg']} onChange={mockOnChange} />)

      expect(
        screen.getByText(/First image will be used as the primary product image/i)
      ).toBeInTheDocument()
    })
  })

  describe('Remove Image', () => {
    it('should remove image when remove button is clicked', async () => {
      const user = userEvent.setup()
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      const removeButtons = screen.getAllByTitle('Remove image')
      await user.click(removeButtons[0])

      expect(mockOnChange).toHaveBeenCalledWith(['https://utfs.io/image2.jpg'])
      expect(toast.success).toHaveBeenCalledWith('Image removed')
    })

    it('should remove correct image from middle of list', async () => {
      const user = userEvent.setup()
      const images = [
        'https://utfs.io/image1.jpg',
        'https://utfs.io/image2.jpg',
        'https://utfs.io/image3.jpg',
      ]
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      const removeButtons = screen.getAllByTitle('Remove image')
      await user.click(removeButtons[1]) // Remove middle image

      expect(mockOnChange).toHaveBeenCalledWith([
        'https://utfs.io/image1.jpg',
        'https://utfs.io/image3.jpg',
      ])
    })
  })

  describe('Reorder Images', () => {
    it('should move image up when move up button is clicked', async () => {
      const user = userEvent.setup()
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      const moveUpButtons = screen.getAllByTitle('Move up')
      await user.click(moveUpButtons[0]) // Move second image up

      expect(mockOnChange).toHaveBeenCalledWith([
        'https://utfs.io/image2.jpg',
        'https://utfs.io/image1.jpg',
      ])
    })

    it('should not show move up button for first image', () => {
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      const moveUpButtons = screen.getAllByTitle('Move up')
      expect(moveUpButtons).toHaveLength(1) // Only one button (for second image)
    })

    it('should move image down when move down button is clicked', async () => {
      const user = userEvent.setup()
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      const moveDownButtons = screen.getAllByTitle('Move down')
      await user.click(moveDownButtons[0]) // Move first image down

      expect(mockOnChange).toHaveBeenCalledWith([
        'https://utfs.io/image2.jpg',
        'https://utfs.io/image1.jpg',
      ])
    })

    it('should not show move down button for last image', () => {
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      const moveDownButtons = screen.getAllByTitle('Move down')
      expect(moveDownButtons).toHaveLength(1) // Only one button (for first image)
    })

    it('should correctly reorder three images', async () => {
      const user = userEvent.setup()
      const images = [
        'https://utfs.io/image1.jpg',
        'https://utfs.io/image2.jpg',
        'https://utfs.io/image3.jpg',
      ]
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      // Move third image up
      const moveUpButtons = screen.getAllByTitle('Move up')
      await user.click(moveUpButtons[1]) // Click second "move up" button (third image)

      expect(mockOnChange).toHaveBeenCalledWith([
        'https://utfs.io/image1.jpg',
        'https://utfs.io/image3.jpg',
        'https://utfs.io/image2.jpg',
      ])
    })
  })

  describe('Accessibility', () => {
    it('should have alt text for all images', () => {
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      expect(screen.getByAltText('Product image 1')).toBeInTheDocument()
      expect(screen.getByAltText('Product image 2')).toBeInTheDocument()
    })

    it('should have title attributes on action buttons', () => {
      const images = ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg']
      render(<ProductImageUpload images={images} onChange={mockOnChange} />)

      expect(screen.getAllByTitle('Move up')).toHaveLength(1)
      expect(screen.getAllByTitle('Move down')).toHaveLength(1)
      expect(screen.getAllByTitle('Remove image')).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single image correctly', () => {
      render(<ProductImageUpload images={['https://utfs.io/image1.jpg']} onChange={mockOnChange} />)

      // Should show primary badge
      expect(screen.getByText('Primary')).toBeInTheDocument()

      // Should only have remove button (no up/down)
      expect(screen.queryByTitle('Move up')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Move down')).not.toBeInTheDocument()
      expect(screen.getAllByTitle('Remove image')).toHaveLength(1)
    })

    it('should handle empty onChange callback', async () => {
      const user = userEvent.setup()
      const images = ['https://utfs.io/image1.jpg']
      render(<ProductImageUpload images={images} onChange={() => {}} />)

      const removeButtons = screen.getAllByTitle('Remove image')
      await user.click(removeButtons[0])

      // Should not throw error
      expect(toast.success).toHaveBeenCalledWith('Image removed')
    })

    it('should handle maxImages of 1', () => {
      render(<ProductImageUpload images={[]} onChange={mockOnChange} maxImages={1} />)

      expect(screen.getByText(/0 \/ 1 images uploaded/i)).toBeInTheDocument()
      expect(screen.getByText(/Upload up to 1 product images/i)).toBeInTheDocument()
    })
  })
})
