import ProductCard from './product-card';
import { Product } from '@/types';
const ProductList = ({ data, title }: { data: Product[]; title?: string; limit?: number; }) => {
  return (
    <section className="my-16 animate-in">
      <div className="mb-8">
        <h2 className="h2-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />
      </div>
      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {data.map((product: Product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-border/40">
          <p className="text-lg text-muted-foreground font-medium">No products found</p>
          <p className="text-sm text-muted-foreground/70 mt-2">Check back soon for new arrivals</p>
        </div>
      )}
    </section>
  );
};

export default ProductList;
