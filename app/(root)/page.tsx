import { getLatestProducts, getFeaturedProducts } from "@/lib/actions/product.actions";
import ProductList from "@/components/shared/product/product-list";
import ProductCarousel from "@/components/shared/product/product-carousel";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap, Shield, Truck } from "lucide-react";
import Link from "next/link";
import ErrorHandler from "@/components/shared/error-handler";
import AnimatedShoppingScene from "@/components/shared/animated-shopping-scene";
import { Product } from "@/types";

const Homepage = async () => {
  // Gracefully handle missing DATABASE_URL during build
  let latestProducts: Product[] = [];
  let featuredProducts: Product[] = [];

  try {
    latestProducts = await getLatestProducts();
    featuredProducts = await getFeaturedProducts();
  } catch {
    // During build without DATABASE_URL, use empty arrays
    console.log('Using empty product arrays (DATABASE_URL not available during build)');
  }

  return (
    <>
      <ErrorHandler />

      {/* Full-Screen Animated Shopping Scene */}
      <AnimatedShoppingScene />

      {/* Main Content Wrapper with Professional Spacing */}
      <div className="wrapper space-y-24 py-16">

        {/* Hero Section - Removed, content now integrated in animated scene */}

        {/* Features Section - Enhanced Professional Design */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Why Choose Us
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary via-secondary to-accent rounded-full mx-auto" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience premium service with every purchase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-white border-2 border-[#88BDBC]/40 hover:border-[#88BDBC] hover:shadow-[0_8px_30px_rgba(136,189,188,0.25)] transition-all duration-300 hover:-translate-y-1">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#254E58]/10 to-[#254E58]/5 text-[#254E58] group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#254E58]">Free Shipping</h3>
                <p className="text-[#6E6658]">On orders over $50</p>
              </div>
            </div>

            <div className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-white border-2 border-[#88BDBC]/40 hover:border-[#88BDBC] hover:shadow-[0_8px_30px_rgba(136,189,188,0.25)] transition-all duration-300 hover:-translate-y-1">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#88BDBC]/10 to-[#88BDBC]/5 text-[#88BDBC] group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#254E58]">Secure Payment</h3>
                <p className="text-[#6E6658]">100% secure transactions</p>
              </div>
            </div>

            <div className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-white border-2 border-[#88BDBC]/40 hover:border-[#88BDBC] hover:shadow-[0_8px_30px_rgba(136,189,188,0.25)] transition-all duration-300 hover:-translate-y-1">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#88BDBC]/10 to-[#88BDBC]/5 text-[#88BDBC] group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#254E58]">Fast Delivery</h3>
                <p className="text-[#6E6658]">2-3 business days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Carousel Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Featured Products
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary via-secondary to-accent rounded-full mx-auto" />
          </div>
          <ProductCarousel products={featuredProducts} />
        </section>

        {/* Products Section with Enhanced Styling */}
        <section id="products" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Newest Arrivals
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary via-secondary to-accent rounded-full mx-auto" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our latest collection of premium products
            </p>
          </div>
          <ProductList data={latestProducts} title="" limit={4} />
        </section>

        {/* Call to Action Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-12 md:p-16 border border-border/40">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
              <Zap className="w-4 h-4" />
              <span>New Arrivals Every Week</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              Ready to Start Shopping?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover our premium collection
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/search">
                  <ShoppingBag className="w-5 h-5" />
                  Browse All Products
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Homepage;