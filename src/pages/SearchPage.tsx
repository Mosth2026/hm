
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

            // FAIL-SAFE: Secondary client-side filtering for non-admins
            if (!isAdmin && data) {
                return data.filter((p: any) => {
                    const price = Number(p.price);
                    const stock = Number(p.stock);
                    const hasValidImage = p.image &&
                        p.image.trim() !== "" &&
                        !p.image.includes('unsplash.com');

                    return stock >= 1 && price > 0 && hasValidImage;
                });
            }

            return data;
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
                <main className="flex-grow bg-gray-50 font-tajawal rtl">
                    <div className="container mx-auto px-4 pt-16 md:pt-20 pb-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-saada-red/10 p-3 rounded-xl">
                                <Search className="h-6 w-6 text-saada-red" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-saada-brown">نتائج البحث</h1>
                                <p className="text-gray-500 text-sm">تبحث عن: "{query}"</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-saada-red" />
                            </div>
                        ) : products && products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
