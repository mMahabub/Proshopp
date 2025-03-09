"use client"; // Ensure it's a client component

import { CardHeader, Card, CardContent } from "@/components/ui/card";
import Link from "next/link"; // ✅ Use next/link instead of lucide-react
import Image from "next/image";
import ProductPrice from "./product-price";
import { Product } from "@/types";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        {/* ✅ Ensure product.slug exists */}
        <Link href={`/product/${product.slug || ""}`} passHref>
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]} // ✅ Ensure this is always defined
              alt={product.name || "Product Image"}
              width={300}
              height={300}
              priority={true}
            />
          ) : (
            <div className="h-[300px] w-[300px] bg-gray-200 flex items-center justify-center">
              <span>No Image</span>
            </div>
          )}
        </Link>
      </CardHeader>
      <CardContent>
        <div className="text-xs">{product.brand}</div>
        <Link href={`/product/${product.slug}`} >
        <h2 className="text-sm font-medium">{product.name} </h2>
        </Link>
        <div className="flex-between gap-4">
            <p>${product.rating} Stars</p>
            {product.stock > 0 ? (
                <ProductPrice value={Number(product.price)} className="text-red-500"/>
            ) : (
                <p className='text-destructive'>Out Of Stock</p>
            )}

        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;