
import { Loader2, Sparkles } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const { data: products, isLoading, error } = useProducts(undefined, true);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
        <p className="text-primary font-bold animate-pulse">جاري تحضير قائمة السعادة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <div className="bg-destructive/10 text-destructive p-6 rounded-[2rem] inline-block">
          <p className="font-black">عذراً، حدث خطأ أثناء تحميل المنتجات.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden font-tajawal rtl bg-background">
      {/* Background Texture */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#222319 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="text-right space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              Elite Collection
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-primary leading-tight">
              مختارات <span className="text-secondary italic">حصرية</span> <br />
              تتناسب مع ذوقك الرفيع
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products && products.length > 0 ? (
            products.map((product, idx) => (
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
          ) : (
            <div className="col-span-full text-center py-20 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/10">
              <p className="text-xl font-bold text-muted-foreground italic">لا توجد منتجات مميزة متاحة حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
