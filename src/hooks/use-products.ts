
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

    // Extract multi-category IDs if stored in searchable category_name
    const idMatch = category_name.match(/\[IDS:(.*?)\]/);
    let actualCatId = p.category_id || '';
    if (idMatch && idMatch[1]) {
        actualCatId = idMatch[1];
    }
    
    // Clean display name (remove [IDS:...])
    category_name = category_name.replace(/\s*\[IDS:.*?\]/g, '').replace(/\[TAX_EXEMPT\]/g, '').trim();
    description = description.replace(/\[TAX_EXEMPT\]/g, '').trim();
    name = name.replace(/\[TAX_EXEMPT\]/g, '').trim();

    if (!isAdmin) {
        description = description.replace(/باركود\s*:\s*\d+/g, '').trim();
    }

    let expiryDate = p.expiry_date || null;
    if (!isAdmin && expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (expiry.getTime() < now.getTime() || (p.stock || 0) <= 0) {
            expiryDate = null;
        }
    }

    // For customers, completely hide the category if it reflects internal accounting state like "no-tax"
    if (!isAdmin && (category_name === 'بدون ضريبة' || p.category_id === 'no-tax' || actualCatId.includes('no-tax'))) {
        category_name = '';
    }

    return {
        ...p,
        name,
        description,
        category_name,
        category_id: actualCatId,
        no_tax: noTax,
        expiry_date: expiryDate
    };
};

export const useProducts = (categoryId?: string, isFeatured?: boolean, branchId?: number) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'editor';

    return useQuery({
        queryKey: ['products', categoryId, isFeatured, isAdmin, branchId],
        queryFn: async () => {
            // Using join to fetch product_branch_stock for the specific branch
            let query = supabase.from('products').select(`
                *,
                product_branch_stock!left (
                    stock,
                    branch_id
                )
            `);

            if (branchId) {
                // We filter for branch stock or null (to handle products not yet initialized for a branch)
                // Actually, if we only want items for that branch, we filter by branch_id
                // But if we want to show ALL items and just show 0 if no record, we use or filter or just handle it in JS.
            }

            if (!isAdmin) {
                query = query
                    .filter('price', 'gt', 0)
                    .not('image', 'is', null)
                    .neq('image', '')
                    .not('image', 'ilike', '%unsplash.com%')
                    .not('description', 'ilike', '%[DRAFT]%');
            }

            if (categoryId && categoryId !== 'all') {
                // SMART FILTER: Search by category ID, category name, OR if the product name contains the category name
                // To avoid too many matches, we use a simple keyword match
                query = query.or(`category_id.ilike.%${categoryId}%,category_name.ilike.%${categoryId}%,name.ilike.%${categoryId}%`);
            }

            if (isFeatured) {
                query = query.eq('is_featured', true);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false });

            if (error) throw error;

            const processedData = ((data || []) as any[]).map(p => {
                // If branchId is provided, use the stock for that branch
                let effectiveStock = p.stock || 0;
                if (branchId) {
                    const branchStockRecord = (p.product_branch_stock || []).find((s: any) => s.branch_id === branchId);
                    effectiveStock = branchStockRecord ? branchStockRecord.stock : 0;
                }
                
                return { ...p, stock: effectiveStock };
            });

    // THE UNBREAKABLE CUSTOMER RULES (GUARDRAILS)
    const isVisibleToCustomer = (p: any, totalStock: number) => {
        const price = Number(p.price) || 0;
        const stock = totalStock;
        const isDraft = (p.description || '').includes('[DRAFT]');
        const hasImage = p.image && 
                         p.image.trim() !== "" && 
                         !p.image.includes('unsplash.com') && 
                         p.image !== SITE_CONFIG.placeholderImage;

        // RULE: No Stock -> Hidden. No Price -> Hidden. No Image -> Hidden. Draft -> Hidden.
        return stock >= 1 && price > 0 && hasImage && !isDraft;
    };

    if (!isAdmin) {
        // Grouping logic for the store facade
        const groupedMap = new Map<string, Product>();

        processedData.forEach(p => {
            const processed = processProduct(p, false);
            if (isVisibleToCustomer(p, p.stock)) {
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

    return processedData.map(p => processProduct(p, true));
},
});
};

export const useProduct = (id: number, branchId?: number) => {
const { user } = useAuth();
const isAdmin = user?.role === 'admin' || user?.role === 'editor';

return useQuery({
queryKey: ['product', id, isAdmin, branchId],
queryFn: async () => {
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            product_branch_stock !left (
                stock,
                branch_id
            )
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    if (!product) return null;

    let effectiveStock = product.stock || 0;
    if (branchId) {
        const branchStockRecord = (product.product_branch_stock || []).find((s: any) => s.branch_id === branchId);
        effectiveStock = branchStockRecord ? branchStockRecord.stock : 0;
    }
    const pWithStock = { ...product, stock: effectiveStock };

    if (isAdmin) return processProduct(pWithStock, true);

    // CUSTOMER VIEW ENFORCEMENT
    const { data: allBatches } = await supabase
        .from('products')
        .select(`
            *,
            product_branch_stock !left (
                stock,
                branch_id
            )
        `)
        .eq('name', product.name);

    const filteredBatches = (allBatches || []).map(b => {
        let bStock = b.stock || 0;
        if (branchId) {
            const bBranchRecord = (b.product_branch_stock || []).find((s: any) => s.branch_id === branchId);
            bStock = bBranchRecord ? bBranchRecord.stock : 0;
        }
        return { ...b, stock: bStock };
    });

    const totalBranchStock = filteredBatches.reduce((sum, b) => sum + (b.stock || 0), 0);
    const processed = processProduct(pWithStock, false);
    processed.stock = totalBranchStock;

    // THE GUARDRAIL CHECK
    const isVisibleToCustomer = (p: any, tStock: number) => {
        const pr = Number(p.price) || 0;
        const dr = (p.description || '').includes('[DRAFT]');
        const img = p.image && p.image.trim() !== "" && !p.image.includes('unsplash.com') && p.image !== SITE_CONFIG.placeholderImage;
        return tStock >= 1 && pr > 0 && img && !dr;
    };

    if (!isVisibleToCustomer(product, totalBranchStock)) {
        console.warn(`Product ${id} blocked by Customer Guardrails`);
        return null;
    }

    return processed;
},
        enabled: !!id,
    });
};
