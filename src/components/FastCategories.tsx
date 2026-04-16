import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryNode {
  id: string;
  label: string;
  parent_id: string | null;
  order_index?: number;
  image?: string;
  preview_image?: string; // Dynamically fetched
}

// Arabic Normalization for robust matching
const _norm = (input: string) => {
  let text = (input || "").trim();
  text = text.replace(/[أإآ]/g, 'ا');
  text = text.replace(/ة/g, 'ه');
  text = text.replace(/ى/g, 'ي');
  return text;
};

const CATEGORY_STYLES: Record<string, { bg: string, icon: string }> = {
  'شوكولا': { bg: 'bg-[#FEF3F2]', icon: 'https://pngimg.com/uploads/chocolate/chocolate_PNG97.png' },
  'سويس': { bg: 'bg-[#222319] text-secondary', icon: '' }, // Special for Swiss Fru
  'مشروب': { bg: 'bg-[#F0F9FF]', icon: 'https://pngimg.com/uploads/can/can_PNG34.png' },
  'نودلز': { bg: 'bg-[#FFF1F1]', icon: 'https://pngimg.com/uploads/noodle/noodle_PNG24.png' },
  'مكسرات': { bg: 'bg-[#FEF7ED]', icon: 'https://pngimg.com/uploads/almond/almond_PNG1.png' },
  'كيك': { bg: 'bg-[#FFF4FC]', icon: 'https://pngimg.com/uploads/cake/cake_PNG13123.png' },
  'كوكيز': { bg: 'bg-[#FFFBEB]', icon: 'https://pngimg.com/uploads/cookie/cookie_PNG52.png' },
  'شيبس': { bg: 'bg-[#F8FAFC]', icon: 'https://pngimg.com/uploads/potato_chips/potato_chips_PNG38.png' },
  'حلو': { bg: 'bg-[#FFF4FC]', icon: 'https://pngimg.com/uploads/candy/candy_PNG3.png' },
  'هدايا': { bg: 'bg-[#F1F5F9]', icon: 'https://pngimg.com/uploads/gift_box/gift_box_PNG92.png' },
  'بسكوت': { bg: 'bg-[#FBFAF2]', icon: 'https://pngimg.com/uploads/biscuit/biscuit_PNG97.png' },
  'عنايه': { bg: 'bg-[#F0F5FF]', icon: 'https://pngimg.com/uploads/shampoo/shampoo_PNG5.png' },
  'دايت': { bg: 'bg-[#F6FEF9]', icon: 'https://pngimg.com/uploads/apple/apple_PNG12458.png' },
  'قهوه': { bg: 'bg-[#FAFAF5]', icon: 'https://pngimg.com/uploads/coffee_beans/coffee_beans_PNG9273.png' },
};

const FastCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: catData } = await supabase.from("categories").select("*");
        
        if (catData) {
          const roots = catData
            .filter((cat) => !cat.parent_id && !cat.id.includes("tax"))
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

          // Fetch real product previews for each category to make it "Alive"
          const enriched = await Promise.all(roots.map(async (cat) => {
            if (cat.image) return { ...cat, preview_image: cat.image };

            // Try to find a real product image from this category
            const { data: prods } = await supabase
                .from('products')
                .select('image')
                .eq('category_id', cat.id)
                .neq('image', '')
                .not('image', 'is', null)
                .not('image', 'ilike', '%placeholder%')
                .limit(1);
            
            return {
                ...cat,
                preview_image: prods?.[0]?.image || null
            };
          }));

          setCategories(enriched);
        }
      } catch (err) {
        console.error("Fast categories fetch error:", err);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-[2rem] bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-6 md:py-10 bg-white/60 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 text-right rtl" dir="rtl">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 font-tajawal">الأقسام الرئيسية</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">اضغط على أي قسم للتصفح السريع</p>
          </div>
          <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-widest">{categories.length} قسم</span>
        </div>

        {/* 3 columns on mobile, 4 on tablet, 5 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat, idx) => {
            const searchLabel = _norm(cat.label);
            let style: any = null;

            for (const [key, val] of Object.entries(CATEGORY_STYLES)) {
              if (searchLabel.includes(_norm(key))) {
                style = val;
                break;
              }
            }

            if (!style) {
              style = { bg: 'bg-slate-50', icon: '' };
            }

            const isSwisFru = cat.label.includes('سويس');
            const cardBg = isSwisFru ? 'bg-[#222319]' : style.bg;
            const textClass = isSwisFru ? 'text-secondary' : 'text-slate-700';

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/categories/${cat.id}`)}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`${cardBg} group relative flex flex-col p-2.5 md:p-4 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl active:scale-95 cursor-pointer border border-black/5 aspect-[4/5] overflow-hidden shadow-sm animate-in fade-in zoom-in-90 duration-500 fill-mode-both`}
              >
                {/* Image Area */}
                <div className="flex-grow flex items-center justify-center relative overflow-hidden py-1">
                  <img
                    src={cat.preview_image || style.icon || 'https://happinessmakers.online/assets/logo.png'}
                    alt={cat.label}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-xl"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://happinessmakers.online/assets/logo.png';
                    }}
                  />
                  {/* Shine overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                </div>

                {/* Label */}
                <div className="mt-1.5 text-center px-1">
                  <h3 className={`text-[9px] sm:text-[11px] md:text-sm font-black ${textClass} leading-tight line-clamp-1 tracking-tight`}>
                    {cat.label.replace(/\[.*?\]/g, '').trim()}
                  </h3>
                </div>

                {/* Tap ripple effect */}
                <div className="absolute inset-0 bg-white/0 active:bg-white/10 rounded-[1.5rem] md:rounded-[2rem] transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FastCategories;
