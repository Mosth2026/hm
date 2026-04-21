
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { Product } from "@/hooks/use-products";
import * as XLSX from 'xlsx';
import { formatPrice } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";

const PLACEHOLDER_IMAGE = SITE_CONFIG.placeholderImage;

export const useAdminDashboard = () => {
    const { user, isAuthenticated, login, logout, initialize } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    // Stats State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [branches, setBranches] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalProducts: 0, lowStock: 0, totalValue: 0, categories: 0, zeroStock: 0,
        needsPhoto: 0, published: 0, noTax: 0, readyToShot: 0, trash: 0,
        dailyChanges: 0, dailyValue: 0, salesProductIds: [] as number[],
        salesQuantities: {} as Record<number, number>
    });

    // Filters & Tabs
    const [activeFilter, setActiveFilter] = useState<any>("all");
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<any>("products");

    // UI State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
    const [importProgress, setImportProgress] = useState<{ current: number, total: number } | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [updatedSessionIds, setUpdatedSessionIds] = useState<number[]>([]);
    
    // Feature states
    const [coupons, setCoupons] = useState<any[]>([]);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
    const [isNardSyncOpen, setIsNardSyncOpen] = useState(false);
    const [isNardSyncing, setIsNardSyncing] = useState(false);
    const [nardCredentials, setNardCredentials] = useState({ code: "2194", username: "", password: "" });
    const [newCoupon, setNewCoupon] = useState({ code: "", discount_type: "percentage", discount_value: 0 });
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [subscribersLoading, setSubscribersLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    
    // Lifecycle
    const [isLifecycleOpen, setIsLifecycleOpen] = useState(false);
    const [lifecycleProduct, setLifecycleProduct] = useState<Product | null>(null);
    const [lifecycleData, setLifecycleData] = useState<any[]>([]);
    const [lifecycleLoading, setLifecycleLoading] = useState(false);
    
    // Bulk
    const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
    const [bulkCategoryId, setBulkCategoryId] = useState("");
    const [isExemptImport, setIsExemptImport] = useState(false);
    const [dbCategories, setDbCategories] = useState<any[]>([]);

    const notificationSound = useRef<HTMLAudioElement | null>(null);
    const lastOrderId = useRef<number | null>(null);
    const sessionSalesOverrideRef = useRef<any>(null);
    const fetchIdRef = useRef(0);
    const [sessionSalesOverride, setSessionSalesOverride] = useState<any>(null);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*');
        if (data) setDbCategories(data);
    };

    // Helper: Normalize
    const normalize = (text: string) => {
        if (!text) return '';
        return String(text).toLowerCase().trim()
            .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ىيی]/g, 'ي').replace(/[ؤئ]/g, 'ي').replace(/[كک]/g, 'ك')
            .replace(/[\u064B-\u0652\u0640]/g, '').replace(/جرام/g, 'جم').replace(/كيلو/g, 'ك')
            .replace(/[^a-z0-9\u0621-\u064A]/g, '');
    };

    const normalizeBarcode = (code: any) => {
        if (!code) return '';
        return String(code).replace(/\D/g, '').replace(/^0+/, '') || '0';
    };

    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const setCookie = (name: string, value: string) => {
        if (typeof document === 'undefined') return;
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    };

    const urlBranchId = searchParams.get('branch');
    const urlBellActive = searchParams.get('bell');

    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
        if (urlBranchId) return Number(urlBranchId);
        // If user has an assigned branch in their profile, use it directly
        const persistedUser = useAuth.getState().user;
        if (persistedUser?.branch_id) return persistedUser.branch_id;
        const saved = typeof window !== 'undefined' ? (localStorage.getItem('saada_selected_branch') || getCookie('saada_selected_branch')) : null;
        return saved ? Number(saved) : null;
    });

    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(() => {
        if (urlBellActive === 'on') return true;
        if (urlBellActive === 'off') return false;
        const saved = typeof window !== 'undefined' ? (localStorage.getItem('SAADA_BELL_MASTER_V1') || getCookie('SAADA_BELL_MASTER_V1')) : null;
        return saved === null ? true : saved === 'true';
    });

    const logAction = async (action: string, details: any = {}, productId?: number) => {
        try {
            await supabase.from('admin_logs').insert([{
                username: user?.username || 'unknown',
                action, details: productId ? { ...details, product_id: productId } : details
            }]);
        } catch (e) { console.error("Log failed:", e); }
    };

    const fetchBranches = async () => {
        const { data } = await supabase.from('branches').select('*');
        if (data) setBranches(data);
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (error) {
            console.error("fetchOrders error:", error);
            toast.error(`فشل تحميل الطلبات: ${error.message}`);
        }
        if (data) setOrders(data);
        setOrdersLoading(false);
    };

    const fetchCoupons = async () => {
        setCouponsLoading(true);
        const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
        if (data) setCoupons(data);
        setCouponsLoading(false);
    };

    const fetchSubscribers = async () => {
        setSubscribersLoading(true);
        const { data } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
        if (data) setSubscribers(data);
        setSubscribersLoading(false);
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        const { data } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(200);
        if (data) setLogs(data);
        setLogsLoading(false);
    };

    const calculateStats = async () => {
        const savedCount = Number(localStorage.getItem('LAST_SYNC_SOLD_QTY')) || 0;
        const savedValue = Number(localStorage.getItem('LAST_SYNC_SOLD_VALUE')) || 0;
        
        const activeOverride = sessionSalesOverrideRef.current || sessionSalesOverride || (savedCount > 0 ? { count: savedCount, value: savedValue } : null);
        
        // Fetch products with their branch stock if a branch is selected
        let query = supabase.from('products').select('price, stock, category_id, category_name, description, image, product_branch_stock(stock, branch_id)');
        const { data: allProds } = await query;
        
        const processedProds = (allProds || []).map(p => {
            let s = p.stock || 0;
            if (selectedBranchId) {
                const br = (p.product_branch_stock as any[] || []).find(x => x.branch_id === selectedBranchId);
                s = br ? br.stock : 0;
            }
            return { ...p, stock: s };
        });

        const total = processedProds.length;
        const zero = processedProds.filter(p => (p.stock || 0) <= 0).length;
        const low = processedProds.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length;
        
        const needsCat = processedProds.filter(p => 
            !p.category_id || 
            p.category_id === 'snacks' || 
            p.category_name === 'الأصناف المستوردة' ||
            p.category_name === 'بدون قسم'
        ).length;

        const published = processedProds.filter(p => 
            !p.description?.includes('[DRAFT]') && 
            p.category_id !== 'trash' && 
            p.category_name !== 'قسم المحذوفات' &&
            p.category_name !== 'درافت'
        ).length;

        const noTax = processedProds.filter(p => 
            p.description?.includes('[TAX_EXEMPT]') || 
            p.category_id === 'no-tax' || 
            p.category_name?.includes('بدون ضريبة')
        ).length;

        const trash = processedProds.filter(p => 
            p.description?.includes('[DRAFT]') || 
            p.category_id === 'trash' || 
            p.category_name?.includes('درافت') ||
            p.category_name?.includes('مخفي')
        ).length;

        const needsPhoto = processedProds.filter(p => !p.image || p.image === PLACEHOLDER_IMAGE).length;
        const finishedWithPhoto = processedProds.filter(p => (p.stock || 0) <= 0 && p.image && p.image !== PLACEHOLDER_IMAGE).length;

        setStats(prev => ({
            ...prev,
            totalProducts: total,
            zeroStock: zero,
            lowStock: low,
            totalValue: processedProds.reduce((acc, p) => acc + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0),
            dailyChanges: activeOverride?.count || 0,
            dailyValue: activeOverride?.value || 0,
            needsCategory: needsCat,
            published: published,
            noTax: noTax,
            trash: trash,
            needsPhoto: needsPhoto,
            readyToShot: finishedWithPhoto
        }));
    };

    const fetchProducts = async () => {
        const currentFetchId = ++fetchIdRef.current;
        setLoading(true);
        try {
            let query = supabase.from("products").select(`*, product_branch_stock (stock, branch_id)`);
            
            // Apply Database-level filters where possible
            if (activeFilter === 'no-category') {
                query = query.is('category_id', null);
            } else if (activeFilter === 'low-stock') {
                query = query.lte('stock', 10).gt('stock', 0);
            } else if (activeFilter === 'zero') {
                query = query.lte('stock', 0);
            } else if (activeFilter === 'no-tax') {
                query = query.or(`description.ilike.%[TAX_EXEMPT]%,category_id.eq.no-tax`);
            } else if (activeFilter === 'trash') {
                query = query.or(`description.ilike.%[DRAFT]%,category_id.eq.trash`);
            }

            if (searchQuery) {
                // Sanitize: escape SQL wildcards to prevent pattern injection
                const sanitized = searchQuery.replace(/[%_\\]/g, '\\$&');
                query = query.or(`name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
            }
            
            const { data } = await query.limit(2000).order('created_at', { ascending: false });
            if (currentFetchId !== fetchIdRef.current) return; // Ignore stale request
            
            if (data) {
                let processed = data.map(p => {
                    let s = p.stock || 0;
                    if (selectedBranchId) {
                        const br = (p.product_branch_stock || []).find((x: any) => x.branch_id === selectedBranchId);
                        if (br) s = br.stock;
                    }
                    return { ...p, stock: s };
                });

                // Extra client-side filters for complex cases not easily done in SQL
                if (activeFilter === 'no-category') {
                    processed = processed.filter(p => !p.category_id || p.category_id === 'snacks' || p.category_name === 'الأصناف المستوردة' || p.category_name === 'بدون قسم');
                } else if (activeFilter === 'published') {
                    processed = processed.filter(p => !p.description?.includes('[DRAFT]') && p.category_id !== 'trash' && !p.category_name?.includes('درافت') && !p.category_name?.includes('مخفي'));
                } else if (activeFilter === 'no-photo') {
                    processed = processed.filter(p => !p.image || p.image === PLACEHOLDER_IMAGE);
                } else if (activeFilter === 'ready-to-shot') {
                    processed = processed.filter(p => p.stock <= 0 && p.image && p.image !== PLACEHOLDER_IMAGE);
                } else if (activeFilter === 'no-tax') {
                    processed = processed.filter(p => p.description?.includes('[TAX_EXEMPT]') || p.category_id === 'no-tax' || p.category_name?.includes('بدون ضريبة'));
                } else if (activeFilter === 'trash') {
                    processed = processed.filter(p => p.description?.includes('[DRAFT]') || p.category_id === 'trash' || p.category_name?.includes('درافت') || p.category_name?.includes('مخفي'));
                } else if (['value', 'daily_changes', 'daily_value'].includes(activeFilter)) {
                    // These are informational cards, show all products when clicked
                }

                setProducts(processed);
                calculateStats();
            }
        } catch (e) {
            console.error("Fetch products failed:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initialize();
        fetchBranches();
        fetchCategories();
        notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    // Force assigned branch from profile (overrides localStorage for assigned users)
    useEffect(() => {
        if (user?.branch_id && branches.length > 0) {
            setSelectedBranchId(user.branch_id);
            localStorage.setItem('saada_selected_branch', String(user.branch_id));
            setCookie('saada_selected_branch', String(user.branch_id));
        }
    }, [user?.branch_id, branches.length]);

    useEffect(() => {
        fetchProducts();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'coupons') fetchCoupons();
        if (activeTab === 'subscribers') fetchSubscribers();
        if (activeTab === 'logs') fetchLogs();
    }, [searchQuery, selectedBranchId, activeFilter, activeTab]);

    // CENTRALIZED TAX GOVERNANCE SYSTEM
    const calculateProductPriceWithTax = (rawPrice: number, description: string = '', catName: string = '') => {
        const base = Number(rawPrice) || 0;
        if (base === 0) return 0;
        const isExempt = (description || '').includes('[TAX_EXEMPT]') || (catName || '').includes('بدون ضريبة');
        return isExempt ? base : Number((base * 1.14).toFixed(2));
    };

    // Handlers
    const handleSave = async () => {
      const isNew = !currentProduct.id;
      const { id, created_at, product_branch_stock, no_tax, ...updateFields } = currentProduct as any;
      let finalDescription = (updateFields.description || '').replace('[TAX_EXEMPT]', '').trim();
      if (no_tax) finalDescription = `${finalDescription} [TAX_EXEMPT]`.trim();
      
      // FIX: Do not implicitly apply 14% tax on every save, as this causes compounding price inflation.
      // The tax is applied automatically during Excel uploads. For manual UI edits, the price entered is the final price.
      const finalPrice = Number(updateFields.price) || 0;
      const productData = { ...updateFields, description: finalDescription, price: finalPrice };
      
      const { error } = isNew ? await supabase.from("products").insert([productData]) : await supabase.from("products").update(productData).eq("id", id);
      
      if (!error) {
          toast.success(isNew ? "تمت الإضافة" : "تم التحديث", {
              description: `السعر شامل الضريبة: ${finalPrice} ج.م`
          });
          fetchProducts();
          setIsEditDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['products'] });
      } else { toast.error("فشل الحفظ"); }
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setTempImageUrl(ev.target?.result as string);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (blob: Blob) => {
        setIsUploading(true);
        setIsCropperOpen(false);
        try {
            const fileName = `product-${Date.now()}.jpg`;
            const { data, error } = await supabase.storage.from('products').upload(fileName, blob);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
            setCurrentProduct(prev => ({ ...prev, image: publicUrl }));
            toast.success("تم رفع الصورة");
        } catch (e) {
            toast.error("فشل الرفع");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSkip = () => {
        setIsCropperOpen(false);
        if (tempImageUrl) setCurrentProduct(prev => ({ ...prev, image: tempImageUrl }));
    };

    const handleMarkAsReceived = async (id: number) => {
        const toastId = toast.loading("جاري التحديث...");
        try {
            const { error } = await supabase.from('orders').update({ status: 'received' }).eq('id', id);
            if (error) throw error;
            toast.success("تم الاستلام", { id: toastId });
            fetchOrders();
        } catch (e) {
            toast.error("فشل التحديث", { id: toastId });
        }
    };

    const handleReturnOrder = async (id: number) => {
        const toastId = toast.loading("جاري المرتجع...");
        try {
            const { error } = await supabase.from('orders').update({ status: 'pending' }).eq('id', id);
            if (error) throw error;
            toast.success("تم المرتجع بنجاح", { id: toastId });
            fetchOrders();
        } catch (e) {
            toast.error("فشل المرتجع", { id: toastId });
        }
    };

    const handleDeleteOrder = async (id: number) => {
        if (!confirm("حذف الطلب نهائياً؟ هذا الإجراء سيحذف كافة تفاصيل الطلب ولا يمكن التراجع عنه.")) return;
        const toastId = toast.loading("جاري حذف الطلب...");
        try {
            // 1. Delete associated order items first to satisfy foreign key constraints
            const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id);
            if (itemsError) throw itemsError;

            // 2. Delete the order itself
            const { error: orderError } = await supabase.from('orders').delete().eq('id', id);
            if (orderError) throw orderError;

            toast.success("تم حذف الطلب وكافة ملحقاته بنجاح", { id: toastId });
            fetchOrders();
        } catch (e: any) {
            console.error("Order deletion failed:", e);
            toast.error(`فشل الحذف: ${e.message || "تأكد من صلاحياتك"}`, { id: toastId });
        }
    };

    const handleExportData = () => {
        const productsToExport = selectedProductIds.length > 0 ? products.filter(p => selectedProductIds.includes(p.id)) : products; const data = productsToExport.map(p => ({
            الاسم: p.name,
            السعر: p.price,
            المخزون: p.stock,
            القسم: p.category_name,
            الباركود: p.description?.match(/باركود:\s*(\d+)/)?.[1] || ''
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
        XLSX.writeFile(wb, `منتجات-صناع-السعادة-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleBulkCategoryUpdate = async () => {
        if (!bulkCategoryId || selectedProductIds.length === 0) return;
        const toastId = toast.loading("جاري تحديث الأقسام...");
        try {
            const cat = dbCategories.find(c => c.id === bulkCategoryId);
            const { error } = await supabase.from('products').update({ 
                category_id: bulkCategoryId, 
                category_name: cat?.label || "" 
            }).in('id', selectedProductIds);
            
            if (!error) {
                toast.success(`تم تحديث ${selectedProductIds.length} منتج بنجاح`, { id: toastId });
                setIsBulkCategoryOpen(false);
                setSelectedProductIds([]); // CRITICAL: Clear selection after update
                fetchProducts();
            } else {
                throw error;
            }
        } catch (e) {
            toast.error("فشل التحديث الجماعي", { id: toastId });
        }
    };

    const handleNardSync = async () => {
        if (!nardCredentials.username || !nardCredentials.password) {
            toast.error("يرجى إدخال اسم المستخدم وكلمة المرور");
            return;
        }

        setIsNardSyncing(true);
        toast.info("جاري سحب البيانات من Nard POS...");

        try {
            const res = await fetch('/api/nard-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountCode: nardCredentials.code,
                    username: nardCredentials.username,
                    password: nardCredentials.password,
                    branchId: 15 // San Stefano
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.details || data.error || "فشل مزامنة البيانات");
            }

            const items = data.data;
            if (!items || !Array.isArray(items) || items.length === 0) {
                toast.warning("لم يتم العثور على منتجات في الفرع المختار");
                setIsNardSyncing(false);
                return;
            }

            toast.success(`تم جلب ${items.length} منتج بنجاح! جاري التحديث...`);

            // Fetch current DB products
            const { data: rawProducts } = await supabase.from('products').select('*');
            const productsInDb = rawProducts || [];
            
            let updatedCount = 0;
            let newCount = 0;
            let totalSoldQty = 0;
            let totalSoldValue = 0;

            const updates = [];
            const inserts = [];

            // We need to fetch categories to map them or just use Nard POS categories
            const { data: catData } = await supabase.from('categories').select('id, name, name_ar');
            const dbCats = catData || [];

            for (const item of items) {
                // Item from Nard POS structure:
                // name, barcode, price (or item_price/selling_price), quantity (or stock), category_name
                // It depends on their exact JSON. We assume some standard fields based on their POS.
                const name = item.name || item.item_name || '';
                if (!name) continue;

                const barcode = String(item.barcode || item.item_code || '');
                const rawPrice = Number(item.price || item.selling_price || item.item_price || 0);
                const qty = Number(item.quantity || item.stock || item.balance || 0);
                const costPrice = Number(item.cost_price || item.purchase_price || 0);
                const categoryName = item.category?.name || item.category_name || '';

                // Nard POS prices ALREADY include tax according to user's instructions for sync:
                // "هانلغي موضوع البدون ضريبة في حالة السحب من السيستم لكن لو يدوي يفضل"
                const finalPrice = rawPrice;

                let catId = null;
                if (categoryName) {
                    const existingCat = dbCats.find(c => 
                        (c.name && c.name.toLowerCase() === categoryName.toLowerCase()) || 
                        (c.name_ar && c.name_ar.toLowerCase() === categoryName.toLowerCase())
                    );
                    if (existingCat) {
                        catId = existingCat.id;
                    }
                }

                let existingProduct = null;
                
                if (barcode) {
                    const matchingProducts = productsInDb.filter(p => p.barcode === barcode);
                    if (matchingProducts.length > 0) {
                        // Prefer the one with an image if multiple exist
                        existingProduct = matchingProducts.find(p => p.image_url) || matchingProducts[0];
                    }
                }
                if (existingProduct) {
                    const oldStock = Number(existingProduct.stock) || 0;
                    const diff = oldStock - qty;
                    if (diff > 0) {
                        totalSoldQty += diff;
                        totalSoldValue += diff * (Number(existingProduct.price) || 0);
                    }

                    updates.push({
                        id: existingProduct.id,
                        price: finalPrice > 0 ? finalPrice : existingProduct.price,
                        stock: qty, // Overwrite store stock with Nard POS stock always
                        cost_price: costPrice > 0 ? costPrice : existingProduct.cost_price,
                        category_id: catId || existingProduct.category_id
                    });
                    updatedCount++;
                } else if (barcode) {
                    // Only insert new if it has a barcode, to prevent junk items without barcodes
                    inserts.push({
                        name: name,
                        barcode: barcode,
                        price: finalPrice,
                        stock: qty,
                        cost_price: costPrice,
                        category_id: catId,
                        is_active: true
                    });
                    newCount++;
                }
            }

            // Execute Updates
            for (let i = 0; i < updates.length; i += 50) {
                const chunk = updates.slice(i, i + 50);
                await supabase.from('products').upsert(chunk, { onConflict: 'id' });
            }

            // Execute Inserts
            for (let i = 0; i < inserts.length; i += 50) {
                const chunk = inserts.slice(i, i + 50);
                await supabase.from('products').insert(chunk);
            }

            // Save stats for "آخر جرد" buttons
            const finalResult = { count: totalSoldQty, value: totalSoldValue };
            sessionSalesOverrideRef.current = finalResult;
            setSessionSalesOverride(finalResult);
            localStorage.setItem('LAST_SYNC_SOLD_QTY', String(totalSoldQty));
            localStorage.setItem('LAST_SYNC_SOLD_VALUE', String(totalSoldValue));

            await logAction(user?.id, `تم المزامنة مع Nard POS: تحديث ${updatedCount} صنف وإضافة ${newCount} جديد. مبيعات الجرد: ${totalSoldQty} صنف.`);
            
            toast.success(`اكتملت المزامنة: تحديث ${updatedCount} وإضافة ${newCount} صنف`);
            setIsNardSyncOpen(false);
            fetchProducts();
            
        } catch (error: any) {
            console.error('Sync Error:', error);
            toast.error(error.message || "حدث خطأ غير معروف أثناء المزامنة");
        } finally {
            setIsNardSyncing(false);
        }
    };

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const dataArray = evt.target?.result;
                const wb = XLSX.read(dataArray, { type: 'array' });
                const rowData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                if (rowData.length === 0) return toast.error("الملف فارغ");
                const normBC = (c: any) => {
                    let s = String(c || '').trim();
                    const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
                    ar.forEach((digit, i) => s = s.replace(new RegExp(digit, 'g'), String(i)));
                    if (s.includes('.')) s = s.split('.')[0];
                    if (s.toLowerCase().includes('e+')) s = Number(s).toLocaleString('fullwide', {useGrouping:false});
                    return s.replace(/\D/g, '').replace(/^0+/, '') || '';
                };

                // RESET
                setSessionSalesOverride(null);
                sessionSalesOverrideRef.current = null;

                // 1. FETCH ALL PRODUCTS & CATEGORIES SEPARATELY (TO AVOID JOIN ERRORS)
                const { data: rawProducts, error: fetchError } = await supabase
                    .from('products')
                    .select('id, name, description, price, stock, category_id');

                if (fetchError || !rawProducts) throw fetchError;

                const { data: catData } = await supabase.from('categories').select('id, name, name_ar');
                const catMap = new Map();
                catData?.forEach(c => catMap.set(c.id, c.name || c.name_ar || ''));

                const productsInDb = rawProducts.map(p => ({
                    ...p,
                    category_name: catMap.get(p.category_id) || ''
                }));

                // 2. MAP BARCODES TO ALL MATCHING IDS
                const barcodeToIds = new Map<string, number[]>();
                productsInDb.forEach(p => {
                    const match = p.description?.match(/(\d{8,14})/);
                    if (match) {
                        const bc = normBC(match[1]);
                        const ids = barcodeToIds.get(bc) || [];
                        ids.push(p.id);
                        barcodeToIds.set(bc, ids);
                    }
                });

                // 3. DETECT HEADERS
                const firstRow = rowData[0] as any;
                const columns = Object.keys(firstRow);
                const findCol = (keys: string[]) => columns.find(c => keys.some(k => c.toLowerCase().includes(k.toLowerCase())));
                const bcKey = findCol(['barcode', 'باركود', 'كود', 'ean', 'sku', 'رقم الصنف']) || columns[0];
                const stockKey = findCol(['total_quantity', 'quantity', 'qty', 'stock', 'مخزون', 'كمية', 'رصيد', 'جرد']) || columns[1];
                const priceKey = findCol(['sale_price', 'sale', 'price', 'سعر', 'قيمة', 'بيع']) || columns[2];
                const nameKey = findCol(['name', 'item', 'product', 'اسم', 'صنف', 'البيان']) || columns[3];
                const catKey = findCol(['category', 'dept', 'قسم', 'نوع']) || columns[4];

                // 2. PREPARE TRACKING AND CALCULATION
                const processedIds = new Set<number>();
                const productUpdates: any[] = [];
                const newProducts: any[] = [];
                const stockUpdates: any[] = [];
                let totalSoldQty = 0;
                let totalSoldValue = 0;
                let updatedCount = 0;
                let addedCount = 0;
                setImportProgress({ current: 0, total: rowData.length });

                // Create a map for current stock and prices for fast diff calculation
                const dbStockMap = new Map<number, number>();
                const dbPriceMap = new Map<number, number>();
                if (selectedBranchId) {
                    const { data: bStocks } = await supabase.from('product_branch_stock').select('product_id, stock').eq('branch_id', selectedBranchId);
                    bStocks?.forEach(bs => dbStockMap.set(bs.product_id, bs.stock));
                }
                productsInDb.forEach(p => {
                    dbPriceMap.set(p.id, p.price);
                    if (!selectedBranchId) dbStockMap.set(p.id, p.stock || 0);
                });

                // 3. PROCESS EXCEL ROWS
                const topSoldItems: {name: string, diff: number, dbStock: number, sheetStock: number}[] = [];

                for (let i = 0; i < rowData.length; i++) {
                    const row = rowData[i] as any;
                    const bc = normBC(row[bcKey]);
                    if (!bc) continue; 

                    const sheetStockNum = Math.max(0, parseInt(String(row[stockKey] || 0).replace(/[^\d]/g, '')) || 0);
                    const sheetPriceRaw = parseFloat(String(row[priceKey] || 0).replace(/[^\d.]/g, ''));
                    const sheetName = String(row[nameKey] || '').trim();
                    const sheetCat = String(row[catKey] || '').trim();
                    
                    const pids = barcodeToIds.get(bc);
                    
                    if (pids && pids.length > 0) {
                        // EXISTING PRODUCT(S)
                        pids.forEach(pid => {
                            const p = productsInDb.find(x => x.id === pid);
                            const currentPrice = dbPriceMap.get(pid) || 0;
                            const currentStock = dbStockMap.get(pid) || 0;
                            
                            let finalPrice = currentPrice;
                            if (sheetPriceRaw > 0) {
                                const combinedCat = `${p?.category_name || ''} ${sheetCat}`;
                                finalPrice = calculateProductPriceWithTax(sheetPriceRaw, p?.description, combinedCat);
                            }

                            // Calculate Sales (Difference)
                            if (sheetStockNum < currentStock) {
                                const diff = currentStock - sheetStockNum;
                                totalSoldQty += diff;
                                totalSoldValue += (diff * finalPrice);
                                
                                if (topSoldItems.length < 5) {
                                    topSoldItems.push({ 
                                        name: p?.name || 'صنف', 
                                        diff: diff,
                                        dbStock: currentStock,
                                        sheetStock: sheetStockNum
                                    });
                                }
                            }

                            productUpdates.push({ 
                                id: pid, 
                                price: finalPrice, 
                                stock: selectedBranchId ? p?.stock : sheetStockNum 
                            });

                            if (selectedBranchId) {
                                stockUpdates.push({ product_id: pid, branch_id: selectedBranchId, stock: sheetStockNum });
                            }
                            processedIds.add(pid);
                        });
                        updatedCount++;
                    } else {
                        // NEW PRODUCT
                        const finalPrice = calculateProductPriceWithTax(sheetPriceRaw, '', sheetCat);
                        newProducts.push({
                            name: sheetName || `منتج جديد ${bc}`,
                            price: finalPrice,
                            stock: selectedBranchId ? 0 : sheetStockNum,
                            category_name: sheetCat || 'الأصناف المستوردة',
                            description: `باركود: ${bc}`,
                            image: PLACEHOLDER_IMAGE,
                            category_id: 'snacks'
                        });
                        addedCount++;
                    }
                }

                // Sort by absolute diff to find the most "impactful" matches for debug
                const debugMatches = topSoldItems.slice(0, 3).map(t => 
                    `${t.name}: شيت(${t.sheetStock}) مقابل داتا(${t.dbStock})`
                ).join('\n');

                // 4. GHOST SALES (NOT IN FILE = SOLD)
                const ghostProducts = productsInDb.filter(p => !processedIds.has(p.id) && (dbStockMap.get(p.id) || 0) > 0);
                if (ghostProducts.length > 0) {
                    ghostProducts.forEach(gp => {
                        const s = dbStockMap.get(gp.id) || 0;
                        totalSoldQty += s;
                        
                        // FIX: Apply tax to ghost sales as well
                        const taxedPrice = calculateProductPriceWithTax(gp.price, gp.description, gp.category_name);
                        totalSoldValue += (s * taxedPrice);
                        
                        if (topSoldItems.length < 5) {
                            topSoldItems.push({ name: gp.name, diff: s, dbStock: s, sheetStock: 0 });
                        }
                    });
                    
                    const ghostIds = ghostProducts.map(p => p.id);
                    if (selectedBranchId) {
                        const { error } = await supabase.from('product_branch_stock').update({ stock: 0 }).in('product_id', ghostIds).eq('branch_id', selectedBranchId);
                        if (error) throw error;
                    } else {
                        const { error } = await supabase.from('products').update({ stock: 0 }).in('id', ghostIds);
                        if (error) throw error;
                    }
                }

                // 5. EXECUTE UPDATES & INSERTS
                if (newProducts.length > 0) {
                    const { data: inserted, error: insertError } = await supabase.from('products').insert(newProducts).select();
                    if (insertError) throw insertError;
                    
                    if (selectedBranchId && inserted) {
                        const newStockPayload = inserted.map((np, idx) => ({ 
                            product_id: np.id, 
                            branch_id: selectedBranchId, 
                            stock: newProducts[idx].stock || 0 
                        }));
                        await supabase.from('product_branch_stock').insert(newStockPayload);
                    }
                }

                // Update Existing
                for (let i = 0; i < productUpdates.length; i++) {
                    const { id, ...payload } = productUpdates[i];
                    await supabase.from('products').update(payload).eq('id', id);
                    if (i % 10 === 0) setImportProgress({ current: i, total: productUpdates.length });
                }

                if (selectedBranchId && stockUpdates.length > 0) {
                    for (let i = 0; i < stockUpdates.length; i++) {
                        await supabase.from('product_branch_stock').upsert(stockUpdates[i], { onConflict: 'product_id,branch_id' });
                    }
                }

                // 6. FINALIZE & UPDATE CARDS
                const finalResult = { count: totalSoldQty, value: totalSoldValue };
                sessionSalesOverrideRef.current = finalResult;
                setSessionSalesOverride(finalResult);
                localStorage.setItem('LAST_SYNC_SOLD_QTY', String(totalSoldQty));
                localStorage.setItem('LAST_SYNC_SOLD_VALUE', String(totalSoldValue));
                setImportProgress(null);
                
                const ghostCount = ghostProducts.length;
                const excelUpdateCount = updatedCount;
                
                const debugInfo = debugMatches ? `\nمقارنة عينة:\n${debugMatches}` : '';
                toast.success(`جرد دقيق: تحديث ${excelUpdateCount} صنف + إضافة ${addedCount} صنف جديد + ${ghostCount} صنف غائب. المبيعات: ${totalSoldQty} قطعة بقيمة ${totalSoldValue.toFixed(2)}${debugInfo}`, {
                    duration: 60000 
                });
                fetchProducts();
            } catch (err: any) {
                console.error("Audit Fail:", err);
                toast.error(`فشل الجرد: ${err.message || "خطأ غير معروف"}`, {
                    duration: 60000 // Fixed for 1 minute
                });
                setImportProgress(null);
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const handleCleanupDuplicates = async () => {
        if (!confirm("دمج المكررات آلياً؟")) return;
        const { data: all } = await supabase.from('products').select('*');
        if (!all) return;

        const groups = new Map<string, any[]>();
        all.forEach(p => {
            const key = normalize(p.name);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)?.push(p);
        });

        let count = 0;
        for (const [key, items] of groups.entries()) {
            if (items.length > 1) {
                items.sort((a,b) => (b.stock || 0) - (a.stock || 0));
                const keep = items[0];
                const others = items.slice(1);
                const otherIds = others.map(o => o.id);
                
                await supabase.from('products').delete().in('id', otherIds);
                count += others.length;
            }
        }
        toast.success(`تم دمج ${count} منتج مكرر`);
        fetchProducts();
    };

    const handleRestoreLostImages = async () => {
        // Logic: find products with stock but no image, match them with products with 0 stock but having images
        const { data: all } = await supabase.from('products').select('*');
        if (!all) return;

        const stockedNoImg = all.filter(p => (p.stock || 0) > 0 && (!p.image || p.image === PLACEHOLDER_IMAGE));
        const zeroWithImg = all.filter(p => (p.stock || 0) === 0 && p.image && p.image !== PLACEHOLDER_IMAGE);

        let fixed = 0;
        for (const target of stockedNoImg) {
            const match = zeroWithImg.find(z => normalize(z.name) === normalize(target.name));
            if (match) {
                await supabase.from('products').update({ image: match.image }).eq('id', target.id);
                fixed++;
            }
        }
        toast.success(`تم استعادة ${fixed} صورة مفقودة`);
        fetchProducts();
    };

    const fetchProductLifecycle = async (p: Product) => {
        setLifecycleProduct(p);
        setIsLifecycleOpen(true);
        setLifecycleLoading(true);
        try {
            const { data } = await supabase.from('admin_logs').select('*').eq('details->product_id', p.id).order('created_at', { ascending: false });
            setLifecycleData(data || []);
        } catch (e) {
            console.error("Lifecycle failed:", e);
        } finally {
            setLifecycleLoading(false);
        }
    };

    return {
        user, isAuthenticated, products, loading, searchQuery, stats, activeFilter, selectedCategoryLabel, activeTab,
        isEditDialogOpen, isUploading, isCropperOpen, tempImageUrl, currentProduct, importProgress, selectedProductIds,
        coupons, couponsLoading, isCouponDialogOpen, newCoupon, subscribers, subscribersLoading, orders, ordersLoading,
        logs, logsLoading, isLifecycleOpen, lifecycleProduct, lifecycleData, lifecycleLoading, isBulkCategoryOpen,
        bulkCategoryId, isExemptImport, branches, selectedBranchId, isNotificationsEnabled, updatedSessionIds,
        
        setSearchQuery, setActiveFilter, setSelectedCategoryLabel, setActiveTab, setIsEditDialogOpen, setIsUploading,
        setIsCropperOpen, setTempImageUrl, setCurrentProduct, setImportProgress, setSelectedProductIds,
        setIsCouponDialogOpen, setNewCoupon, setIsLifecycleOpen, setIsBulkCategoryOpen, setBulkCategoryId,
        setIsExemptImport, setSelectedBranchId, setIsNotificationsEnabled,
        isNardSyncOpen, setIsNardSyncOpen, nardCredentials, setNardCredentials, isNardSyncing,
        
        login, logout, initialize, logAction, fetchProducts, fetchOrders, handleNardSync,
        handleBranchChange: (val: string) => {
            const id = Number(val); setSelectedBranchId(id);
            localStorage.setItem('saada_selected_branch', val); setCookie('saada_selected_branch', val);
        },
        toggleNotifications: () => {
            const s = !isNotificationsEnabled; setIsNotificationsEnabled(s);
            localStorage.setItem('SAADA_BELL_MASTER_V1', String(s)); setCookie('SAADA_BELL_MASTER_V1', String(s));
        },
        handleEdit: (p: Product) => { setCurrentProduct(p); setIsEditDialogOpen(true); },
        handleAddNew: () => { setCurrentProduct({ image: PLACEHOLDER_IMAGE, stock: 0, price: 0 }); setIsEditDialogOpen(true); },
        handleDelete: async (id: number) => { if(confirm("حذف؟")) { await supabase.from('products').delete().eq('id', id); fetchProducts(); } },
        handleToggleDraft: async (product: any) => {
            const isDraft = (product.description || '').includes('[DRAFT]');
            const newDesc = isDraft
                ? (product.description || '').replace('[DRAFT]', '').trim()
                : '[DRAFT] ' + (product.description || '').trim();
            const { error } = await supabase.from('products').update({ description: newDesc }).eq('id', product.id);
            if (error) { toast.error('فشل التحديث: ' + error.message); return; }
            toast.success(isDraft ? '✅ تم إلغاء الدرافت' : '🚫 تم تحويله لدرافت');
            fetchProducts();
        },
        handleSave, handleImageUpload, handleCropComplete, handleSkip, handleMarkAsReceived, handleReturnOrder, handleDeleteOrder,
        handleExportData, handleBulkCategoryUpdate, fetchProductLifecycle, formatPrice, categories: dbCategories, fetchCategories,
        handleExcelImport, handleCleanupDuplicates, handleRestoreLostImages,
        handleCreateCoupon: async () => {
            const { code, discount_type, discount_value } = newCoupon;
            if (!code.trim()) return toast.error("أدخل كود الخصم");
            if (!discount_value || discount_value <= 0) return toast.error("أدخل قيمة صحيحة");
            const { error } = await supabase.from('coupons').insert([{ code: code.trim().toUpperCase(), discount_type, discount_value }]);
            if (error) return toast.error(`فشل إنشاء الكود: ${error.message}`);
            toast.success("تم إنشاء كود الخصم");
            setNewCoupon({ code: "", discount_type: "percentage", discount_value: 0 });
            setIsCouponDialogOpen(false);
            fetchCoupons();
        },
        handleDeleteCoupon: async (id: number) => {
            if (!confirm("حذف كود الخصم؟")) return;
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) return toast.error(`فشل الحذف: ${error.message}`);
            toast.success("تم حذف الكود");
            fetchCoupons();
        }
    };
};
