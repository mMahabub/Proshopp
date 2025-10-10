'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { insertProductSchema } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ProductImageUpload from '@/components/shared/product/product-image-upload'
import { Loader2 } from 'lucide-react'

type ProductFormValues = z.infer<typeof insertProductSchema>

interface ProductFormProps {
  /**
   * Default values for the form (used in edit mode)
   */
  defaultValues?: Partial<ProductFormValues>
  /**
   * Submit handler that receives FormData
   */
  onSubmit: (formData: FormData) => Promise<{
    success: boolean
    message?: string
    error?: string
  }>
  /**
   * Label for the submit button
   */
  submitLabel?: string
  /**
   * Whether the form is in edit mode (shows different messaging)
   */
  isEditMode?: boolean
}

/**
 * Generate URL-friendly slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export default function ProductForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Product',
  isEditMode = false,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEditMode)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      slug: defaultValues?.slug || '',
      category: defaultValues?.category || '',
      brand: defaultValues?.brand || '',
      description: defaultValues?.description || '',
      stock: defaultValues?.stock || 0,
      images: defaultValues?.images || [],
      isFeatured: defaultValues?.isFeatured || false,
      banner: defaultValues?.banner || null,
      price: defaultValues?.price || '',
    },
  })

  // Watch name field to auto-generate slug
  const nameValue = form.watch('name')

  useEffect(() => {
    if (autoGenerateSlug && nameValue) {
      const slug = generateSlug(nameValue)
      form.setValue('slug', slug)
    }
  }, [nameValue, autoGenerateSlug, form])

  const handleSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Convert form data to FormData for server action
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('slug', data.slug)
      formData.append('category', data.category)
      formData.append('brand', data.brand)
      formData.append('description', data.description)
      formData.append('stock', data.stock.toString())
      formData.append('images', JSON.stringify(data.images))
      formData.append('isFeatured', data.isFeatured.toString())
      formData.append('banner', data.banner || '')
      formData.append('price', data.price)

      const result = await onSubmit(formData)

      if (!result.success) {
        setSubmitError(result.error || 'An error occurred')
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Error Alert */}
        {submitError && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{submitError}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormDescription>
                  The name of your product as it will appear to customers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      placeholder="product-url-slug"
                      {...field}
                      disabled={autoGenerateSlug}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto-slug"
                        checked={autoGenerateSlug}
                        onCheckedChange={(checked) =>
                          setAutoGenerateSlug(checked === true)
                        }
                      />
                      <label
                        htmlFor="auto-slug"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Auto-generate from product name
                      </label>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  URL-friendly version of the product name (e.g., my-awesome-product)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Electronics, Clothing, Books" {...field} />
                </FormControl>
                <FormDescription>
                  The category this product belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Apple, Nike, Samsung" {...field} />
                </FormControl>
                <FormDescription>
                  The brand or manufacturer of the product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter detailed product description"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A detailed description of the product features and benefits
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pricing & Inventory</h2>

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Product price in USD (must have exactly 2 decimal places)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Number of items available in inventory
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Product Images</h2>

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ProductImageUpload
                    images={field.value}
                    onChange={field.onChange}
                    maxImages={5}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Upload up to 5 product images (first image will be the primary image)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Additional Settings</h2>

          {/* Featured */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Product</FormLabel>
                  <FormDescription>
                    Display this product in the featured products carousel on the homepage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Banner (optional) */}
          <FormField
            control={form.control}
            name="banner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/banner.jpg"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Optional banner image for featured products
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              submitLabel
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
