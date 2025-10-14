"use client";

import { CardHeader, Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import ProductPrice from "./product-price";
import { Product } from "@/types";
import { Star, Sparkles, TrendingUp } from "lucide-react";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  return (
    <Card className="group relative w-full max-w-sm border-2 border-[#88BDBC]/40 hover:border-[#88BDBC] hover:shadow-[0_8px_30px_rgba(136,189,188,0.25)] transition-all duration-300 overflow-hidden bg-white">
      {/* Decorative Teal Mist overlay on card */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#88BDBC]/5 via-[#254E58]/5 to-[#88BDBC]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="p-0 items-center relative overflow-hidden">
        <Link href={`/product/${product.slug || ""}`} className="relative block w-full">
          {/* Image container with enhanced styling */}
          {product.images && product.images.length > 0 ? (
            <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-muted to-muted/50">
              <Image
                src={product.images[0]}
                alt={product.name || "Product Image"}
                width={300}
                height={300}
                priority={true}
                className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              />

              {/* Enhanced gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          ) : (
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </Link>

        {/* Badges container - top corners */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-3 z-20">
          {/* Featured badge - top left */}
          {featured && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary via-secondary to-accent px-3 py-1.5 rounded-full shadow-strong animate-in fade-in slide-in-from-left-5 duration-500">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white tracking-wide">FEATURED</span>
            </div>
          )}

          {/* Low stock badge - top right */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="ml-auto flex items-center gap-1.5 bg-warning/95 backdrop-blur-sm text-warning-foreground px-3 py-1.5 rounded-full shadow-medium border border-warning/20">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">Only {product.stock} left!</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative p-5 space-y-3">
        {/* Brand badge with gradient background */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            {product.brand}
          </span>
        </div>

        {/* Product name with enhanced hover effect */}
        <Link href={`/product/${product.slug}`} className="block group/title">
          <h2 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover/title:text-transparent group-hover/title:bg-gradient-to-r group-hover/title:from-primary group-hover/title:via-secondary group-hover/title:to-accent group-hover/title:bg-clip-text transition-all duration-300">
            {product.name}
          </h2>
        </Link>

        {/* Rating and price section with enhanced styling */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/50">
          {/* Rating with background */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
            <Star className="w-4 h-4 fill-warning text-warning drop-shadow-sm" />
            <span className="text-sm font-bold text-foreground">{product.rating}</span>
            <span className="text-xs text-muted-foreground">/5</span>
          </div>

          {/* Price or stock status */}
          {product.stock > 0 ? (
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground line-through">
                ${(Number(product.price) * 1.2).toFixed(2)}
              </span>
              <ProductPrice
                value={Number(product.price)}
                className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/15 border-2 border-destructive/30">
              <span className="text-sm font-bold text-destructive">Out of Stock</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Bottom gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
};

export default ProductCard;