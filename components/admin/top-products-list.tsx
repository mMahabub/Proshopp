import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface TopProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string
  totalSales: number
  orderCount: number
}

interface TopProductsListProps {
  products: TopProduct[]
}

export default function TopProductsList({ products }: TopProductsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Selling Products
        </CardTitle>
        <CardDescription>Best performing products by quantity sold</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales data yet</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${product.slug}`}
                    className="hover:underline"
                    target="_blank"
                  >
                    <p className="font-medium text-sm truncate">{product.name}</p>
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{product.totalSales} units sold</span>
                    <span>•</span>
                    <span>{product.orderCount} orders</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-right flex-shrink-0">
                  {formatCurrency(product.price)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
