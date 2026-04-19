import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

interface CategoryCardProps {
  id: string;
  label: string;
  icon: string;
  childrenCount?: number;
  isAll?: boolean;
  isActive?: boolean;
  variant?: 'root' | 'sub';
}

// Simple global cache to prevent redundant fetches during session
const categoryImageCache: Record<string, string[]> = {};

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  id, label, icon, childrenCount, isAll, isActive, variant = 'root' 
}) => {
  const [images, setImages] = useState<string[]>(categoryImageCache[id] || []);
  const [loading, setLoading] = useState(!categoryImageCache[id]);

  const getCategoryTheme = (id: string, label: string) => {
    const l = label.toLowerCase();
    if (l.includes('شوكولاتة') || id.includes('chocolate')) return 'bg-[#FEF3F2]'; 
    if (l.includes('قهوة') || id.includes('coffee')) return 'bg-[#F9F5F1]'; 
    if (l.includes('مستحضرات') || l.includes('العناية الشخصية') || id.includes('cosmetics')) return 'bg-[#F0F5FF]'; 
    if (l.includes('دايت') || id.includes('dietary')) return 'bg-[#F6FEF9]'; 
    if (l.includes('مشروبات')) return 'bg-[#FFF9F2]'; 
    return 'bg-gray-50';
  };

  const themeClass = getCategoryTheme(id, label);

  useEffect(() => {
    const fetchCollageImages = async () => {
      // Return if already in cache
      if (categoryImageCache[id] && categoryImageCache[id].length > 0) {
        setLoading(false);
        return;
      }

      // Special case for cosmetics/personal care image
      if (id.includes('cosmetics') || label.includes('مستحضرات') || label.includes('العناية الشخصية')) {
         const imgs = ['/assets/cosmetics.png'];
         categoryImageCache[id] = imgs;
         setImages(imgs);
         setLoading(false);
         return;
      }

      try {
        setLoading(true);
        let allIds = [id];
        let labels = [label];

        if (!isAll) {
          try {
            const { data: children } = await supabase
              .from("categories")
              .select("id, label")
              .eq("parent_id", id);
            
            if (children && children.length > 0) {
              allIds = [...allIds, ...children.map(c => c.id)];
              labels = [...labels, ...children.map(c => c.label)];
            }
          } catch (e) {}
        }

        const tryFetch = async () => {
          let query = supabase
            .from("products")
            .select("image")
            .gt("stock", 0)
            .gt("price", 0)
            .neq("image", "")
            .not("image", "is", null)
            .not("image", "ilike", "%placeholder%")
            .not("image", "ilike", "%generic%")
            .not("image", "ilike", "%unsplash%")
            .not("image", "ilike", "%1581091226825%")
            .not("description", "ilike", "%[DRAFT]%")
            .not("category_name", "ilike", "%درافت%")
            .not("category_name", "ilike", "%مخفي%")
            .not("category_id", "in", "(trash,draft)")
            .order("is_featured", { ascending: false })
            .limit(variant === 'sub' ? 1 : 4); // Only fetch 1 image for subcategories for speed
          
          if (!isAll) {
            const labelFilters = labels.map(l => `"${l}"`).join(",");
            const filterStr = `category_id.in.(${allIds.join(",")}),category_name.in.(${labelFilters})`;
            query = query.or(filterStr);
          }
          return await query;
        };

        let { data } = await tryFetch();
        
        if (data && data.length > 0) {
          const imgs = data.map((p) => p.image).filter(Boolean);
          categoryImageCache[id] = imgs;
          setImages(imgs);
        } else if (!isAll) {
          try {
            const { data: fuzzyData } = await supabase
              .from("products")
              .select("image")
              .gt("stock", 0)
              .gt("price", 0)
              .neq("image", "")
              .not("image", "is", null)
              .not("image", "ilike", "%placeholder%")
              .not("image", "ilike", "%unsplash%")
              .not("image", "ilike", "%1581091226825%")
              .not("description", "ilike", "%[DRAFT]%")
              .ilike("name", `%${label}%`)
              .limit(1); // Keep it simple
            
            if (fuzzyData && fuzzyData.length > 0) {
              const imgs = fuzzyData.map((p) => p.image).filter(Boolean);
              categoryImageCache[id] = imgs;
              setImages(imgs);
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error("Collage fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollageImages();
  }, [id, isAll, label, variant]);

  const renderContent = () => {
    if (loading) return <div className="absolute inset-0 flex items-center justify-center"><div className="h-4 w-4 bg-gray-200 animate-ping rounded-full" /></div>;

    if (images.length === 1 || id.includes('cosmetics') || label.includes('العناية الشخصية')) {
        const isCosmetics = (id.includes('cosmetics') || label.includes('مستحضرات') || label.includes('العناية الشخصية'));
        const imgSrc = isCosmetics ? '/assets/cosmetics.png' : images[0];
        return (
            <div className="absolute inset-0 flex items-end justify-center p-2 pt-12 overflow-hidden">
                <img 
                    src={imgSrc} 
                    className="w-[85%] h-[85%] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" 
                    alt="" 
                />
            </div>
        );
    }

    // 2x2 Grid for Collage (Breadfast sometimes does this for mixed categories)
    return (
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-2 pt-14">
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className="relative w-full h-full overflow-hidden rounded-xl bg-white/50">
            <img src={img} className="absolute inset-0 w-full h-full object-contain p-1" alt="" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Link
      to={isAll ? (id === 'all' ? "/search" : `/categories/${id}`) : `/categories/${id}`}
      className={cn(
        "group relative block aspect-[4/5] rounded-[2.5rem] overflow-hidden transition-all duration-1000 hover:-translate-y-4 active:scale-95 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]",
        themeClass,
        isActive && "ring-4 ring-saada-red ring-offset-4"
      )}
    >
      {/* Background/Product Area */}
      {renderContent()}

      {/* Label - TOP POSITION (Breadfast Style) */}
      <div className="absolute top-0 left-0 right-0 p-5 pt-8 z-10 text-center">
        <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-none tracking-tighter px-2 group-hover:scale-110 transition-transform duration-700">
            {label}
        </h3>
        {/* Children count disabled for simple layout */}
        {/* 
        {childrenCount !== undefined && childrenCount >= 0 && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 block opacity-60">
                {childrenCount} فرعي
            </span>
        )}
        */}
      </div>

      {/* Glossy reflection effect */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
};

export default CategoryCard;
