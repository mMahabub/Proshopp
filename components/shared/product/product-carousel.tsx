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
    <section className="w-full bg-gradient-to-b from-muted/30 to-background py-8">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id}>
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-muted">
                    {/* Product Image */}
                    <Image
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Product Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <div className="max-w-4xl">
                        <h2 className="mb-2 text-3xl font-bold md:text-4xl lg:text-5xl">
                          {product.name}
                        </h2>
                        <p className="text-2xl font-semibold md:text-3xl">
                          ${formatNumberWithDecimal(Number(product.price))}
                        </p>
                        <div className="mt-4">
                          <span className="inline-block rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            Shop Now
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Featured Badge */}
                    <div className="absolute right-4 top-4">
                      <span className="rounded-full bg-gradient-to-r from-primary via-secondary to-accent px-4 py-1 text-sm font-semibold text-white shadow-lg">
                        Featured
                      </span>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons */}
          <CarouselPrevious className="left-4 h-10 w-10 border-2 border-white/80 bg-white/90 text-foreground transition-all hover:bg-white hover:scale-110" />
          <CarouselNext className="right-4 h-10 w-10 border-2 border-white/80 bg-white/90 text-foreground transition-all hover:bg-white hover:scale-110" />
        </Carousel>
      </div>
    </section>
  )
}
