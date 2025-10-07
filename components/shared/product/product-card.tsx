"use client";

import { CardHeader, Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import ProductPrice from "./product-price";
import { Product } from "@/types";
import { Star } from "lucide-react";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="group w-full max-w-sm border-border/40 hover:border-primary/30 hover:shadow-medium transition-all duration-300 overflow-hidden">
      <CardHeader className="p-0 items-center relative overflow-hidden">
        <Link href={`/product/${product.slug || ""}`} className="relative block w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          {product.images && product.images.length > 0 ? (
            <div className="relative overflow-hidden aspect-square">
              <Image
                src={product.images[0]}
                alt={product.name || "Product Image"}
                width={300}
                height={300}
                priority={true}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </Link>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-warning text-warning-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-medium z-20">
            Low Stock
          </div>
        )}
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {product.brand}
        </div>
        <Link href={`/product/${product.slug}`} className="block group/title">
          <h2 className="text-base font-semibold text-foreground line-clamp-2 group-hover/title:text-primary transition-colors">
            {product.name}
          </h2>
        </Link>
        <div className="flex-between gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="text-sm font-medium text-foreground">{product.rating}</span>
          </div>
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} className="text-lg font-bold text-primary" />
          ) : (
            <span className="text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-md">
              Out of Stock
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;