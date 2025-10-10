'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import { X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ProductImageUploadProps {
  /**
   * Currently uploaded image URLs
   */
  images: string[]
  /**
   * Callback when images are updated (added/removed/reordered)
   */
  onChange: (images: string[]) => void
  /**
   * Maximum number of images allowed (default: 5)
   */
  maxImages?: number
  /**
   * Disable upload functionality
   */
  disabled?: boolean
}

export default function ProductImageUpload({
  images,
  onChange,
  maxImages = 5,
  disabled = false,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const canUploadMore = images.length < maxImages

  /**
   * Handle successful upload
   */
  const handleUploadComplete = (res: { url: string }[]) => {
    setIsUploading(false)

    if (res && res.length > 0) {
      const newImageUrls = res.map((file) => file.url)
      const updatedImages = [...images, ...newImageUrls].slice(0, maxImages)
      onChange(updatedImages)
      toast.success(`${res.length} image(s) uploaded successfully`)
    }
  }

  /**
   * Handle upload error
   */
  const handleUploadError = (error: Error) => {
    setIsUploading(false)
    console.error('Upload error:', error)
    toast.error(error.message || 'Failed to upload images')
  }

  /**
   * Handle upload start
   */
  const handleUploadBegin = () => {
    setIsUploading(true)
    toast.info('Uploading images...')
  }

  /**
   * Remove an image from the list
   */
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    onChange(updatedImages)
    toast.success('Image removed')
  }

  /**
   * Move image up in the list (for reordering)
   */
  const moveImageUp = (index: number) => {
    if (index === 0) return
    const updatedImages = [...images]
    const temp = updatedImages[index]
    updatedImages[index] = updatedImages[index - 1]
    updatedImages[index - 1] = temp
    onChange(updatedImages)
  }

  /**
   * Move image down in the list (for reordering)
   */
  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return
    const updatedImages = [...images]
    const temp = updatedImages[index]
    updatedImages[index] = updatedImages[index + 1]
    updatedImages[index + 1] = temp
    onChange(updatedImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canUploadMore && !disabled && (
        <div className="flex items-center gap-4">
          <UploadButton<OurFileRouter, 'productImage'>
            endpoint="productImage"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={handleUploadBegin}
            disabled={isUploading}
            className="ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:px-4 ut-button:py-2 ut-button:rounded-md ut-button:text-white ut-button:font-medium ut-allowed-content:hidden"
          />
          <p className="text-sm text-muted-foreground">
            {images.length} / {maxImages} images uploaded
          </p>
        </div>
      )}

      {/* Info Message */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-muted rounded-lg p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images uploaded</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload up to {maxImages} product images (max 4MB each)
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP, GIF
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={imageUrl}
              className="relative group border border-border rounded-lg overflow-hidden aspect-square"
            >
              {/* Image Preview */}
              <Image
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* Image Badge (primary image indicator) */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Move Up */}
                {index > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => moveImageUp(index)}
                    className="h-8 w-8 p-0"
                    title="Move up"
                  >
                    ↑
                  </Button>
                )}

                {/* Move Down */}
                {index < images.length - 1 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => moveImageDown(index)}
                    className="h-8 w-8 p-0"
                    title="Move down"
                  >
                    ↓
                  </Button>
                )}

                {/* Remove */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          First image will be used as the primary product image. Hover over
          images to reorder or remove them.
        </p>
      )}
    </div>
  )
}
