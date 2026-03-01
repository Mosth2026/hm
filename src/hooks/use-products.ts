
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { SITE_CONFIG } from "@/lib/constants";

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
    category_id: string;
    category_name: string;
    is_featured: boolean;
    is_new: boolean;
    is_on_sale: boolean;
    discount: number;
    stock: number;
    no_tax?: boolean;
    created_at?: string;
}

const processProduct = (p: any, isAdmin: boolean): Product => {
    let noTax = p.category_id === 'no-tax';
    let description = p.description || '';

    if (description.includes('[TAX_EXEMPT]')) {
        noTax = true;
        description = description.replace('[TAX_EXEMPT]', '').trim();
    }

    if (!isAdmin) {
        description = description.replace(/باركود\s*:\s*\d+/g, '').trim();
    }

    return {
        ...p,
        description,
        no_tax: noTax
    };
};

export const useProducts = (categoryId?: string, isFeatured?: boolean) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'editor';

    return useQuery({
        queryKey: ['products', categoryId, isFeatured, isAdmin],
        queryFn: async () => {
            let query = supabase.from('products').select('*');

            if (!isAdmin) {
                // شروط العرض للعملاء (ضمان الجودة):
                // 1. المخزون أكبر من أو يساوي 1
                // 2. السعر أكبر من 0
                // 3. وجود صورة صالحة وغير افتراضية
                // 4. عدم وجود [DRAFT] في الوصف
                query = query
                    .filter('stock', 'gte', 1)
                    .filter('price', 'gt', 0)
                    .not('image', 'is', null)
                    .neq('image', '')
                    .not('image', 'ilike', '%unsplash.com%')
                    .not('description', 'ilike', '%[DRAFT]%');

                if (categoryId && categoryId !== 'all') {
                    query = query.or(`category_id.eq.${categoryId},category_name.eq.${categoryId}`);
                }
            } else {
                // المسؤول يرى كل شيء
                if (categoryId && categoryId !== 'all') {
                    query = query.or(`category_id.eq.${categoryId},category_name.eq.${categoryId}`);
                }
            }

            if (isFeatured) {
                query = query.eq('is_featured', true);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false });

            if (error) throw error;

            // معالجة البيانات للعملاء (فلترة نهائية للأمان القصوى)
            if (!isAdmin) {
                return (data as any[]).filter(p => {
                    const price = Number(p.price);
                    const stock = Number(p.stock);
                    const isDraft = p.description?.includes('[DRAFT]');
                    const hasValidImage = p.image &&
                        p.image.trim() !== "" &&
                        !p.image.includes('unsplash.com') &&
                        p.image !== SITE_CONFIG.placeholderImage;

                    return stock >= 1 && price > 0 && hasValidImage && !isDraft;
                }).map(p => processProduct(p, false));
            }

            return (data as any[]).map(p => processProduct(p, true));
        },
    });
};

export const useProduct = (id: number) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'editor';

    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // معالجة البيانات للعملاء (إخفاء الباركود والتحقق من شروط العرض)
            if (!isAdmin && data) {
                const price = Number(data.price);
                const stock = Number(data.stock);
                const isDraft = data.description?.includes('[DRAFT]');
                const hasValidImage = data.image &&
                    data.image.trim() !== "" &&
                    !data.image.includes('unsplash.com') &&
                    data.image !== SITE_CONFIG.placeholderImage;

                if (!(stock >= 1 && price > 0 && hasValidImage && !isDraft)) {
                    return null;
                }

                return processProduct(data, false);
            }

            return data ? processProduct(data, true) : null;
        },
        enabled: !!id,
    });
};
