import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  ChevronRight, 
  Loader2, 
  SlidersHorizontal,
  ChevronLeft,
  ArrowRight,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import SocialBanner from "@/components/SocialBanner";
import { Helmet } from "react-helmet-async";

// Arabic normalization for robust keyword matching
const normArabic = (input: string) => {
  let text = (input || "").trim().toLowerCase();
  text = text.replace(/[أإآ]/g, 'ا');
  text = text.replace(/ة/g, 'ه');
  text = text.replace(/ى/g, 'ي');
  return text;
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [categoryPath, setCategoryPath] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      setIsLoading(true);
      window.scrollTo(0, 0);

      try {
        // 1. Fetch ALL categories for robustness and in-memory processing
        const { data: allCats, error: catError } = await supabase
          .from("categories")
          .select("*");
        
        if (catError) throw catError;

        const currentCat = allCats?.find(c => c.id === categoryId);
        if (!currentCat) {
          setIsLoading(false);
          return;
        }
        setCategory(currentCat);

        // 2. Build breadcrumbs (path) in-memory
        const path = [];
        let parentId = currentCat.parent_id;
        while (parentId) {
          const parent = allCats?.find(c => c.id === parentId);
          if (parent) {
            path.unshift(parent);
            parentId = parent.parent_id;
          } else {
            break;
          }
        }
        setCategoryPath(path);

        // 3. Subcategories (excluding accounting ones)
        const subs = allCats?.filter(c => 
          c.parent_id === categoryId && 
          c.id !== "no-tax" && 
          !(c.label || "").toLowerCase().includes("ضريبة")
        ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];
        
        setSubCategories(subs);

        // 4. Identify all descendant IDs for product fetching (with safety guard)
        const allDescendantIds = [categoryId];
        const getChildren = (parentIds: string[], depth = 0) => {
          if (depth > 10) return; // Prevent infinite loops
          const children = allCats?.filter(c => c.parent_id && parentIds.includes(c.parent_id)) || [];
          if (children.length > 0) {
            const ids = children.map(c => c.id);
            const newIds = ids.filter(id => !allDescendantIds.includes(id));
            if (newIds.length === 0) return;
            allDescendantIds.push(...newIds);
            getChildren(newIds, depth + 1);
          }
        };
        getChildren([categoryId]);

        // 5. Fetch products for ONLY the identified categories (and descendants)
        const tryFetchProds = async (useIsAvailable: boolean) => {
          let query = supabase
            .from("products")
            .select("id, name, price, image, description, category_id, category_name, created_at")
            .in("category_id", allDescendantIds)
            .gt("stock", 0)
            .gt("price", 0)
            .not("image", "is", null)
            .neq("image", "")
            .not("image", "ilike", "%placeholder%")
            .not("image", "ilike", "%unsplash%")
            .not("image", "ilike", "%1581091226825%")
            .not("description", "ilike", "%[DRAFT]%");
          
          if (useIsAvailable) {
            query = query.eq("is_available", true);
          }

          const { data, error } = await query;
          if (error) return { data, error };

          // Secondary filtering for [ADD_CAT:id] tags which are still needed in-memory
          const matched = (data || []).filter(p => {
            const catName = (p.category_name || '').toLowerCase();
            const catId = (p.category_id || '').toLowerCase();
            const isDraft = catName.includes('درافت') || catName.includes('مخفي') || catId === 'trash';

            if (isDraft) return false;

            // Already filtered by category_id in SQL, but we add [ADD_CAT] check here
            const isSecondaryMatch = allDescendantIds.some(id =>
               p.description && p.description.includes(`[ADD_CAT:${id}]`)
            );
            
            // We can keep the name match if needed, but SQL 'in' filter did 90% of the work
            return true; 
          });

          return { data: matched, error: null };
        };

        let { data: prodData, error: prodError } = await tryFetchProds(true);
        if (prodError && prodError.message.includes("is_available")) {
          const secondTry = await tryFetchProds(false);
          prodData = secondTry.data;
        }

        setProducts(prodData || []);
      } catch (error) {
        console.error("Category data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const sortedProducts = useMemo(() => {
    let result = [...products];
    if (sortBy === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }
    return result;
  }, [products, sortBy]);

  const categoryName = category?.label || categoryId || "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-tajawal rtl">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="text-primary font-black animate-pulse">ننتقي لك أفضل مختارات {categoryName}...</p>
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

      <div className="min-h-screen flex flex-col bg-[#fdfdfd] font-tajawal rtl">
        <Header />

        <main className="flex-grow">
          {/* Breadcrumbs - Clean App Style */}
          <div className="container mx-auto px-6 pt-8">
            <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground/50 overflow-x-auto no-scrollbar whitespace-nowrap">
              <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              {categoryPath.map((pathItem) => (
                <React.Fragment key={pathItem.id}>
                  <ChevronLeft className="h-3 w-3 opacity-30" />
                  <Link to={`/categories/${pathItem.id}`} className="hover:text-primary transition-colors">
                    {pathItem.label.replace(/\[.*?\]/g, "").trim()}
                  </Link>
                </React.Fragment>
              ))}
              <ChevronLeft className="h-3 w-3 opacity-30" />
              <span className="text-secondary font-black truncate">{categoryName}</span>
            </nav>
          </div>

          {/* Transparent App-Style Header & Hero */}
          <section className="relative pt-12 pb-12 overflow-hidden bg-[#fdfdfd]">
            <div className="container mx-auto px-6 relative z-10">
              {/* Main Category Header - Centered as per App Parity */}
              <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                <div className="flex flex-col items-center gap-5">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-white text-[10px] font-black uppercase tracking-widest mx-auto shadow-xl shadow-secondary/20">
                    Elite Collection
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-tight tracking-tighter drop-shadow-sm">
                  {categoryName}
                </h1>
                
                <div className="flex items-center gap-3 bg-primary/[0.03] px-6 py-2.5 rounded-2xl border border-primary/5">
                  <ShoppingBag className="h-4 w-4 text-secondary" />
                  <span className="font-bold text-sm text-primary/70 italic">عروض حصرية: {products.length} منتج فاخر</span>
                </div>
              </div>
            </div>
            
            {/* Background Texture for Luxury Feel */}
            <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none -z-10"
              style={{ backgroundImage: 'radial-gradient(#222319 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </section>
          {/* Subcategories Grid - Styled as 'Browse our categories' from app */}
        {/* Subcategories Grid - Disabled for Original Web Layout to avoid complexity */}
        {/* 
        {subCategories.length > 0 && (
          <div className="bg-gradient-to-b from-white to-gray-50/50 py-12 md:py-20 border-b border-primary/5">
            ...
          </div>
        )}
        */}
  <section className="py-12 md:py-16" id="products">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 py-4 border-b border-primary/5 px-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-secondary" />
                  <p className="text-sm font-bold text-muted-foreground italic">عروض حصرية: {products.length} منتج فاخر</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-grow md:flex-none h-11 bg-white border border-primary/10 rounded-xl px-4 text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="newest">الأحدث وصولا</option>
                    <option value="price-low">السعر: الأقل للأعلى</option>
                    <option value="price-high">السعر: الأعلى للأقل</option>
                  </select>
                </div>
              </div>

              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
                  {sortedProducts.map((product, idx) => (
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
                <div className="text-center py-32 bg-primary/[0.02] rounded-[3rem] border-2 border-dashed border-primary/10">
                  <p className="text-2xl font-black text-primary/30 italic">لا توجد منتجات متاحة حاليا في هذه القائمة.</p>
                  <button 
                    onClick={() => navigate(-1)}
                    className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-black hover:bg-black transition-colors text-sm"
                  >
                    العودة للخلف
                  </button>
                </div>
              )}
            </div>
          </section>

          <SocialBanner />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CategoryPage;
