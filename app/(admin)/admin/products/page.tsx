import { getAllProducts } from '@/lib/actions/product.actions'
import ProductsTable from '@/components/admin/products-table'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'Products Management - Admin',
  description: 'Manage all products',
}

interface SearchParams {
  page?: string
  category?: string
  search?: string
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const category = params.category || ''
  const search = params.search || ''

  const productsResult = await getAllProducts({
    page,
    limit: 10,
    category: category || undefined,
    search: search || undefined,
  })

  if (!productsResult.success) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">Manage all products</p>
        </div>
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading products</p>
          <p className="text-sm mt-1">{productsResult.error}</p>
        </div>
      </div>
    )
  }

  const { products, pagination } = productsResult.data!

  const handleFilterChange = async (category: string, search: string, page: number) => {
    'use server'
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())

    redirect(`/admin/products${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage all products ({pagination.total} total)
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/admin/products/add">
            <Plus className="h-5 w-5" />
            Add Product
          </Link>
        </Button>
      </div>

      <ProductsTable
        initialProducts={products}
        initialPagination={pagination}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
