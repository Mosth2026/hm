
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Star, ShoppingBag, ShoppingCart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { cn, cleanImageUrl, cleanProductName, formatPrice } from "@/lib/utils";

const Hero = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .not('image', 'ilike', '%unsplash.com%')
          .not('image', 'is', null)
          .neq('image', '')
          .gt('stock', 0)
          .gt('price', 0)
          .limit(100);

        if (error) throw error;
        if (data && data.length > 0) {
          // Shuffle the products to keep it fresh
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setFeaturedProducts(shuffled);
        }
      } catch (err) {
        console.error("Error fetching hero products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 12000); // 12 seconds interval

    return () => clearInterval(timer);
  }, [featuredProducts]);

  const currentProduct = featuredProducts[currentIndex];

  return (
    <section className="relative min-h-[70vh] flex flex-col pt-32 md:pt-40 overflow-hidden font-tajawal rtl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-0">

          {/* Content Section */}
          <div className="space-y-8 text-right">
            <div className="flex flex-wrap items-center gap-4 justify-start lg:justify-end">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary animate-fade-in text-sm font-bold">
                <Star className="h-4 w-4 fill-secondary" />
                <span className="font-black uppercase tracking-widest font-outfit">The Premium Collection 2026</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[1.1]">
                فن اختيار <br />
                <span className="text-secondary italic">السعادة العالمية</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
                بخبرة تزيد عن 15 عاماً في قطاع التجزئة الفاخر، ننتقي لك بعناية فائقة أفضل ما جربه المسافرون في عواصم العالم. منتجاتنا ليست مجرد سناكس، بل هي قصص وذكريات تأتي إليك بمعايير الجودة العالمية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-105 group"
                asChild
              >
                <Link to="/categories/chocolate">
                  <ShoppingBag className="ml-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  اكتشف تشكيلة النخبة
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold border-2 border-primary/10 hover:bg-primary/5 transition-all group"
                asChild
              >
                <Link to="/categories/coffee">
                  تجربة القهوة المختصة
                  <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-primary/5">
              <div>
                <h4 className="text-3xl font-black text-primary">+150</h4>
                <p className="text-sm text-muted-foreground font-bold">علامة تجارية</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-primary">100%</h4>
                <p className="text-sm text-muted-foreground font-bold">أصالة وجودة</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-primary">+15</h4>
                <p className="text-sm text-muted-foreground font-bold">عام من الخبرة</p>
              </div>
            </div>
          </div>

          {/* Image Section / Carousel */}
          <div className="relative lg:block hidden">
            {!loading && currentProduct ? (
              <div key={currentProduct.id} className="animate-in fade-in duration-1000">
                <div className="relative z-20 animate-float">
                  <div className="absolute inset-0 bg-secondary/20 rounded-[3rem] rotate-6 scale-95 blur-2xl" />
                  <Link to={`/products/${currentProduct.id}`}>
                    <img
                      src={cleanImageUrl(currentProduct.image)}
                      alt={currentProduct.name}
                      className="relative z-10 w-full h-[500px] lg:h-[550px] object-cover rounded-[3rem] shadow-2xl border-8 border-white transition-opacity duration-1000"
                    />
                  </Link>
                </div>

                {/* Floating Cards - Dynamic */}
                <div className="absolute -right-12 top-1/4 z-30 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 animate-bounce cursor-pointer hover:scale-110 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                      <Star className="h-6 w-6 fill-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold">
                        {currentProduct.is_on_sale ? "عرض خاص" : (currentProduct.is_new ? "وصل حديثاً" : "الأعلى تقييماً")}
                      </p>
                      <p className="text-primary font-black">{currentProduct.category_name || "منتج فاخر"}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-12 bottom-1/4 z-30 bg-primary/90 text-white p-6 rounded-3xl shadow-2xl border border-white/10 animate-float cursor-pointer hover:scale-110 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-white/60 font-bold">الأكثر طلباً</p>
                        <p className="text-secondary font-black bg-white/10 px-2 py-0.5 rounded-lg text-sm">{formatPrice(currentProduct.price)}</p>
                      </div>
                      <p className="text-white font-black">{cleanProductName(currentProduct.name)}</p>
                    </div>
                  </div>
                </div>

                {/* Dots Indicator */}
                {/* Dots Indicator - Only show if count is reasonable */}
                {featuredProducts.length <= 15 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                    {featuredProducts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-500",
                          i === currentIndex ? "w-8 bg-secondary" : "w-2 bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[550px] w-full bg-primary/5 rounded-[3rem] flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-secondary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
