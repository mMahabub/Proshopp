import { createProduct } from '@/lib/actions/product.actions'
import ProductForm from '@/components/admin/product-form'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Add Product - Admin',
  description: 'Create a new product',
}

export default function AddProductPage() {
  const handleSubmit = async (formData: FormData) => {
    'use server'

    const result = await createProduct(formData)

    if (result.success) {
      redirect('/admin/products')
    }

    return result
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground mt-2">
          Create a new product for your store
        </p>
      </div>

      <div className="max-w-4xl">
        <ProductForm
          onSubmit={handleSubmit}
          submitLabel="Create Product"
          isEditMode={false}
        />
      </div>
    </div>
  )
}
