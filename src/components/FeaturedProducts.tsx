
import { Loader2, Sparkles } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import ProductCard from "./ProductCard";

import { useBranchContext } from "@/context/BranchContext";

const FeaturedProducts = () => {
  const { selectedBranch } = useBranchContext();
  const { data: products, isLoading, error } = useProducts(undefined, true, selectedBranch?.id);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
        <p className="text-primary font-bold animate-pulse">جاري تحضير قائمة السعادة...</p>
      </div>
    );
  }

  // On error, render silently (no error message shown to customers)
  if (error || !products?.length) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 relative overflow-hidden font-tajawal rtl bg-background">
      {/* Background Texture */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#222319 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center mb-16 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest mx-auto">
              <Sparkles className="h-3 w-3" />
              Elite Collection
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-tight">
              مختارات <span className="text-secondary italic">حصرية</span> <br />
              تتناسب مع ذوقك الرفيع
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products
            .filter(p => p.image && p.image !== "null" && p.image !== "undefined" && !p.image.includes("placeholder"))
            .map((product, idx) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <ProductCard
                  {...product}
                  category={product.category_name}
                  categoryId={product.category_id}
                />
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
