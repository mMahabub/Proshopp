import { getProductById, updateProduct, deleteProduct } from '@/lib/actions/product.actions'
import ProductForm from '@/components/admin/product-form'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export const metadata = {
  title: 'Edit Product - Admin',
  description: 'Edit product details',
}

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  // Fetch product
  const productResult = await getProductById(id)

  if (!productResult.success || !productResult.data) {
    notFound()
  }

  const product = productResult.data

  // Update handler
  const handleUpdate = async (formData: FormData) => {
    'use server'

    const result = await updateProduct(id, formData)

    if (result.success) {
      redirect('/admin/products')
    }

    return result
  }

  // Delete handler
  const handleDelete = async () => {
    'use server'

    const result = await deleteProduct(id)

    if (result.success) {
      redirect('/admin/products')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-2">
            Update product details for: {product.name}
          </p>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg" className="gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Product
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the product &quot;{product.name}&quot;.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="max-w-4xl">
        <ProductForm
          defaultValues={{
            name: product.name,
            slug: product.slug,
            category: product.category,
            brand: product.brand,
            description: product.description,
            stock: product.stock,
            images: product.images,
            isFeatured: product.isFeatured,
            banner: product.banner,
            price: product.price,
          }}
          onSubmit={handleUpdate}
          submitLabel="Update Product"
          isEditMode={true}
        />
      </div>
    </div>
  )
}
