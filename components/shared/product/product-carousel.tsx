'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { formatNumberWithDecimal } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: string
  images: string[]
}

interface ProductCarouselProps {
  products: Product[]
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || products.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-gradient-to-b from-muted/30 to-background py-12">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Featured Products
          </h2>
          <p className="mt-2 text-muted-foreground">
            Discover our handpicked selection
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link href={`/product/${product.slug}`} className="block group">
                  <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-300 hover:shadow-strong hover:border-primary/30">
                    {/* Product Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      <Image
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />

                      {/* Featured Badge */}
                      <div className="absolute right-2 top-2">
                        <span className="rounded-full bg-gradient-to-r from-primary via-secondary to-accent px-3 py-1 text-xs font-semibold text-white shadow-md">
                          Featured
                        </span>
                      </div>
                    </div>

                    {/* Product Info Below Image */}
                    <div className="p-4">
                      <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xl font-bold text-primary">
                        ${formatNumberWithDecimal(Number(product.price))}
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons */}
          <CarouselPrevious className="left-2 h-10 w-10 border-2 border-border bg-background/95 text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary" />
          <CarouselNext className="right-2 h-10 w-10 border-2 border-border bg-background/95 text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary" />
        </Carousel>
      </div>
    </section>
  )
}
