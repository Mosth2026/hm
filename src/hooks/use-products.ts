
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
    expiry_date?: string;
    created_at?: string;
    updated_at?: string;
}

const processProduct = (p: any, isAdmin: boolean): Product => {
    let noTax = p.category_id === 'no-tax';
    let description = p.description || '';
    let name = p.name || '';
    let category_name = p.category_name || '';

    if (description.includes('[TAX_EXEMPT]') || name.includes('[TAX_EXEMPT]') || category_name.includes('[TAX_EXEMPT]')) {
        noTax = true;
    }

    // Always strip it out for everyone from all visible fields
    description = description.replace(/\[TAX_EXEMPT\]/g, '').trim();
    name = name.replace(/\[TAX_EXEMPT\]/g, '').trim();
    category_name = category_name.replace(/\[TAX_EXEMPT\]/g, '').trim();

    if (!isAdmin) {
        description = description.replace(/باركود\s*:\s*\d+/g, '').trim();
    }

    let expiryDate = p.expiry_date || null;

    // Rule: Mention expiry only if it's valid, has stock, and is current (for customers)
    if (!isAdmin && expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const isPast = expiry.getTime() < now.getTime();
        const hasNoStock = (p.stock || 0) <= 0;

        if (isPast || hasNoStock) {
            expiryDate = null;
        }
    }

    // For customers, completely hide the category if it reflects internal accounting state like "no-tax"
    if (!isAdmin && (category_name === 'بدون ضريبة' || p.category_id === 'no-tax')) {
        category_name = '';
    }

    return {
        ...p,
        name,
        description,
        category_name,
        no_tax: noTax,
        expiry_date: expiryDate
    };
};

export const useProducts = (categoryId?: string, isFeatured?: boolean) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'editor';
    const isSpecial = user && ['admin', 'elhanafy', 'mostafa', 'mostafa_abu_mailla', 'fikry'].includes(user.username.toLowerCase());

    return useQuery({
        queryKey: ['products', categoryId, isFeatured, isAdmin],
        queryFn: async () => {
            let query = supabase.from('products').select('*');

            if (!isAdmin) {
                query = query
                    .filter('stock', 'gte', 1)
                    .filter('price', 'gt', 0)
                    .not('image', 'is', null)
                    .neq('image', '')
                    .not('image', 'ilike', '%unsplash.com%')
                    .not('description', 'ilike', '%[DRAFT]%');
            }

            if (categoryId && categoryId !== 'all') {
                query = query.or(`category_id.ilike.%${categoryId}%,category_name.ilike.%${categoryId}%`);
            }

            if (isFeatured) {
                query = query.eq('is_featured', true);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!isAdmin && data) {
                // Grouping logic for the store facade
                const groupedMap = new Map<string, Product>();

                ((data || []) as any[]).forEach(p => {
                    const price = Number(p.price);
                    const stock = Number(p.stock);
                    const isDraft = p.description?.includes('[DRAFT]');
                    const hasValidImage = p.image &&
                        p.image.trim() !== "" &&
                        !p.image.includes('unsplash.com') &&
                        p.image !== SITE_CONFIG.placeholderImage;

                    if (stock >= 1 && price > 0 && hasValidImage && !isDraft) {
                        const processed = processProduct(p, false);
                        // Group by name for the store to avoid showing same product with different expiries as separate items
                        const key = processed.name.toLowerCase().trim();

                        if (groupedMap.has(key)) {
                            const existing = groupedMap.get(key)!;
                            existing.stock += processed.stock;
                        } else {
                            groupedMap.set(key, processed);
                        }
                    }
                });

                return Array.from(groupedMap.values());
            }

            return ((data || []) as any[]).map(p => processProduct(p, true));
        },
    });
};

export const useProduct = (id: number) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'editor';

    return useQuery({
        queryKey: ['product', id, isAdmin],
        queryFn: async () => {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!product) return null;

            if (isAdmin) {
                return processProduct(product, true);
            }

            // Customer View: Show aggregate stock for all batches of this name
            const { data: allBatches } = await supabase
                .from('products')
                .select('*')
                .eq('name', product.name);

            const totalStock = (allBatches || []).reduce((sum, p) => sum + (p.stock || 0), 0);

            const processed = processProduct(product, false);
            processed.stock = totalStock;

            const isDraft = product.description?.includes('[DRAFT]');
            const hasValidImage = product.image &&
                product.image.trim() !== "" &&
                !product.image.includes('unsplash.com') &&
                product.image !== SITE_CONFIG.placeholderImage;

            if (!(totalStock >= 1 && Number(product.price) > 0 && hasValidImage && !isDraft)) {
                return null;
            }

            return processed;
        },
        enabled: !!id,
    });
};
