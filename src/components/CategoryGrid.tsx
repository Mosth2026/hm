import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CategoryCard from "./CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  label: string;
  icon: string;
  parent_id: string | null;
  children_count?: number;
}

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch ALL categories to handle missing columns safely (filter/sort in JS)
        const { data, error } = await supabase
          .from("categories")
          .select("*");

        if (error) throw error;

        if (data) {
          // Filter root categories that are not accounting-based
          const filtered = data
            .filter((cat) => {
              const isRoot = !cat.parent_id;
              const label = (cat.label || "").toLowerCase();
              const isAccounting = cat.id === "no-tax" || label.includes("ضريبة") || label.includes("محاسب");
              return isRoot && !isAccounting;
            })
            // Dynamically count children from the full list
            .map((cat) => ({
              ...cat,
              children_count: data.filter(child => child.parent_id === cat.id).length
            }))
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

          setCategories(filtered);
        }
      } catch (err) {
        console.error("Category grid fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-[2rem] overflow-hidden">
              <Skeleton className="h-full w-full bg-saada-brown/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section id="categories" className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">
              Explore Categories
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-primary leading-tight">
              تصفح أقسامنا
            </h2>
          </div>
          <p className="text-muted-foreground text-sm font-bold md:max-w-md md:text-left">
            اختر طريقك نحو السعادة واكتشف تشكيلة واسعة من الشوكولاتة، الكاندي، ومستحضرات التجميل العالمية.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              label={cat.label}
              icon={cat.icon}
              childrenCount={cat.children_count}
            />
          ))}
          
          {/* Static 'All Products' Card placeholder or link */}
          <CategoryCard
            id="all"
            label="كل المنتجات"
            icon="🛍️"
            isAll={true}
          />
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
