
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Helmet } from "react-helmet-async";
import { useProducts } from "@/hooks/use-products";
import { Loader2, Sparkles, Filter } from "lucide-react";

const categoryNames: Record<string, string> = {
  chocolate: "مختارات الشوكولاتة",
  coffee: "عالم القهوة المختصة",
  cookies: "عالم الكوكيز والبسكويت",
  candy: "عالم الكاندي",
  snacks: "سناكس السعادة",
  drinks: "المشروبات المنعشة",
  cosmetics: "مستحضرات التجميل",
  gifts: "صناديق الهدايا",
};

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { data: products, isLoading, error } = useProducts(categoryId);

  const categoryName = categoryId ? categoryNames[categoryId] || categoryId : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-tajawal rtl">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="text-primary font-bold animate-pulse">ننتقي لك أفضل مختارات {categoryName}...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{categoryName} | صناع السعادة</title>
        <meta name="description" content={`استكشف تشكيلتنا الحصرية من ${categoryName} الفاخرة في متجر صناع السعادة.`} />
      </Helmet>
      <div className="min-h-screen flex flex-col font-tajawal rtl bg-white">
        <Header />
        <main className="flex-grow pt-32 md:pt-40">

          {/* Page Header */}
          <div className="relative py-20 bg-primary/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
            <div className="container mx-auto px-4 md:px-8 relative z-10">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  Elite Collection
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight">
                  {categoryName}
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  استكشف عالم الجودة والمذاق الاستثنائي مع تشكيلتنا المختارة بعناية من {categoryName}.
                </p>
              </div>
            </div>
          </div>

          <section className="py-20">
            <div className="container mx-auto px-4 md:px-8">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-12 py-4 border-b border-primary/5">
                <p className="text-sm font-bold text-muted-foreground italic">عرض {products?.length || 0} منتج فاخر</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-black text-primary">
                  <Filter className="h-4 w-4" />
                  تصفية النتائج
                </button>
              </div>

              {error ? (
                <div className="text-center py-24 bg-destructive/5 rounded-[3rem] border border-destructive/10">
                  <p className="text-xl font-black text-destructive">عذراً، حدث خطأ أثناء تحميل المنتجات.</p>
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {products.map((product, idx) => (
                    <div
                      key={product.id}
                      className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <ProductCard
                        {...product}
                        category={product.category_name}
                        categoryId={product.category_id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/10">
                  <p className="text-2xl font-black text-primary/30 italic">لا توجد منتجات متاحة حالياً في هذه القائمة.</p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CategoryPage;

