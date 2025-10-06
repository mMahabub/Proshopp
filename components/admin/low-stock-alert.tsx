import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface LowStockProduct {
  id: string
  name: string
  slug: string
  stock: number
  price: number
  image: string
}

interface LowStockAlertProps {
  products: LowStockProduct[]
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alert</CardTitle>
          <CardDescription>Products with stock below 5 units</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No low stock products</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alert</CardTitle>
        <CardDescription>Products with stock below 5 units</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <Alert key={product.id} variant="destructive" className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-3 flex-1 min-w-0">
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
                    <AlertDescription className="font-medium text-sm mb-1 truncate">
                      {product.name}
                    </AlertDescription>
                  </Link>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-semibold">
                      Stock: {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
