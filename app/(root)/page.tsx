import { getLatestProducts } from "@/lib/actions/product.actions";
import ProductList from "@/components/shared/product/product-list";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap, Shield, Truck } from "lucide-react";
import Link from "next/link";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-20 mb-16 rounded-2xl border border-border/40">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative wrapper text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            <span>New Arrivals Every Week</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Discover Premium Products
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Shop the latest collection of high-quality products at unbeatable prices. Your satisfaction is our priority.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="#products">
                <ShoppingBag className="w-5 h-5" />
                Shop Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/search">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-medium transition-all duration-300">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Free Shipping</h3>
            <p className="text-sm text-muted-foreground">On orders over $50</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/40 hover:border-secondary/30 hover:shadow-medium transition-all duration-300">
          <div className="p-3 rounded-lg bg-secondary/10 text-secondary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Secure Payment</h3>
            <p className="text-sm text-muted-foreground">100% secure transactions</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/40 hover:border-accent/30 hover:shadow-medium transition-all duration-300">
          <div className="p-3 rounded-lg bg-accent/10 text-accent">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">2-3 business days</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div id="products">
        <ProductList data={latestProducts} title="Newest Arrivals" limit={4} />
      </div>
    </>
  );
};

export default Homepage;