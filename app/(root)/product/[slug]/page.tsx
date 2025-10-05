import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug } from '@/lib/actions/product.actions';
import { notFound } from 'next/navigation';
import ProductPrice from '@/components/shared/product/product-price';
import ProductImages from '@/components/shared/product/product-images';
import AddToCartButton from '@/components/shared/product/add-to-cart-button';
import { Star } from 'lucide-react';

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Ensure rating is a number
  const rating =
    typeof product.rating === 'string'
      ? parseFloat(product.rating)
      : product.rating;

  // Helper to render star icons
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? 'text-yellow-500' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <section className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Product Images */}
          <div className="col-span-2">
            <ProductImages images={product.images} />
          </div>

          {/* Product Details */}
          <div className="col-span-2 p-5 bg-white shadow-md rounded-lg">
            <div className="flex flex-col gap-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {product.brand} / {product.category}
              </p>
              <h1 className="text-2xl font-bold text-gray-800">
                {product.name}
              </h1>

              <div>
                <p className="text-sm text-gray-500">
                  {rating} out of {product.numReviews} Reviews
                </p>
                <div className="flex items-center mt-2">
                  {renderStars(rating)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ProductPrice
                  value={Number(product.price)}
                  className="text-2xl font-bold text-green-600"
                />
                {product.stock > 0 ? (
                  <Badge
                    variant="outline"
                    className="text-green-700 bg-green-100"
                  >
                    In Stock
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="text-red-700 bg-red-100"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-10">
              <p className="font-semibold text-gray-800">Description</p>
              <p className="text-sm text-gray-600 mt-2">
                {product.description}
              </p>
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="col-span-1">
            <Card className="shadow-md rounded-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <ProductPrice
                    value={Number(product.price)}
                    className="text-lg font-bold text-gray-800"
                  />
                </div>
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  {product.stock > 0 ? (
                    <Badge
                      variant="outline"
                      className="text-green-700 bg-green-100"
                    >
                      In Stock
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="text-red-700 bg-red-100"
                    >
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: Number(product.price),
                    image: product.images[0] || '/placeholder.png',
                    stock: product.stock,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsPage;