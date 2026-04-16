
import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Star, ShoppingCart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn, cleanImageUrl, cleanProductName, formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

const PromotionCarousel = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl' }, [Autoplay({ delay: 5000, stopOnInteraction: false })] as any);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const addItem = useCart((state) => state.addItem);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or('name.ilike.%سويس فرو%,name.ilike.%Swiss Fru%,category_name.ilike.%سويس فرو%,category_name.ilike.%Swiss Fru%')
          .gt('price', 0)
          .gt('stock', 0)
          .not('image', 'is', null)
          .neq('image', '')
          .not('image', 'ilike', '%unsplash.com%')
          .limit(50);

        if (error) throw error;
        if (data) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching Swiss Fru banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      ...product,
      name: cleanProductName(product.name),
      category_name: product.category_name || "سويس فرو"
    });

    toast.success(`تم إضافة ${cleanProductName(product.name)} إلى السلة`, {
      style: { background: 'var(--primary)', color: 'white', borderRadius: '1rem' },
      duration: 2000
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[40vh] md:h-[55vh] flex items-center justify-center bg-primary/5 rounded-[2rem] md:rounded-[3rem] scale-95 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative w-full h-[45vh] md:h-[65vh] overflow-hidden font-tajawal rtl py-4 md:py-8 container mx-auto px-4">
      <div className="overflow-hidden h-full rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-primary/10 border border-primary/5" ref={emblaRef}>
        <div className="flex h-full">
          {products.map((product, index) => (
            <div key={product.id} className="flex-[0_0_100%] h-full relative group">
              {/* Background Plate - App Style */}
              <div className="absolute inset-0 bg-[#f9f9f9]" />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
              
              <Link to={`/products/${product.id}`} className="absolute inset-0 z-10" />

              <div className="relative h-full container mx-auto px-8 md:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                {/* Content Side */}
                <div className="order-2 md:order-1 space-y-4 md:space-y-6 text-right z-20">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-primary text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                      <Star className="h-3 w-3 fill-primary" />
                      أفضل المنتجات
                    </div>
                    {product.is_on_sale && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saada-red text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                         خصم خاص
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-secondary font-black text-xs md:text-lg uppercase tracking-widest leading-none">SWISS FRU COLLECTION</h3>
                    <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-primary leading-tight">
                      {cleanProductName(product.name)}
                    </h2>
                    <p className="text-sm md:text-lg text-muted-foreground font-bold line-clamp-2 max-w-lg">
                      {cleanProductName(product.description) || "استمتع بمذاق السعادة الحقيقي مع منتجات سويس فرو الأصلية."}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">السعر الحالي</span>
                      <span className="text-2xl md:text-4xl font-black text-primary tracking-tighter">{formatPrice(product.price)}</span>
                    </div>
                    
                    <Button
                       onClick={(e) => handleQuickAdd(e, product)}
                       size="lg"
                       className="relative z-30 h-14 md:h-16 px-8 bg-primary hover:bg-black text-white rounded-2xl text-lg font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group flex gap-3"
                    >
                      <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 group-hover:rotate-12 transition-transform" />
                      <span>أضف للسلة</span>
                    </Button>
                  </div>
                </div>

                {/* Image Side */}
                <div className="order-1 md:order-2 flex justify-center items-center z-20">
                   <div className="relative group/img h-[200px] md:h-[400px] lg:h-[450px] w-full max-w-[450px]">
                      <div className="absolute inset-0 bg-secondary/20 rounded-full blur-[60px] scale-75 group-hover/img:scale-110 transition-transform duration-1000" />
                      <img
                        src={cleanImageUrl(product.image)}
                        alt={product.name}
                        className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover/img:scale-110 group-hover/img:-rotate-3 transition-transform duration-700"
                      />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Indicators */}
      <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-1.5 md:h-2 rounded-full transition-all duration-700",
              i === selectedIndex ? "w-10 md:w-16 bg-primary shadow-[0_0_15px_rgba(0,0,0,0.2)]" : "w-1.5 md:w-2 bg-primary/20 hover:bg-primary/40"
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default PromotionCarousel;
