
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Loader2, Search } from "lucide-react";
import { Helmet } from "react-helmet-async";

import { useAuth } from "@/hooks/use-auth";
import { SITE_CONFIG } from "@/lib/constants";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'editor';

    const { data: products, isLoading } = useQuery({
        queryKey: ["search", query, isAdmin],
        queryFn: async () => {
            if (!query) return [];

            let dbQuery = supabase
                .from("products")
                .select("*")
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

            if (!isAdmin) {
                dbQuery = dbQuery
                    .gte("stock", 1)
                    .gt("price", 0)
                    .not("image", "is", null)
                    .neq("image", "")
                    .not("image", "ilike", "%unsplash.com%")
                    .neq("category_id", "no-tax");
            }
            const { data, error } = await dbQuery.order("created_at", { ascending: false });
            if (error) throw error;

            const resultData = (data || []).map(p => {
                let noTax = p.category_id === 'no-tax';
                let description = p.description || '';
                let name = p.name || '';
                let category_name = p.category_name || '';

                if (description.includes('[TAX_EXEMPT]') || name.includes('[TAX_EXEMPT]') || category_name.includes('[TAX_EXEMPT]')) {
                    noTax = true;
                }

                // Strip technical tags for a cleaner view
                name = name.replace(/\[TAX_EXEMPT\]/g, '').trim();
                description = description.replace(/\[TAX_EXEMPT\]/g, '').trim();
                category_name = category_name.replace(/\[TAX_EXEMPT\]/g, '').trim();

                if (!isAdmin) {
                    description = description.replace(/باركود\s*:\s*\d+/g, '').trim();
                }

                return {
                    ...p,
                    name,
                    description,
                    category_name,
                    no_tax: noTax
                };
            });

            // FAIL-SAFE: Secondary client-side filtering for non-admins
            if (!isAdmin && resultData) {
                return resultData.filter((p: any) => {
                    const price = Number(p.price);
                    const stock = Number(p.stock);
                    const hasValidImage = p.image &&
                        p.image.trim() !== "" &&
                        !p.image.includes('unsplash.com');

                    return stock >= 1 && price > 0 && hasValidImage;
                });
            }

            return resultData;
        },
        enabled: query.length > 0,
    });

    return (
        <>
            <Helmet>
                <title>نتائج البحث عن: {query} - صناع السعادة</title>
            </Helmet>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow bg-gray-50 font-tajawal rtl pt-28 md:pt-40">
                    {/* Page Header */}
                    <div className="relative py-12 md:py-20 bg-primary/5 overflow-hidden mb-8">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
                        <div className="container mx-auto px-4 md:px-8 relative z-10">
                            <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest mx-auto">
                                    <Search className="h-3 w-3" />
                                    مساعد البحث الذكي
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight">
                                    نتائج البحث
                                </h1>
                                <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                                    تبحث عن: <span className="text-secondary italic">"{query}"</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 pb-12">

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-saada-red" />
                            </div>
                        ) : products && products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {products.map((product: any) => (
                                    <ProductCard
                                        key={product.id}
                                        {...product}
                                        category={product.category_name}
                                        categoryId={product.category_id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="mb-4 flex justify-center">
                                    <div className="bg-gray-100 p-6 rounded-full">
                                        <Search className="h-12 w-12 text-gray-300" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-saada-brown mb-2">عذراً، لم نجد نتائج</h2>
                                <p className="text-gray-500">حاول البحث بكلمات أخرى أو تصفح الأقسام.</p>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default SearchPage;
