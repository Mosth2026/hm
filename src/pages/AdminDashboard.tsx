
import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import {
    BarChart,
    Package,
    Plus,
    Search,
    Edit,
    Trash2,
    TrendingUp,
    AlertTriangle,
    AlertCircle,
    Save,
    X,
    Image as ImageIcon,
    Check,
    Camera,
    Upload,
    Sparkles as SparklesIcon,
    ExternalLink,
    CheckCircle2,
    CheckCircle,
    Merge,
    FileSpreadsheet,
    RefreshCw,
    Percent,
    Ticket,
    List,
    Users,
    Clock,
    PieChart,
    Calendar,
    MousePointer2
} from "lucide-react";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import * as XLSX from 'xlsx';
import ImageCropper from "@/components/admin/ImageCropper";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Product } from "@/hooks/use-products";

import { SITE_CONFIG } from "@/lib/constants";

const PLACEHOLDER_IMAGE = SITE_CONFIG.placeholderImage;

const AdminDashboard = () => {
    const { user, isAuthenticated, login, logout, initialize } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        initialize();
    }, []);

    const [authData, setAuthData] = useState({ username: '', password: '' });
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        totalValue: 0,
        categories: 0,
        zeroStock: 0,
        needsPhoto: 0,
        published: 0,
        noTax: 0,
        readyToShot: 0,
        trash: 0,
        dailyChanges: 0,
        dailyValue: 0,
        salesProductIds: [] as number[],
        salesQuantities: {} as Record<number, number>
    });
    const [activeFilter, setActiveFilter] = useState<"all" | "low" | "value" | "categories" | "zero" | "draft" | "published" | "no-tax" | "ready" | "trash" | "daily">("all");
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "coupons" | "logs" | "subscribers" | "analytics">("products");
    const [coupons, setCoupons] = useState<any[]>([]);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [subscribersLoading, setSubscribersLoading] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: 0
    });
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [updatedSessionIds, setUpdatedSessionIds] = useState<number[]>([]);
    const [importProgress, setImportProgress] = useState<{ current: number, total: number } | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [isLifecycleOpen, setIsLifecycleOpen] = useState(false);
    const [lifecycleProduct, setLifecycleProduct] = useState<Product | null>(null);
    const [lifecycleData, setLifecycleData] = useState<any[]>([]);
    const [lifecycleLoading, setLifecycleLoading] = useState(false);

    const logAction = async (action: string, details: any = {}, productId?: number) => {
        try {
            await supabase.from('admin_logs').insert([{
                username: user?.username || 'unknown',
                action,
                details: productId ? { ...details, product_id: productId } : details
            }]);
        } catch (e) {
            console.error("Failed to log action:", e);
        }
    };

    const username = user?.username?.toLowerCase() || "";
    const isRestrictedStaff = username.includes('mostafa') || username.includes('hesham') || username.includes('fikry') || username === 'h';
    const isSpecial = isRestrictedStaff || user?.role === 'admin' || user?.role === 'editor';
    const isSuperAdmin = username === 'elhanafy' || username === 'h';
    const isAdmin = (user?.role === 'admin' || isSuperAdmin) && !isRestrictedStaff;
    const canDelete = isAdmin;
    const canEditPrice = isAdmin;

    // Define filteredProducts near the top but as a derived value

    const filteredProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            const aUpdated = updatedSessionIds.includes(a.id);
            const bUpdated = updatedSessionIds.includes(b.id);
            if (aUpdated && !bUpdated) return -1;
            if (!aUpdated && bUpdated) return 1;
            return (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        });
    }, [products, updatedSessionIds]);

    useEffect(() => {
        setSelectedProductIds([]);
    }, [activeFilter, selectedCategoryLabel, searchQuery]);

    const handleExportData = () => {
        if (filteredProducts.length === 0) {
            toast.error("لا توجد بيانات لتصديرها في هذا القسم");
            return;
        }

        const exportData = filteredProducts.map(p => ({
            "الاسم": p.name,
            "الباركود": p.description?.includes('باركود:') ? p.description.split('باركود:')[1].trim().replace('[TAX_EXEMPT]', '').replace('[DRAFT]', '').trim() : "",
            "القسم": p.category_name,
            "السعر": p.price,
            "المخزون": p.stock,
            "الحالة": p.description?.includes('[DRAFT]') ? 'مسودة' : ((p.stock ?? 0) > 0 ? 'نشط' : 'منتهي')
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        const sheetName = activeFilter === "all" ? "جميع المنتجات" :
            activeFilter === "categories" ? (selectedCategoryLabel || "قسم محدد") :
                activeFilter === "trash" ? "الدرافت" : "تقرير المنتجات";

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `saada_export_${new Date().getTime()}.xlsx`);
        toast.success("تم تصدير البيانات بنجاح");
    };

    const handleBulkDelete = async () => {
        if (selectedProductIds.length === 0) return;
        if (!confirm(`هل أنت متأكد من حذف ${selectedProductIds.length} صنف نهائياً؟`)) return;

        const { error } = await supabase.from('products').delete().in('id', selectedProductIds);
        if (error) {
            toast.error("فشل الحذف الجماعي");
        } else {
            toast.success("تم الحذف بنجاح");
            logAction('bulk_delete_products', { count: selectedProductIds.length, ids: [...selectedProductIds] });
            setSelectedProductIds([]);
            fetchProducts();
        }
    };

    const handleBulkDraft = async (toDraft: boolean) => {
        if (selectedProductIds.length === 0) return;

        const toastId = toast.loading(toDraft ? "جاري نقل المنتجات للدرافت..." : "جاري استعادة المنتجات...");

        try {
            const updates = selectedProductIds.map((id) => {
                const prod = products.find(p => p.id === id);
                if (!prod) return null;
                // Remove existing [DRAFT] if any to avoid duplicates
                let desc = (prod.description || '').replace('[DRAFT]', '').trim();
                if (toDraft) desc = `${desc} [DRAFT]`.trim();
                return { id, description: desc };
            }).filter(u => u !== null);

            if (updates.length === 0) throw new Error("لم يتم العثور على المنتجات المختارة");

            // Perform updates sequentially to maintain database integrity
            for (const up of updates) {
                const { error } = await supabase
                    .from('products')
                    .update({ description: up!.description })
                    .eq('id', up!.id);
                if (error) throw error;
            }

            toast.success(toDraft ? "تم إخفاء المنتجات في الدرافت" : "تم استعادة المنتجات بنجاح", { id: toastId });
            logAction(toDraft ? 'bulk_move_to_draft' : 'bulk_restore_from_draft', { count: updates.length, ids: selectedProductIds });
            setSelectedProductIds([]);
            fetchProducts();
        } catch (error: any) {
            console.error("Bulk Actions Error:", error);
            toast.error("فشل تنفيذ الإجراء الجماعي", {
                description: error.message,
                id: toastId
            });
        }
    };



    // دالة مطورة لتنظيف النصوص العربية للمطابقة (Shared)
    const normalize = (text: string) => {
        if (!text) return '';
        return String(text).toLowerCase()
            .trim()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/[ىيی]/g, 'ي')
            .replace(/[ؤئ]/g, 'ي')
            .replace(/[كک]/g, 'ك')
            .replace(/[\u064B-\u0652\u0640]/g, '') // إزالة التشكيل والتطويل
            .replace(/جرام/g, 'جم')
            .replace(/كيلو/g, 'ك')
            .replace(/[^a-z0-9\u0621-\u064A]/g, ''); // إزالة كل الرموز والمسافات
    };

    const normalizeBarcode = (code: any) => {
        if (!code) return '';
        // تنظيف الباركود من الأصفار الشمال (التي يحذفها الإكسيل) ومن أي مسافات أو رموز
        const cleaned = String(code).replace(/\D/g, '').replace(/^0+/, '');
        return cleaned || '0';
    };

    const [conflictProducts, setConflictProducts] = useState<{ key: string, items: Product[] }[]>([]);
    const [isConflictResolverOpen, setIsConflictResolverOpen] = useState(false);

    const fetchConflicts = async () => {
        try {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            if (!data) return;

            const barcodeGroups = new Map<string, Product[]>();
            const nameGroups = new Map<string, Product[]>();

            data.forEach(p => {
                // 1. استخراج الباركود الصافي (الأرقام فقط)
                let pureBarcode = null;
                if (p.description && p.description.includes('باركود:')) {
                    const match = p.description.match(/باركود:\s*(\d+)/);
                    if (match) pureBarcode = normalizeBarcode(match[1]);
                }

                // 2. تجميع بالباركود (الأولوية القصوى)
                if (pureBarcode && pureBarcode.length > 3) {
                    const existing = barcodeGroups.get(pureBarcode) || [];
                    barcodeGroups.set(pureBarcode, [...existing, p]);
                } else {
                    // 3. تجميع بالاسم فقط للأصناف التي ليس لها باركود لضمان الدقة
                    const normName = normalize(p.name);
                    if (normName && normName.length > 5) {
                        const existing = nameGroups.get(normName) || [];
                        nameGroups.set(normName, [...existing, p]);
                    }
                }
            });

            const conflicts: { key: string, items: Product[] }[] = [];

            // إضافة مجموعات الباركود المكررة فعلياً
            barcodeGroups.forEach((items, code) => {
                if (items.length > 1) {
                    conflicts.push({ key: `نفس الباركود: ${code}`, items });
                }
            });

            // إضافة تعارضات بالاسم بشرط أن تكون أصناف "تائهة" (بدون باركود)
            nameGroups.forEach((items, name) => {
                if (items.length > 1) {
                    conflicts.push({ key: `اسم متشابه (بدون باركود): ${items[0].name}`, items });
                }
            });

            setConflictProducts(conflicts);
        } catch (err) {
            console.error("Conflict Fetch Error:", err);
        }
    };

    const handleMergeProducts = async (keepId: number, deleteIds: number[]) => {
        const toastId = toast.loading("جاري دمج المنتجات...");
        try {
            const { data: toDeleteData } = await supabase.from('products').select('*').in('id', deleteIds);
            const { data: keepData } = await supabase.from('products').select('*').eq('id', keepId).single();

            if (!keepData) throw new Error("Product to keep not found");

            let bestImage = keepData.image;
            const hasRealImage = (img: string) => img && img !== PLACEHOLDER_IMAGE && !img.includes('unsplash.com');

            if (!hasRealImage(bestImage)) {
                const salvage = toDeleteData?.find(p => hasRealImage(p.image));
                if (salvage) bestImage = salvage.image;
            }

            const maxStock = Math.max(keepData.stock || 0, ...(toDeleteData?.map(p => p.stock || 0) || [0]));

            await supabase.from('products').update({
                image: bestImage,
                stock: maxStock,
                updated_at: new Date().toISOString()
            }).eq('id', keepId);

            await supabase.from('products').delete().in('id', deleteIds);

            toast.success("تم الدمج بنجاح وتصحيح البيانات", { id: toastId });
            fetchConflicts();
            fetchProducts();
        } catch (err: any) {
            toast.error("فشل الدمج", { description: err.message, id: toastId });
        }
    };
    const handleRestoreLostImages = async () => {
        if (!confirm("سيتم الآن البحث عن الأصناف التي لها رصيد وبدون صورة، ومحاولة مطابقتها مع الأصناف القديمة (التي لها صور ورصيدها صفر). هل تود البدء؟\n\nنصيحة: استخدم هذا الزر إذا لاحظت وجود أصناف مكررة أو صور مفقودة بعد رفع الطلبية.")) return;

        const toastId = toast.loading("جاري فحص المتجر واستعادة الصور المفقودة...");
        try {
            const { data: allProducts, error } = await supabase.from('products').select('*');
            if (error) throw error;

            // الأصناف التي لها رصيد ولكن ليس لها صورة حقيقية
            const stockedNoImage = allProducts.filter(p =>
                (p.stock || 0) > 0 &&
                (p.image === PLACEHOLDER_IMAGE || !p.image || p.image.includes('unsplash.com'))
            );

            // الأصناف التي رصيدها صفر ولديها صور حقيقية (الكنز المفقود)
            const noStockHasImage = allProducts.filter(p =>
                (p.stock || 0) === 0 &&
                p.image &&
                !p.image.includes('unsplash.com') &&
                p.image !== PLACEHOLDER_IMAGE
            );

            let fixedCount = 0;
            const idsToDelete: number[] = [];
            const toUpdate: { id: number, data: any }[] = [];

            for (const target of stockedNoImage) {
                const normTarget = normalize(target.name);

                // Extract barcode from target description if available
                const targetBarcode = target.description?.includes('باركود:') ?
                    target.description.split('باركود:')[1].trim().replace(/[^0-9]/g, '') : null;

                // البحث عن مطابق في الأصناف المهجورة (رصيدها صفر ولها صورة)
                const source = noStockHasImage.find(s => {
                    // Try Barcode Match First (Highest Accuracy)
                    if (targetBarcode) {
                        const sBarcode = s.description?.includes('باركود:') ?
                            s.description.split('باركود:')[1].trim().replace(/[^0-9]/g, '') : null;
                        if (sBarcode && sBarcode === targetBarcode) return true;
                    }

                    // Fallback to Name Match
                    const normSource = normalize(s.name);
                    return normSource === normTarget ||
                        (normSource.length > 5 && normTarget.includes(normSource)) ||
                        (normTarget.length > 5 && normSource.includes(normTarget));
                });

                if (source) {
                    toUpdate.push({
                        id: target.id,
                        data: {
                            image: source.image,
                            category_id: source.category_id,
                            category_name: source.category_name,
                            description: target.description || source.description
                        }
                    });
                    idsToDelete.push(source.id);
                    fixedCount++;
                }
            }

            if (fixedCount === 0) {
                toast.dismiss(toastId);
                return toast.info("لم يتم العثور على أصناف مكررة تحتاج لدمج أو استعادة صور حالياً.");
            }

            // تطبيق التحديثات
            for (const item of toUpdate) {
                await supabase.from('products').update(item.data).eq('id', item.id);
            }

            // حذف المكررات التي تم نقل صورها
            if (idsToDelete.length > 0) {
                const CHUNK = 50;
                for (let i = 0; i < idsToDelete.length; i += CHUNK) {
                    await supabase.from('products').delete().in('id', idsToDelete.slice(i, i + CHUNK));
                }
            }

            toast.success(`عملية ناجحة: تم استعادة ${fixedCount} صورة ودمج المكررات بنجاح! المتجر الآن أكثر تنظيماً.`, { id: toastId, duration: 8000 });
            fetchProducts();
        } catch (err: any) {
            console.error("Recovery Error:", err);
            toast.error("فشل في عملية الاستعادة الذكية", { description: err.message, id: toastId });
        }
    };

    useEffect(() => {
        if (activeTab === "orders") {
            fetchOrders();
        } else if (activeTab === "logs") {
            fetchLogs();
        } else if (activeTab === "subscribers") {
            fetchSubscribers();
        }
    }, [activeTab]);

    const fetchSubscribers = async () => {
        setSubscribersLoading(true);
        try {
            const { data, error } = await supabase
                .from("subscribers")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSubscribers(data || []);
        } catch (error: any) {
            toast.error("خطأ في تحميل المشتركين", {
                description: error.message,
                duration: 6000
            });
        } finally {
            setSubscribersLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const { data, error } = await supabase
                .from("admin_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(200);

            if (error) throw error;
            setLogs(data || []);
        } catch (error: any) {
            toast.error("خطأ في تحميل سجل التعديلات", {
                description: error.message,
                duration: 6000
            });
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error: any) {
            toast.error("خطأ في تحميل الطلبات", {
                description: error.message,
                duration: 6000
            });
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleMarkAsReceived = async (orderId: number) => {
        const toastId = toast.loading("جاري معالجة الطلب وتحديث المخزون...");
        try {
            // 1. Fetch order items
            const { data: items, error: itemsError } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", orderId);

            if (itemsError) throw itemsError;

            // 2. Process each item for FEFO stock deduction
            for (const item of (items || [])) {
                let remainingToDeduct = item.quantity;

                // Find all product batches for this product (match by name or barcode)
                // Normalize search for robustness
                const normName = normalize(item.product_name);

                // Fetch all candidate batches
                const { data: batches, error: batchError } = await supabase
                    .from("products")
                    .select("*")
                    .or(`name.ilike.%${item.product_name}%`); // Basic match, we will refine in JS

                if (batchError) continue;

                // Refine matches and filter by stock > 0
                const validBatches = (batches || []).filter(b => {
                    const bNormName = normalize(b.name);
                    // Check if name matches or if barcode (in description) matches
                    const nameMatch = bNormName === normName;
                    return nameMatch && b.stock > 0;
                }).sort((a, b) => {
                    // Sort by expiry_date: ASC (earliest first), nulls last
                    if (!a.expiry_date) return 1;
                    if (!b.expiry_date) return -1;
                    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
                });

                // Deduct from batches
                for (const batch of validBatches) {
                    if (remainingToDeduct <= 0) break;

                    const deduction = Math.min(batch.stock, remainingToDeduct);
                    const newStock = batch.stock - deduction;

                    const { error: updateError } = await supabase
                        .from("products")
                        .update({ stock: newStock })
                        .eq("id", batch.id);

                    if (!updateError) {
                        remainingToDeduct -= deduction;
                        logAction('order_stock_out', {
                            order_id: orderId,
                            product_id: batch.id,
                            quantity: deduction,
                            type: 'OUT'
                        }, batch.id);

                        if (newStock === 0) {
                            logAction('product_out_of_stock', {
                                product_id: batch.id,
                                name: batch.name,
                                reason: 'order_sale'
                            }, batch.id);
                        }
                        console.log(`Deducted ${deduction} from batch ${batch.id} (${batch.expiry_date}) for ${item.product_name}`);
                    }
                }
            }

            // 3. Update order status
            const { error: orderError } = await supabase
                .from("orders")
                .update({
                    status: 'received',
                    processed_by: user?.username || 'system'
                })
                .eq("id", orderId);

            if (orderError) throw orderError;

            toast.success("تم تأكيد الاستلام وتحديث المخزون (FEFO)", { id: toastId });
            logAction('order_received_stock_deducted', { order_id: orderId, processor: user?.username });
            fetchOrders();
        } catch (error: any) {
            console.error("Order processing error:", error);
            toast.error("فشل معالجة الطلب", {
                description: error.message,
                id: toastId
            });
        }
    };

    const fetchCoupons = async () => {
        setCouponsLoading(true);
        try {
            const { data, error } = await supabase
                .from("coupons")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setCoupons(data || []);
        } catch (error: any) {
            toast.error("خطأ في تحميل الأكواد", { description: error.message });
        } finally {
            setCouponsLoading(false);
        }
    };

    const handleAddCoupon = async () => {
        if (!newCoupon.code || newCoupon.discount_value <= 0) {
            toast.error("يرجى إدخال كود صحيح وقيمة خصم أكبر من صفر");
            return;
        }
        try {
            const { error } = await supabase
                .from("coupons")
                .insert([{
                    code: newCoupon.code.toUpperCase(),
                    discount_type: newCoupon.discount_type,
                    discount_value: newCoupon.discount_value
                }]);
            if (error) throw error;
            toast.success("تم إضافة كود الخصم بنجاح");
            setIsCouponDialogOpen(false);
            setNewCoupon({ code: "", discount_type: "percentage", discount_value: 0 });
            fetchCoupons();
        } catch (error: any) {
            toast.error("فشل إضافة الكود", { description: error.message });
        }
    };

    const handleDeleteCoupon = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف كود الخصم؟")) return;
        try {
            const { error } = await supabase.from("coupons").delete().eq("id", id);
            if (error) throw error;
            toast.success("تم حذف الكود");
            fetchCoupons();
        } catch (error: any) {
            toast.error("فشل الحذف", { description: error.message });
        }
    };

    useEffect(() => {
        if (activeTab === "coupons") {
            fetchCoupons();
        }
    }, [activeTab]);

    const categories = [
        { id: "chocolate", label: "الشوكولاتة" },
        { id: "coffee", label: "القهوة" },
        { id: "drinks", label: "المشروبات" },
        { id: "cookies", label: "الكوكيز والبسكويت" },
        { id: "candy", label: "الكاندي" },
        { id: "snacks", label: "الاسناكس" },
        { id: "cosmetics", label: "مستحضرات التجميل" },
        { id: "gifts", label: "صناديق الهدايا" },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery, activeFilter, selectedCategoryLabel]);

    const fetchProducts = async () => {
        setLoading(true);
        let query = supabase.from("products").select("*");

        // Server-side Search (Name or Barcode)
        if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Server-side Filters (Always exclude Drafts unless specifically viewing them)
        if (activeFilter !== "trash") {
            query = query.not('description', 'ilike', '%[DRAFT]%');
        }

        if (activeFilter === "low") {
            query = query.lt('stock', 10).gt('stock', 0);
        } else if (activeFilter === "daily") {
            if (stats.salesProductIds && stats.salesProductIds.length > 0) {
                query = query.in('id', stats.salesProductIds);
            } else {
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);
                query = query.gte('updated_at', startOfToday.toISOString());
            }
        } else if (activeFilter === "zero") {
            query = query.eq('stock', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '').neq('image', PLACEHOLDER_IMAGE);
        } else if (activeFilter === "draft") {
            // المنتجات التي تحتاج صور (رصيدها صفر وبدون صورة)
            query = query.eq('stock', 0).or('image.is.null,image.eq.,image.ilike.%unsplash%');
        } else if (activeFilter === "trash") {
            // المنتجات المسودة مانيوال
            query = query.ilike('description', '%[DRAFT]%');
        } else if (activeFilter === "published") {
            query = query.gte('stock', 1).gt('price', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '').neq('image', PLACEHOLDER_IMAGE);
        } else if (activeFilter === "value") {
            query = query.gt('price', 100);
        } else if (activeFilter === "categories" && selectedCategoryLabel) {
            query = query.eq('category_name', selectedCategoryLabel);
        } else if (activeFilter === "no-tax") {
            query = query.ilike('description', '%[TAX_EXEMPT]%');
        } else if (activeFilter === "ready") {
            query = query.gte("stock", 1).or('image.is.null,image.eq.,image.ilike.%unsplash%');
        }

        if (activeFilter === "all") {
            query = query.order("id", { ascending: false });
        } else {
            query = query.order("stock", { ascending: false }).order("id", { ascending: false });
        }

        const { data, error } = await query.range(0, 1000);

        if (error) {
            toast.error("خطأ في تحميل المنتجات", {
                description: error.message,
                duration: 8000
            });
        } else {
            const processed = (data || []).map(p => {
                let noTax = p.category_id === 'no-tax';
                let description = p.description || '';
                let name = p.name || '';
                let category_name = p.category_name || '';

                if (description.includes('[TAX_EXEMPT]') || name.includes('[TAX_EXEMPT]') || category_name.includes('[TAX_EXEMPT]')) {
                    noTax = true;
                }

                // Strip technical tags for a cleaner dashboard view
                name = name.replace(/\[TAX_EXEMPT\]/g, '').trim();
                description = description.replace(/\[TAX_EXEMPT\]/g, '').trim();
                category_name = category_name.replace(/\[TAX_EXEMPT\]/g, '').trim();

                return {
                    ...p,
                    name,
                    description,
                    category_name,
                    no_tax: noTax,
                    expiry_date: p.expiry_date || null
                };
            });
            setProducts(processed);
            calculateStats(processed);
            if (user?.role === 'admin' || user?.username === 'maher' || user?.username === 'h' || user?.username === 'mostafa' || user?.username === 'hesham') fetchConflicts();
        }
        setLoading(false);
    };

    const calculateStats = async (data: Product[]) => {
        try {
            const [
                { count: totalCount },
                { count: lowStockCount },
                { count: zeroStockCount },
                { count: needsPhotoCount },
                { count: publishedCount },
                { count: noTaxCount },
                { count: readyToShotCount },
                { count: trashCount },
                { data: allProducts },
                { data: lastSyncLog }
            ] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }).not('description', 'ilike', '%[DRAFT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock', 10).gte('stock', 1).not('description', 'ilike', '%[DRAFT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '').neq('image', PLACEHOLDER_IMAGE).not('description', 'ilike', '%[DRAFT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).or('image.is.null,image.eq.,image.ilike.%unsplash%').not('description', 'ilike', '%[DRAFT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).gte('stock', 1).gt('price', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '').neq('image', PLACEHOLDER_IMAGE).not('description', 'ilike', '%[DRAFT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).ilike('description', '%[TAX_EXEMPT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).gte('stock', 1).or('image.is.null,image.eq.,image.ilike.%unsplash%').not('description', 'ilike', '%[DRAFT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).ilike('description', '%[DRAFT]%'),
                supabase.from('products').select('price, stock, updated_at'),
                supabase.from('admin_logs').select('details, created_at').eq('action', 'excel_sync_summary').order('created_at', { ascending: false }).limit(1)
            ]);

            const total = totalCount || 0;
            const low = lowStockCount || 0;
            const zero = zeroStockCount || 0;
            const draft = needsPhotoCount || 0;
            const published = publishedCount || 0;
            const noTax = noTaxCount || 0;
            const trash = trashCount || 0;

            const value = (allProducts || []).reduce((acc, p) => acc + (p.price * (p.stock ?? 0)), 0);

            // Get session stats from last log (Sales tracking)
            let dailyChanges = 0;
            let dailyValue = 0;
            let salesProductIds: number[] = [];
            let salesQuantities: Record<number, number> = {};
            if (lastSyncLog && lastSyncLog.length > 0) {
                const details = lastSyncLog[0].details;
                dailyChanges = details.sales_count || 0;
                dailyValue = details.sales_value || 0;
                salesProductIds = details.sales_product_ids || [];
                salesQuantities = details.sales_quantities || {};
            }

            setStats({
                totalProducts: total,
                lowStock: low,
                totalValue: value,
                categories: categories.length,
                zeroStock: zero,
                needsPhoto: draft,
                published: published,
                noTax: noTax,
                readyToShot: readyToShotCount || 0,
                trash: trash,
                dailyChanges,
                dailyValue,
                salesProductIds,
                salesQuantities
            });
        } catch (err) {
            console.error("Error calculating stats:", err);
        }
    };

    const handleEdit = (product: Product) => {
        setCurrentProduct({ ...product, no_tax: product.description?.includes('[TAX_EXEMPT]') });
        setIsEditDialogOpen(true);
    };

    const fetchProductLifecycle = async (product: Product) => {
        setLifecycleProduct(product);
        setIsLifecycleOpen(true);
        setLifecycleLoading(true);
        try {
            // 1. Fetch Sales from order_items
            const { data: sales, error: salesError } = await supabase
                .from('order_items')
                .select('*, orders(customer_name, status)')
                .eq('product_id', product.id);

            // 2. Fetch Logs from admin_logs
            // We search by product_id in JSON or name match
            const { data: adminLogs, error: logsError } = await supabase
                .from('admin_logs')
                .select('*')
                .or(`details->>product_id.eq.${product.id},details->>name.ilike.%${product.name}%`);

            if (salesError || logsError) throw salesError || logsError;

            // Combine and format
            const history = [
                ...(sales || []).map(s => ({
                    type: 'SALE',
                    date: s.created_at,
                    quantity: s.quantity,
                    label: `خروج: مبيعات (${s.quantity} قطعة)`,
                    note: `طلب رقم ${s.order_id} - ${s.orders?.customer_name || 'عميل'}`,
                    status: s.orders?.status === 'received' ? 'تم التسليم' : 'قيد التنفيذ'
                })),
                ...(adminLogs || []).map(l => {
                    let label = 'تعديل بيانات';
                    let note = `بواسطة: ${l.username}`;
                    if (l.action === 'add_product') label = 'دخول: إنشاء صنف جديد';
                    if (l.action === 'excel_sync_stock') {
                        const change = l.details?.change || 0;
                        label = change > 0 ? `دخول: توريد (+${change} قطعة)` : `تعديل: تحديث مخزون (${change})`;
                        note = `مزامنة إكسيل بواسطة ${l.username}`;
                    }
                    if (l.action === 'order_stock_out') {
                        label = `خروج: تسليم طلب (-${l.details?.quantity || 0} قطعة)`;
                        note = `تلقائي عند استلام الطلب #${l.details?.order_id}`;
                    }
                    if (l.action === 'product_out_of_stock') {
                        label = `نفاد المخزون (صِفر)`;
                        note = `أصبح الرصيد صفراً بسبب ${l.details?.reason === 'order_sale' ? 'مبيعات' : 'تحديث إكسيل'}`;
                    }

                    return {
                        type: l.action === 'product_out_of_stock' ? 'ALERT' : 'ADMIN',
                        date: l.created_at,
                        label,
                        note,
                        details: l.details
                    };
                }),
                {
                    type: 'BIRTH',
                    date: product.created_at,
                    label: 'بداية القصة: دخول الفرع',
                    note: `تم تسجيل الصنف في النظام لأول مرة`
                }
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setLifecycleData(history);
        } catch (err) {
            console.error("Failed to fetch lifecycle:", err);
            toast.error("فشل تحميل تاريخ المنتج");
        } finally {
            setLifecycleLoading(false);
        }
    };

    const handleAddNew = () => {
        setCurrentProduct({
            name: "",
            price: 0,
            stock: 0,
            category_id: "snacks",
            category_name: "الاسناكس",
            image: PLACEHOLDER_IMAGE,
            is_featured: false,
            is_new: false,
            is_on_sale: false,
            discount: 0,
            no_tax: false,
            expiry_date: ""
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
            toast.error("فشل الحذف", {
                description: error.message,
                duration: 6000
            });
        } else {
            toast.success("تم الحذف بنجاح");
            logAction('delete_product', { id });
            fetchProducts();
        }
    };

    const handleDeleteAllReadyToShot = async () => {
        if (stats.readyToShot === 0) {
            toast.info("لا توجد أصناف في هذه القائمة لحذفها");
            return;
        }

        if (!confirm(`تحذير: أنت على وشك حذف ${stats.readyToShot} صنف نهائياً. هذه الأصناف لها رصيد ولكن ليس لها صور حقيقية. هل تود الاستمرار؟`)) return;

        const toastId = toast.loading("جاري تنظيف الأصناف المعلقة...");
        try {
            // نحصل على قائمة الـ IDs أولاً لضمان الدقة
            const { data, error: fetchError } = await supabase
                .from('products')
                .select('id')
                .gte('stock', 1)
                .or(`image.ilike.%unsplash.com%,image.is.null,image.eq.""`);

            if (fetchError) throw fetchError;

            if (data && data.length > 0) {
                const ids = data.map(p => p.id);
                const { error: deleteError } = await supabase
                    .from('products')
                    .delete()
                    .in('id', ids);

                if (deleteError) throw deleteError;

                toast.success(`تم حذف ${ids.length} صنف بنجاح. المتجر الآن نظيف تماماً.`, { id: toastId });
                logAction('delete_all_ready_to_shot', { count: ids.length, ids });
                fetchProducts();
            } else {
                toast.info("لم يتم العثور على أصناف", { id: toastId });
            }
        } catch (err: any) {
            console.error("Bulk delete error:", err);
            toast.error("حدث خطأ أثناء الحذف الجماعي", {
                description: err.message,
                id: toastId
            });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setTempImageUrl(reader.result as string);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsUploading(true);
        try {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
            const filePath = `product-images/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('products').upload(filePath, croppedBlob, { contentType: 'image/webp', upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
            const updatedProduct = { ...currentProduct, image: publicUrl };
            setCurrentProduct(updatedProduct);
            if (currentProduct.id) {
                await supabase.from("products").update({ image: publicUrl }).eq("id", currentProduct.id as number);
                fetchProducts();
            }
            setIsCropperOpen(false);
            
            // Invalidate caches to show updated image everywhere
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (currentProduct.id) {
                queryClient.invalidateQueries({ queryKey: ['product', currentProduct.id] });
                setUpdatedSessionIds(prev => [...new Set([...prev, currentProduct.id as number])]);
            }
            
            toast.success("تم تجهيز الصورة وحفظها تلقائياً");
        } catch (error: any) {
            toast.error("خطأ في الرفع", {
                description: error.message,
                duration: 8000
            });
        } finally {
            setIsUploading(false);
            setTempImageUrl(null);
        }
    };

    const handleSkip = async () => {
        if (!tempImageUrl) return;
        setIsUploading(true);
        try {
            let blob: Blob;
            if (tempImageUrl.startsWith('data:')) {
                const response = await fetch(tempImageUrl);
                blob = await response.blob();
            } else throw new Error("الصورة غير صالحة");
            const fileName = `${Date.now()}-original.webp`;
            const filePath = `product-images/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('products').upload(filePath, blob, { contentType: 'image/webp', upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
            setCurrentProduct({ ...currentProduct, image: publicUrl });
            if (currentProduct.id) {
                await supabase.from("products").update({ image: publicUrl }).eq("id", currentProduct.id as number);
                fetchProducts();
            }
            setIsCropperOpen(false);
            
            // Invalidate caches to show updated image everywhere
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (currentProduct.id) {
                queryClient.invalidateQueries({ queryKey: ['product', currentProduct.id] });
                setUpdatedSessionIds(prev => [...new Set([...prev, currentProduct.id as number])]);
            }
            
            toast.success("تم رفع الصورة الأصلية");
        } catch (error: any) {
            toast.error("فشل الرفع", {
                description: error.message,
                duration: 8000
            });
        } finally {
            setIsUploading(false);
            setTempImageUrl(null);
        }
    };

    const handleSave = async () => {
        const isNew = !currentProduct.id;
        const cat = categories.find(c => c.id === currentProduct.category_id);
        const { id, created_at, ...updateFields } = currentProduct;

        let finalDescription = (updateFields.description || '').replace('[TAX_EXEMPT]', '').trim();
        if (currentProduct.no_tax) {
            finalDescription = `${finalDescription} [TAX_EXEMPT]`.trim();
        }

        const { no_tax, ...cleanUpdateFields } = updateFields;
        const productData = {
            ...cleanUpdateFields,
            description: finalDescription,
            price: Number(Number(updateFields.price).toFixed(1)),
            category_name: cat ? cat.label : (currentProduct.category_name || '')
        };
        let error;
        if (isNew) {
            const { id: _, ...insertData } = productData as any;
            const { error: insError } = await supabase.from("products").insert([insertData]);
            error = insError;
        } else {
            const { error: updError } = await supabase.from("products").update(productData).eq("id", id as number);
            error = updError;
        }
        if (error) {
            toast.error("فشل الحفظ", {
                description: error.message,
                duration: 8000
            });
        } else {
            toast.success(isNew ? "تمت الإضافة بنجاح" : "تم التحديث بنجاح");
            
            const savedId = currentProduct.id || id;
            if (savedId) {
                setUpdatedSessionIds(prev => [...new Set([...prev, savedId as number])]);
                queryClient.invalidateQueries({ queryKey: ['product', savedId] });
            }
            queryClient.invalidateQueries({ queryKey: ['products'] });

            logAction(isNew ? 'add_product' : 'edit_product', { id: savedId, name: productData.name }, savedId as number);
            setIsEditDialogOpen(false);
            fetchProducts();
        }
    };

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const barcodeMap = new Map<string, number>();
            const categoryMap = new Map<string, number>();
            const dbProductMap = new Map<number, any>();
            try {
                const dataArray = evt.target?.result;
                const wb = XLSX.read(dataArray, { type: 'array' });
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                if (data.length === 0) return toast.error("المحتوى فارغ");

                const fetchAllDbProducts = async () => {
                    let allData: any[] = [];
                    let from = 0;
                    const lmt = 1000;
                    let hasMore = true;

                    while (hasMore) {
                        const { data, error } = await supabase
                            .from('products')
                            .select('id, name, category_id, description, image, stock, price')
                            .range(from, from + lmt - 1);

                        if (error) {
                            console.error("Fetch DB error:", error);
                            break;
                        }
                        if (data && data.length > 0) {
                            allData = [...allData, ...data];
                            if (data.length < lmt) hasMore = false;
                            else from += lmt;
                        } else {
                            hasMore = false;
                        }
                    }
                    return allData;
                };

                const dbProducts = await fetchAllDbProducts();

                dbProducts.forEach(p => {
                    dbProductMap.set(p.id, p);

                    const normName = normalize(p.name);
                    let pureBarcode = "";

                    // استخراج الباركود بشكل ذكي باستخدام Regex
                    if (p.description && p.description.includes('باركود:')) {
                        const match = p.description.match(/باركود:\s*(\d+)/);
                        if (match) pureBarcode = normalizeBarcode(match[1]);
                    }

                    const hasImage = p.image && p.image !== PLACEHOLDER_IMAGE && !p.image.includes('unsplash.com');

                    // إذا وجدنا مكررات، نحفظ دائماً الـ ID الخاص بالنسخة التي لها صورة
                    if (pureBarcode) {
                        const existingId = barcodeMap.get(pureBarcode);
                        if (!existingId || hasImage) {
                            barcodeMap.set(pureBarcode, p.id);
                        }
                    }

                    if (normName) {
                        const existingId = categoryMap.get(normName);
                        if (!existingId || hasImage) {
                            categoryMap.set(normName, p.id);
                        }
                    }
                });

                let successCount = 0;
                let failCount = 0;
                let addedCount = 0;
                let duplicateCount = 0;
                let junkCount = 0;
                let barcodeMatches = 0;
                const CHUNK_SIZE = 50;
                const importedIds = new Set<number>();

                const total = data.length;
                setImportProgress({ current: 0, total });

                const toUpdate: any[] = [];
                const toInsert: any[] = [];
                const toDelete: any[] = [];
                const toZeroStock: any[] = [];
                const toLog: any[] = [];

                const categoryLabels = new Set(categories.map(c => normalize(c.label)));
                const processedInBatch = new Set();

                // دالة مساعدة لتنظيف القيم بشكل أفضل (خاصة الباركود والأسعار)
                const getRowValue = (row: any, key: string | null) => {
                    if (!key) return null;
                    const val = row[key];
                    if (val === null || val === undefined) return null;

                    // تحويل القيم الرقمية الكبيرة (مثل الباركود) لمنع التنسيق العلمي
                    if (typeof val === 'number' && val > 100000) {
                        return val.toLocaleString('fullwide', { useGrouping: false });
                    }
                    return String(val).trim();
                };

                for (let i = 0; i < data.length; i++) {
                    const row = data[i] as any;

                    // Update progress state every 50 items to avoid UI bottleneck
                    if (i % 50 === 0) {
                        setImportProgress({ current: i, total });
                    }

                    const rowKeys = Object.keys(row);

                    const findKey = (keywords: string[]) => {
                        for (const kw of keywords) {
                            const nKw = normalize(kw);
                            const match = rowKeys.find(k => normalize(k) === nKw);
                            if (match) return match;
                        }
                        return null;
                    };

                    const idKey = findKey(['id', 'ID', 'م', 'مسلسل']);
                    const nameKey = findKey(['name_ar', 'name_en', 'الاسم', 'Name', 'المنتج', 'Product']);
                    const priceKey = findKey(['sale_price', 'السعر', 'Price', 'cost', 'سعر', 'sell_price']);
                    const codeKey = findKey(['barcode', 'باركود', 'Barcode', 'كود', 'Code']);
                    const catKey = findKey(['category', 'القسم', 'التصنيف', 'نوع', 'Category']);

                    const totalStockKey = findKey(['total_quantity', 'total_quan', 'الكمية', 'Quantity', 'المخزون', 'الرصيد', 'الجرد']);
                    const branchKeywords = ['صناع السعاده', 'سان ستيفانو'];
                    const foundBranchKeys = branchKeywords.filter(bk => rowKeys.some(rk => normalize(rk) === normalize(bk)));

                    const excelId = getRowValue(row, idKey);
                    const excelName = getRowValue(row, nameKey);
                    const excelCode = getRowValue(row, codeKey);
                    const priceValue = getRowValue(row, priceKey);

                    let stockValue: number | null = null;
                    if (totalStockKey) {
                        const val = parseFloat(String(row[totalStockKey]).replace(/[^0-9.]/g, ''));
                        if (!isNaN(val)) stockValue = Math.floor(val);
                    } else if (foundBranchKeys.length > 0) {
                        let sum = 0;
                        foundBranchKeys.forEach(bk => {
                            const actualKey = rowKeys.find(rk => normalize(rk) === normalize(bk));
                            const val = parseFloat(String(row[actualKey!]).replace(/[^0-9.]/g, ''));
                            if (!isNaN(val)) sum += val;
                        });
                        stockValue = Math.floor(sum);
                    }

                    if (!excelName && !excelCode && !excelId) {
                        junkCount++;
                        continue;
                    }

                    // تجاهل الصفوف التي هي أسماء أقسام أو كلمات إجمالية
                    const junkNamesArr = ['الاجمالي', 'مجموع', 'العدد', 'الصافي', 'الخصم', 'قيمة', 'فاتورة', 'المتبقي', 'صناع السعاده', 'سان ستيفانو', 'الفرع'];
                    if (excelName && (categoryLabels.has(normalize(excelName)) || junkNamesArr.some(j => excelName.includes(j)))) {
                        junkCount++;
                        continue;
                    }
                    if (excelName && excelName.length < 2) {
                        junkCount++;
                        continue;
                    }

                    const normName = excelName ? normalize(excelName) : null;
                    const normCode = excelCode ? normalizeBarcode(excelCode) : null;

                    const uniqueKey = excelId || normCode || normName;
                    if (uniqueKey && processedInBatch.has(uniqueKey)) {
                        duplicateCount++;
                        continue;
                    }
                    if (uniqueKey) processedInBatch.add(uniqueKey);

                    // --- MATCHING LOGIC (The Iron Shield) ---
                    let productId = null;
                    const numericExcelId = excelId ? Number(excelId) : null;

                    if (numericExcelId && dbProductMap.has(numericExcelId)) {
                        productId = numericExcelId;
                    } else if (normCode && barcodeMap.has(normCode)) {
                        productId = barcodeMap.get(normCode);
                        barcodeMatches++;
                    } else if (normName && categoryMap.has(normName)) {
                        productId = categoryMap.get(normName);
                    }

                    const dbProduct = productId ? dbProductMap.get(productId) : null;

                    const excelCat = getRowValue(row, catKey);
                    let excelCatId: string | null = null;
                    if (excelCat) {
                        const normExcelCat = normalize(excelCat).replace(/^ال/, '');
                        const match = categories.find(c => {
                            const nLabel = normalize(c.label).replace(/^ال/, '');
                            return nLabel === normExcelCat;
                        });
                        if (match) excelCatId = match.id;
                    }

                    let guessedCatId: string | null = null;
                    if (!excelCatId && excelName) {
                        const n = normalize(excelName);
                        // Priority guess for Candy (Toybox contains the word 'box' but should be candy)
                        if (n.includes('كاندي') || n.includes('جيلي') || n.includes('تويبوكس') || n.includes('مصاصه') || n.includes('مارشميلو')) {
                            guessedCatId = 'candy';
                        }
                        else if (n.includes('بدونضريبه')) guessedCatId = 'no-tax';
                        else if (n.includes('شوكولاته') || n.includes('نوتيلا') || n.includes('ميلكا') || n.includes('كيندر')) guessedCatId = 'chocolate';
                        else if (n.includes('قهوه')) guessedCatId = 'coffee';
                        else if (n.includes('بسكويت') || n.includes('بسكوت') || n.includes('كوكيز')) guessedCatId = 'cookies';
                        else if (n.includes('عصير') || n.includes('بيبسي') || n.includes('مشروب')) guessedCatId = 'drinks';
                        else if (n.includes('كوزمتك') || n.includes('تجميل')) guessedCatId = 'cosmetics';
                        else if (n.includes('هدايا') || n.includes('بوكس')) guessedCatId = 'gifts';
                    }

                    const finalCatId = excelCatId || guessedCatId;

                    if (productId && dbProduct) {
                        importedIds.add(productId);
                        const updateData: any = { id: productId };
                        let hasChanges = false;

                        // For tax calculation on existing products, use Excel category if provided, otherwise stick to DB category
                        const currentCatId = excelCatId || dbProduct.category_id;
                        const isExempt = (currentCatId === 'no-tax') ||
                            dbProduct.description?.includes('[TAX_EXEMPT]') ||
                            (excelCatId === 'no-tax');

                        // PERSISTENT DRAFT LOGIC: المخبأ السري
                        const isOldDraft = dbProduct?.description?.includes('[DRAFT]');
                        const currentStock = dbProduct?.stock || 0;
                        const currentPrice = dbProduct?.price || 0;
                        const currentDesc = dbProduct?.description || '';

                        // 1. تحديث الرصيد (فقط إذا اختلف)
                        if (stockValue !== null && stockValue !== currentStock) {
                            updateData.stock = stockValue;
                            hasChanges = true;

                            // إذا كان "درافت" وتغير رصيده (زاد عن صفر)، يتم إخراجه فوراً مانيوال ليعود للبيع
                            if (isOldDraft && stockValue > 0) {
                                updateData.description = currentDesc.replace('[DRAFT]', '').trim();
                            }
                        }

                        // 2. تحديث السعر (المنطق المحاسبي الذكي لمنع الضريبة المزدوجة)
                        if (priceValue !== null && user?.username !== 'mostafa') {
                            let excelPrice = parseFloat(String(priceValue).replace(/[^0-9.]/g, ''));
                            if (!isNaN(excelPrice) && excelPrice > 0) {
                                let finalCalculatedPrice = excelPrice;

                                // إذا لم يكن المنتج معفياً من الضريبة، نضيف 14%
                                if (!isExempt) {
                                    finalCalculatedPrice = Number((excelPrice * 1.14).toFixed(1));
                                }

                                // الحماية الكبرى: إذا كان السعر المحسوب مطابقاً للسعر الحالي في الداتابيز، لا نعتبره تغييراً.
                                // هذا يمنع إعادة حساب الضريبة على سعر تم حسابه مسبقاً.
                                if (finalCalculatedPrice !== currentPrice && Math.abs(finalCalculatedPrice - currentPrice) > 0.1) {
                                    updateData.price = finalCalculatedPrice;
                                    hasChanges = true;
                                }
                            }
                        }

                        // 3. تحديث القسم (فقط إذا اختلف وطلبنا ذلك صراحة في الإكسيل)
                        // الحماية: لا يتم نقل المنتج الموجود مسبقاً بناءً على "التخمين التلقائي" (Guessed) لمنع أخطاء مثل Toybox
                        if (excelCatId && excelCatId !== dbProduct?.category_id) {
                            updateData.category_id = excelCatId;
                            const catObj = categories.find(c => c.id === excelCatId);
                            updateData.category_name = catObj ? catObj.label : 'الاسناكس';
                            hasChanges = true;
                        }

                        // 4. أتمتة الدرافت (قاعدة الإخفاء الذكي)
                        const finalStock = updateData.stock !== undefined ? updateData.stock : currentStock;
                        const finalDesc = updateData.description !== undefined ? updateData.description : currentDesc;
                        const hasRealImage = dbProduct?.image &&
                            dbProduct.image !== PLACEHOLDER_IMAGE &&
                            !dbProduct.image.includes('unsplash.com');

                        // إذا أصبح الرصيد 0 وليس له صورة حقيقية وليس مسودة بالفعل، نضعه في المسودة
                        if (finalStock <= 0 && !hasRealImage && !finalDesc.includes('[DRAFT]')) {
                            updateData.description = `${finalDesc} [DRAFT]`.trim();
                            hasChanges = true;
                        }

                        if (hasChanges) {
                            updateData.updated_at = new Date().toISOString();
                            toUpdate.push(updateData);

                            if (updateData.stock !== undefined) {
                                toLog.push({
                                    username: user?.username || 'system',
                                    action: 'excel_sync_stock',
                                    details: {
                                        product_id: productId,
                                        old_stock: currentStock,
                                        new_stock: updateData.stock,
                                        change: updateData.stock - currentStock
                                    }
                                });

                                if (updateData.stock === 0 && currentStock > 0) {
                                    toLog.push({
                                        username: user?.username || 'system',
                                        action: 'product_out_of_stock',
                                        details: {
                                            product_id: productId,
                                            name: dbProduct.name,
                                            reason: 'excel_sync'
                                        }
                                    });
                                }
                            }
                        }
                    } else if (excelName && (excelCode || (priceValue !== null && parseFloat(String(priceValue)) > 0))) {
                        let price = priceValue ? parseFloat(String(priceValue).replace(/[^0-9.]/g, '')) : 0;
                        const newCatId = finalCatId || 'snacks';
                        if (price > 0) {
                            const isExempt = (newCatId === 'no-tax');
                            if (!isExempt) {
                                price = price * 1.14;
                            }

                            const isDraft = (stockValue || 0) <= 0;
                            const catObj = categories.find(c => c.id === newCatId);
                            const finalItemPrice = Number(price.toFixed(1));
                            const finalItemStock = stockValue || 0;

                            toInsert.push({
                                name: excelName.trim(),
                                price: finalItemPrice,
                                stock: finalItemStock,
                                category_id: newCatId,
                                category_name: catObj ? catObj.label : 'الاسناكس',
                                description: excelCode ? (isDraft ? `باركود: ${excelCode} [DRAFT]` : `باركود: ${excelCode}`) : (isDraft ? '[DRAFT]' : ''),
                                image: PLACEHOLDER_IMAGE,
                                is_featured: false,
                                is_new: true
                            });
                        }
                    }
                }

                let firstUpdateError: any = null;
                let firstInsertError: any = null;
                const finalTotal = toUpdate.length + toInsert.length;

                // Track session-specific financial value (Sales/Difference)
                let sessionSalesCount = 0;
                let sessionSalesValue = 0;
                let sessionSalesProductIds: number[] = [];
                let sessionSalesQuantities: Record<number, number> = {};
                
                toUpdate.forEach(item => {
                    const dbProd = dbProductMap.get(item.id);
                    if (item.stock !== undefined) {
                        const stockDiff = dbProd.stock - item.stock;
                        if (stockDiff > 0) {
                            // This is a sale/deduction
                            sessionSalesCount++;
                            sessionSalesProductIds.push(dbProd.id);
                            sessionSalesQuantities[dbProd.id] = stockDiff;
                            // Use the price from the file (or DB if not in file) to calculate value
                            const salePrice = item.price !== undefined ? item.price : dbProd.price;
                            sessionSalesValue += (stockDiff * salePrice);
                        }
                    }
                });

                // --- PHASE 1: PARALLEL UPDATES (Faster) ---
                const UPDATE_BATCH_SIZE = 15; // عدد التحديثات المتزامنة
                for (let i = 0; i < toUpdate.length; i += UPDATE_BATCH_SIZE) {
                    const chunk = toUpdate.slice(i, i + UPDATE_BATCH_SIZE);
                    setImportProgress({ current: i, total: finalTotal });

                    await Promise.all(chunk.map(async (p) => {
                        const { id, ...updateFields } = p;
                        const { error } = await supabase
                            .from('products')
                            .update(updateFields)
                            .eq('id', id);

                        if (!error) {
                            successCount++;
                            importedIds.add(id);
                        } else {
                            failCount++;
                            if (!firstUpdateError) firstUpdateError = error;
                            console.error(`Update failed for ID ${id}:`, error);
                        }
                    }));
                }

                // --- PHASE 2: BATCH INSERTS (Massive Speedup) ---
                const INSERT_BATCH_SIZE = 100;
                for (let i = 0; i < toInsert.length; i += INSERT_BATCH_SIZE) {
                    const chunk = toInsert.slice(i, i + INSERT_BATCH_SIZE);
                    setImportProgress({ current: toUpdate.length + i, total: finalTotal });

                    const { data: insertedRows, error } = await supabase
                        .from('products')
                        .insert(chunk)
                        .select('id');

                    if (!error && insertedRows) {
                        addedCount += insertedRows.length;
                        insertedRows.forEach(row => importedIds.add(row.id));
                    } else {
                        failCount += chunk.length;
                        if (!firstInsertError) firstInsertError = error;
                        console.error("Batch Insert failed:", error);
                    }
                }

                // --- PHASE 3: THE TOTAL PURGE (Master Sync) ---
                let toZeroStockIds: number[] = [];
                let toDeleteIds: number[] = [];
                const isFullSync = confirm("هل تود تصفير مخزون أي صنف غير موجود في ملف الإكسيل؟ (مزامنة كاملة للمتجر)\n\nاختر 'إلغاء' إذا كنت ترفع طلبية جديدة فقط ولا تريد التأثير على باقي الأصناف الموجودة.");

                if (isFullSync) {
                    const untouchedProducts = dbProducts.filter(p => !importedIds.has(p.id));

                    untouchedProducts.forEach(p => {
                        const hasRealImage = p.image &&
                            p.image !== PLACEHOLDER_IMAGE &&
                            !String(p.image).includes('unsplash.com');

                        if (hasRealImage) {
                            toZeroStockIds.push(p.id);
                        } else {
                            toDeleteIds.push(p.id);
                        }
                    });

                    if (toZeroStockIds.length > 0) {
                        for (let i = 0; i < toZeroStockIds.length; i += CHUNK_SIZE) {
                            const batch = toZeroStockIds.slice(i, i + CHUNK_SIZE);
                            await supabase.from('products').update({ stock: 0 }).in('id', batch);
                        }
                    }

                    if (toDeleteIds.length > 0) {
                        for (let i = 0; i < toDeleteIds.length; i += CHUNK_SIZE) {
                            const batch = toDeleteIds.slice(i, i + CHUNK_SIZE);
                            await supabase.from('products').delete().in('id', batch);
                        }
                    }
                }

                setImportProgress(null);

                if (successCount > 0 || addedCount > 0) {
                    toast.success(`تمت المزامنة بنجاح`, {
                        description: `تحديث ${successCount} صنف، إضافة ${addedCount} جديد. تم حذف ${toDeleteIds.length} صنف قديم، وتصفير مخزون ${toZeroStockIds.length} (مخفيين للحفاظ على صورهم). تم تجاهل ${junkCount} صفوف (إجماليات) و ${duplicateCount} مكررات.`,
                        duration: 15000
                    });

                    // Batch log the individual updates
                    if (toLog.length > 0) {
                        const CHUNK = 50;
                        for (let i = 0; i < toLog.length; i += CHUNK) {
                            await supabase.from('admin_logs').insert(toLog.slice(i, i + CHUNK));
                        }
                    }

                    logAction('excel_sync_summary', {
                        updated: successCount,
                        added: addedCount,
                        deleted: toDeleteIds.length,
                        zeroed: toZeroStockIds.length,
                        sales_count: sessionSalesCount,
                        sales_value: sessionSalesValue,
                        sales_product_ids: sessionSalesProductIds,
                        sales_quantities: sessionSalesQuantities
                    });

                    // Update local stats instantly
                    setStats(prev => ({
                        ...prev,
                        dailyChanges: sessionSalesCount,
                        dailyValue: sessionSalesValue,
                        salesProductIds: sessionSalesProductIds,
                        salesQuantities: sessionSalesQuantities
                    }));
                }

                if (failCount > 0) {
                    const finalError = firstUpdateError || firstInsertError;
                    toast.error(`تنبيه: فشل مزامنة ${failCount} صنف`, {
                        description: `السبب: ${finalError?.message || "تعارض في البيانات"}. تم إخفاء هذه الأصناف لضمان نظافة المتجر.`,
                        duration: 15000
                    });
                }
                fetchProducts();
            } catch (err: any) {
                console.error("Excel Import Error:", err);
                toast.error("خطأ في قراءة ملف الإكسيل أو تحديث البيانات", {
                    description: `السبب: ${err.message || 'خطأ غير معروف'} `,
                    duration: 10000
                });
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };



    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-saada-brown flex items-center justify-center p-4 font-tajawal rtl" dir="rtl">
                <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-saada-red text-white p-8 text-center">
                        <div className="h-24 w-24 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 group-hover:rotate-0 transition-transform overflow-hidden shadow-xl">
                            <img src="/logo.png" className="h-full w-full object-cover" alt="Logo" />
                        </div>
                        <CardTitle className="text-2xl font-black italic">دخول لوحة التحكم</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-bold">اسم المستخدم</Label>
                                <Input
                                    className="h-12 rounded-xl"
                                    value={authData.username}
                                    onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-bold">كلمة المرور</Label>
                                <Input
                                    type="password"
                                    className="h-12 rounded-xl"
                                    value={authData.password}
                                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-14 bg-saada-brown hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl transition-all"
                            onClick={async () => {
                                const result = await login(authData.username, authData.password);
                                if (!result.success) {
                                    toast.error("فشل تسجيل الدخول", {
                                        description: result.error || "تأكد من بيانات الدخول"
                                    });
                                } else {
                                    toast.success("مرحباً بك مجدداً");
                                }
                            }}
                        >
                            تسجيل الدخول
                        </Button>


                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleCleanupDuplicates = async () => {
        if (!confirm("هل أنت متأكد من حذف المنتجات المكررة؟ سيتم استخدام نظام 'المطابقة الذكية' الذي يكتشف المكررات حتى لو اختلف ترتيب الكلمات أو أضيفت أوزان وأحجام مختلفة.")) return;

        const toastId = toast.loading("جاري فحص ودمج المكررات ذكياً...");
        try {
            const fetchAllDbProducts = async () => {
                let allData: any[] = [];
                let from = 0;
                const lmt = 1000;
                let hasMore = true;
                while (hasMore) {
                    const { data, error } = await supabase.from('products').select('*').range(from, from + lmt - 1);
                    if (error) break;
                    if (data && data.length > 0) {
                        allData = [...allData, ...data];
                        if (data.length < lmt) hasMore = false;
                        else from += lmt;
                    } else hasMore = false;
                }
                return allData;
            };

            const allProducts = await fetchAllDbProducts();

            // دالة مطورة جداً للمطابقة الذكية
            const getSmartKey = (p: any) => {
                // 1. إذا كان فيه باركود، نعتبره المفتاح الأساسي
                const barcodeMatch = p.description?.match(/باركود\s*:\s*(\d+)/);
                if (barcodeMatch) return `barcode_${barcodeMatch[1]} `;

                // 2. إذا مفيش باركود، نعتمد على الاسم بشروط قاسية
                if (!p.name) return '';

                return String(p.name).toLowerCase()
                    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ىيی]/g, 'ي').replace(/[ؤئ]/g, 'ي').replace(/[كک]/g, 'ك')
                    .replace(/[\u064B-\u0652\u0640]/g, '')
                    .replace(/[0-9\.]+/g, '') // إزالة الأرقام
                    .replace(/(جم|جرام|كيلو|ك|مل|ق|ع|قطعة|علبة|جرام)/g, ' ') // إزالة الوحدات
                    .replace(/[^a-z\u0621-\u064A]/g, ' ') // إزالة الرموز
                    .split(' ')
                    .filter(word => word.length > 1)
                    .sort()
                    .join('');
            };

            const productGroups = new Map<string, any[]>();
            allProducts.forEach(p => {
                const key = getSmartKey(p);
                if (!key) return;
                if (!productGroups.has(key)) productGroups.set(key, []);
                productGroups.get(key)?.push(p);
            });

            const idsToDelete: number[] = [];
            const updatesToPerform: { id: number, stock: number }[] = [];
            let mergedStockCount = 0;

            productGroups.forEach((group) => {
                if (group.length <= 1) return;

                const maxStock = Math.max(...group.map(p => p.stock || 0));

                group.sort((a, b) => {
                    const aHasImage = a.image && !a.image.includes('unsplash');
                    const bHasImage = b.image && !b.image.includes('unsplash');
                    if (aHasImage && !bHasImage) return -1;
                    if (!aHasImage && bHasImage) return 1;
                    if (a.stock > b.stock) return -1;
                    if (a.stock < b.stock) return 1;
                    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                });

                const toKeep = group[0];
                if ((toKeep.stock || 0) < maxStock) {
                    updatesToPerform.push({ id: toKeep.id, stock: maxStock });
                    mergedStockCount++;
                }

                for (let i = 1; i < group.length; i++) {
                    idsToDelete.push(group[i].id);
                }
            });

            if (idsToDelete.length === 0 && updatesToPerform.length === 0) {
                toast.dismiss(toastId);
                return toast.info("لم يتم العثور على مكررات إضافية بالنظام الذكي");
            }

            for (const upd of updatesToPerform) {
                await supabase.from('products').update({ stock: upd.stock }).eq('id', upd.id);
            }

            const CHUNK = 50;
            for (let i = 0; i < idsToDelete.length; i += CHUNK) {
                const chunk = idsToDelete.slice(i, i + CHUNK);
                await supabase.from('products').delete().in('id', chunk);
            }

            let msg = `تم دمج وحذف ${idsToDelete.length} منتج مكرر ذكياً`;
            if (mergedStockCount > 0) msg += ` ودمج أرصدة ${mergedStockCount} منتج`;

            toast.success(msg, { id: toastId, duration: 5000 });
            fetchProducts();
        } catch (err) {
            console.error(err);
            toast.error("فشل التنظيف الذكي", { id: toastId });
        }
    };

    const isEditor = user?.role === 'editor';

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-tajawal rtl" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Import Progress Overlay */}
                {importProgress && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                        <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <CardContent className="p-8 text-center space-y-6">
                                <div className="h-20 w-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
                                    <RefreshCw className="h-10 w-10 animate-spin" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-saada-brown">جاري معالجة البيانات...</h3>
                                    <p className="text-gray-500">من فضلك انتظر حتى يتم تحديث كافة المنتجات</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-300"
                                            style={{ width: `${(importProgress.current / importProgress.total) * 100}% ` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-gray-400">
                                        <span>{importProgress.current} من {importProgress.total}</span>
                                        <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-saada-brown flex items-center gap-2">
                            <BarChart className="h-8 w-8 text-saada-red" />
                            لوحة تحكم صناع السعادة ({username === 'fikry' ? 'مرحبا هشام' : (isAdmin ? 'المدير' : (username.includes('mostafa') ? 'الموظف مصطفى' : (username.includes('hesham') ? 'الموظف هشام' : `الموظف ${user?.username || ''}`)))})
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isRestrictedStaff ? 'تحديث المخزون، الصور، والأسماء' : (isAdmin ? 'إدارة كاملة للمتجر والمنتجات' : 'صلاحية محدودة لتعديل الصور والأسماء')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => document.getElementById('excel-import')?.click()}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 px-6 text-lg rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
                                    >
                                        <FileSpreadsheet className="h-5 w-5" />
                                        رفع طلبية (المخزون والسعر)
                                    </Button>
                                    <input
                                        id="excel-import"
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        className="hidden"
                                        onChange={handleExcelImport}
                                    />
                                    <Button
                                        onClick={handleCleanupDuplicates}
                                        variant="outline"
                                        className="h-10 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold flex gap-2 transition-all active:scale-95"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        حل التعارضات (للمدير)
                                    </Button>
                                </div>
                            </>
                        )}
                        {isSpecial && (
                            <Button onClick={handleAddNew} className="bg-saada-red hover:bg-red-700 text-white gap-2 h-12 px-6 text-lg rounded-xl shadow-lg shadow-red-200 transition-all">
                                <Plus className="h-5 w-5" />
                                إضافة منتج جديد
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="h-12 border-saada-brown text-saada-brown hover:bg-saada-brown hover:text-white rounded-xl font-bold"
                        >
                            تسجيل الخروج
                        </Button>
                    </div>
                </div>

                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "products" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                    >
                        إدارة المنتجات
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "orders" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                        >
                            إدارة الطلبات
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "analytics" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                        >
                            التقارير والإحصائيات
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab("coupons")}
                            className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "coupons" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                        >
                            أكواد الخصم
                        </button>
                    )}
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab("logs")}
                            className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "logs" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                        >
                            سجل التعديلات
                        </button>
                    )}
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab("subscribers")}
                            className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "subscribers" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                        >
                            قائمة المشتركين
                        </button>
                    )}
                </div>

                {activeTab === "products" ? (
                    <>
                        {/* Stats Grid - Hidden for limited Editors */}
                        {isAdmin && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 cursor-pointer">
                                <Card
                                    onClick={() => { setActiveFilter("all"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "all" ? "ring-2 ring-blue-500 border-r-blue-600" : "border-r-blue-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">إجمالي المنتجات</p>
                                                <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.totalProducts}</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                <Package className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setActiveFilter("published"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "published" ? "ring-2 ring-emerald-500 border-r-emerald-600" : "border-r-emerald-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">منشورة للعملاء</p>
                                                <h3 className="text-2xl font-bold mt-1 text-emerald-600">{stats.published}</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setActiveFilter("daily"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "daily" ? "ring-2 ring-indigo-500 border-r-indigo-600" : "border-r-indigo-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">أصناف مبيعات الجرد</p>
                                                <h3 className="text-2xl font-bold mt-1 text-indigo-600">{stats.dailyChanges}</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                <RefreshCw className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setActiveFilter("daily"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "daily" ? "ring-2 ring-violet-500 border-r-violet-600" : "border-r-violet-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">قيمة مبيعات الجرد</p>
                                                <h3 className="text-2xl font-bold mt-1 text-violet-600">{Number(stats.dailyValue).toLocaleString()} ج.م</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setActiveFilter("zero"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "zero" ? "ring-2 ring-red-500 border-r-red-600" : "border-r-red-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">صنف منتهي (له صورة)</p>
                                                <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.zeroStock}</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                <Trash2 className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setActiveFilter("draft"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "draft" ? "ring-2 ring-purple-500 border-r-purple-600" : "border-r-purple-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">مسودة (بدون صورة)</p>
                                                <h3 className="text-2xl font-bold mt-1 text-purple-600">{stats.needsPhoto}</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setActiveFilter("no-tax"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "no-tax" ? "ring-2 ring-orange-500 border-r-orange-600" : "border-r-orange-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">بدون ضريبة</p>
                                                <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.noTax}</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                                <Percent className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setActiveFilter("trash"); setSelectedCategoryLabel(null); }}
                                    className={`border-none shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all border-r-4 ${activeFilter === "trash" ? "ring-2 ring-gray-600 border-r-gray-800" : "border-r-gray-500 opacity-80"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">قسم الدرافت (مخفي)</p>
                                                <h3 className="text-2xl font-bold mt-1 text-gray-800">{stats.trash || 0}</h3>
                                            </div>
                                            <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
                                                <Trash2 className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Top Priority Section for Products needing photos but have stock */}
                        {isSpecial && stats.readyToShot > 0 && (
                            <div className="mt-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                <Card
                                    onClick={() => setActiveFilter("ready")}
                                    className={`border-none shadow-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${activeFilter === "ready" ? "ring-2 ring-saada-red" : "bg-gradient-to-r from-emerald-600 to-teal-700 text-white"} `}
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                <Camera className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-black ${activeFilter === "ready" ? "text-saada-brown" : "text-white"}`}>أصناف متوفرة (ليها رصيد) وبانتظار التصوير</h3>
                                                <p className={`${activeFilter === "ready" ? "text-gray-500" : "text-white/80"} font-medium mt-1`}>يوجد {stats.readyToShot} صنف متاح للبيع حالياً ولكنهم مخفيين عن العملاء لعدم وجود صور.</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-4xl font-black ${activeFilter === "ready" ? "text-saada-red" : "text-white"}`}>{stats.readyToShot}</span>
                                                {activeFilter === "ready" && (
                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRestoreLostImages();
                                                            }}
                                                            className="h-8 px-3 rounded-lg bg-white text-emerald-600 hover:bg-emerald-50 flex gap-2 font-bold shadow-lg"
                                                        >
                                                            <SparklesIcon className="h-4 w-4" />
                                                            استعادة الصور تلقائياً
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAllReadyToShot();
                                                            }}
                                                            className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 flex gap-2 font-bold shadow-lg"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            حذف الكل نهائياً
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${activeFilter === "ready" ? "text-gray-400" : "text-white/60"}`}>Items to shoot</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Conflict Monitoring Section */}
                        {isSpecial && conflictProducts.length > 0 && (
                            <div className="mt-4 animate-in fade-in slide-in-from-left-4 duration-700">
                                <Card
                                    onClick={() => setIsConflictResolverOpen(true)}
                                    className="border-none shadow-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.01] bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                <AlertCircle className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white">تحذير: يوجد أصناف مكررة (نفس الباركود أو الاسم)</h3>
                                                <p className="text-white/80 font-medium mt-1">وجدنا {conflictProducts.length} مجموعة من المنتجات المكررة التي تحتاج للدمج لضمان دقة الرصيد.</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl font-black text-white">{conflictProducts.length}</span>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-10 bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 rounded-xl shadow-lg"
                                                >
                                                    حل التعارضات الآن
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}


                        {/* Sub-Filters for Categories */}
                        {activeFilter === "categories" && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-4 duration-500 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                                <Button
                                    variant={selectedCategoryLabel === null ? "default" : "outline"}
                                    onClick={() => setSelectedCategoryLabel(null)}
                                    className={`rounded - full px - 8 h - 10 font - bold transition - all ${selectedCategoryLabel === null ? 'bg-saada-brown text-white' : ''} `}
                                >
                                    كل الأقسام
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedCategoryLabel === cat.label ? "default" : "outline"}
                                        onClick={() => setSelectedCategoryLabel(cat.label)}
                                        className={`rounded - full px - 8 h - 10 font - bold transition - all ${selectedCategoryLabel === cat.label ? 'bg-saada-brown text-white' : ''} `}
                                >
                                        {cat.label}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Product List Card */}
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-gray-100 bg-white p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <CardTitle className="text-xl font-bold text-saada-brown flex items-center gap-3">
                                        قائمة المنتجات
                                        {selectedProductIds.length > 0 && (
                                            <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                                                    تم اختيار ({selectedProductIds.length})
                                                </span>
                                                <Button size="sm" variant="destructive" className="h-7 px-3 text-[10px]" onClick={canDelete ? handleBulkDelete : undefined} disabled={!canDelete}>
                                                    حذف الجماعي
                                                </Button>
                                                {activeFilter !== "trash" ? (
                                                    <Button size="sm" variant="outline" className="h-7 px-3 text-[10px] border-gray-300" onClick={() => handleBulkDraft(true)}>
                                                        نقل للدرافت
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="outline" className="h-7 px-3 text-[10px] border-gray-300" onClick={() => handleBulkDraft(false)}>
                                                        استعادة للنشط
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        {updatedSessionIds.length > 0 && selectedProductIds.length === 0 && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full animate-pulse border border-emerald-200">
                                                تم تحديث ({updatedSessionIds.length}) منتجات الآن
                                            </span>
                                        )}
                                    </CardTitle>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                                        {isAdmin && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleExportData}
                                                className="h-11 px-4 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl flex items-center gap-2"
                                            >
                                                <FileSpreadsheet className="h-5 w-5" />
                                                تصدير للأكسيل
                                            </Button>
                                        )}
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="ابحث بالاسم، القسم، أو الباركود..."
                                                className="pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow>
                                                <TableHead className="w-10 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded"
                                                        checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedProductIds(filteredProducts.map(p => p.id));
                                                            else setSelectedProductIds([]);
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">المنتج</TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">الباركود</TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">القسم</TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">السعر</TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">المخزون</TableHead>
                                                {activeFilter === "daily" && (
                                                    <TableHead className="text-right py-4 font-bold text-saada-red bg-red-50/50">تم بيعه (الفرق)</TableHead>
                                                )}
                                                {isSpecial && (
                                                    <TableHead className="text-right py-4 font-bold text-saada-brown">الصلاحية</TableHead>
                                                )}
                                                <TableHead className="text-center py-4 font-bold text-saada-brown">الإجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-20 text-gray-500">جاري التحميل...</TableCell>
                                                </TableRow>
                                            ) : filteredProducts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-20 text-gray-500">لا توجد منتجات مطابقة لـ "{searchQuery}"</TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredProducts.map((p) => (
                                                    <TableRow
                                                        key={p.id}
                                                        className={`group hover: bg - gray - 50 / 80 transition - colors border - b border - gray - 100 ${updatedSessionIds.includes(p.id) ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : ''} ${selectedProductIds.includes(p.id) ? 'bg-blue-50/50' : ''} `}
                                                    >
                                                        <TableCell className="w-10 text-center">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded"
                                                                checked={selectedProductIds.includes(p.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                                                    else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                                                                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                                                    {updatedSessionIds.includes(p.id) && (
                                                                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                                                            <Check className="h-4 w-4 text-emerald-600 drop-shadow-sm" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-900 group-hover:text-saada-red transition-colors flex items-center gap-2">
                                                                        {p.name}
                                                                        {updatedSessionIds.includes(p.id) && (
                                                                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">مُلحق</span>
                                                                        )}
                                                                        {p.created_at && (new Date().getTime() - new Date(p.created_at).getTime() < 48 * 60 * 60 * 1000) && (
                                                                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">جديد</span>
                                                                        )}
                                                                        {p.description?.includes('[DRAFT]') && (
                                                                            <span className="text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded font-bold">درافت (مخفي)</span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                                {p.description?.includes('باركود:') ? p.description.split('باركود:')[1].trim() : '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                                {p.category_name}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-4 font-bold text-gray-900">{Number(p.price).toFixed(Number(p.price) % 1 === 0 ? 0 : 1)} ج.م</TableCell>
                                                        <TableCell className="py-4">
                                                            <span className={`font-bold ${(p.stock ?? 0) < 10 ? 'text-orange-600' : 'text-gray-600'}`}>
                                                                {p.stock ?? "-"}
                                                            </span>
                                                        </TableCell>
                                                        {activeFilter === "daily" && (
                                                            <TableCell className="py-4 bg-red-50/30">
                                                                <span className="font-black text-saada-red bg-white px-2 py-1 rounded-md border border-red-100 shadow-sm">
                                                                    -{stats.salesQuantities[p.id] || 0}
                                                                </span>
                                                            </TableCell>
                                                        )}
                                                        {isSpecial && (
                                                            <TableCell className="py-4">
                                                                <span className={`text-[10px] font-bold ${p.expiry_date ? (new Date(p.expiry_date).getTime() < new Date().getTime() ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50') : 'text-gray-400'} px-2 py-1 rounded-lg`}>
                                                                    {p.expiry_date || "-"}
                                                                </span>
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => fetchProductLifecycle(p)}
                                                                    title="تاريخ المنتج"
                                                                    className="h-9 w-9 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                                                                >
                                                                    <Clock className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEdit(p)}
                                                                    className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                {(isAdmin || isSuperAdmin) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleDelete(p.id)}
                                                                        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : activeTab === "orders" ? (
                    <Card className="border-none shadow-xl bg-white overflow-hidden">
                        <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold text-saada-brown">قائمة الطلبات (الواتساب والموقع)</CardTitle>
                            <Button onClick={fetchOrders} variant="ghost" size="icon">
                                <RefreshCw className={`h - 4 w - 4 ${ordersLoading ? 'animate-spin' : ''} `} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">رقم الطلب</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">العميل</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">التاريخ</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">الإجمالي</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">الحالة</TableHead>
                                            <TableHead className="text-center py-4 font-bold text-saada-brown">الإجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ordersLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-20 text-gray-500">جاري تحميل الطلبات...</TableCell>
                                            </TableRow>
                                        ) : orders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-20 text-gray-500">لا توجد طلبات مسجلة حالياً</TableCell>
                                            </TableRow>
                                        ) : (
                                            orders.map((order) => (
                                                <TableRow key={order.id} className="group hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                                                    <TableCell className="py-4 font-bold">#{order.id}</TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-saada-brown">{order.customer_name}</span>
                                                            <span className="text-xs text-gray-500" dir="ltr">{order.customer_phone}</span>
                                                            {order.coupon_code && (
                                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-1 w-fit font-bold">
                                                                    🎟️ {order.coupon_code}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                                    </TableCell>
                                                    <TableCell className="py-4 font-black text-saada-red">{Number(order.total_price).toFixed(Number(order.total_price) % 1 === 0 ? 0 : 1)} ج.م</TableCell>
                                                    <TableCell className="py-4">
                                                        <span className={`px - 3 py - 1 rounded - full text - xs font - bold ${order.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-saada-red/10 text-saada-red'
                                                            } `}>
                                                            {order.status === 'received' ? `تم الاستلام(${order.processed_by || 'سيستم'})` : 'قيد الانتظار'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(`/ order - preview / ${order.id} `, '_blank')}
                                                                className="h-9 gap-1 border-saada-brown text-saada-brown hover:bg-saada-brown hover:text-white"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                معاينة
                                                            </Button>
                                                            {order.status !== 'received' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleMarkAsReceived(order.id)}
                                                                    className="h-9 gap-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                    تم الاستلام
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : activeTab === "coupons" ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-saada-brown">إدارة أكواد الخصم</h2>
                                <p className="text-gray-500 text-sm">أنشئ أكواد خصم لزبائنك لزيادة المبيعات</p>
                            </div>
                            <Button
                                onClick={() => setIsCouponDialogOpen(true)}
                                className="bg-saada-brown text-white h-12 px-6 rounded-xl font-bold flex gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                كود خصم جديد
                            </Button>
                        </div>

                        {couponsLoading ? (
                            <div className="text-center py-20">
                                <RefreshCw className="h-10 w-10 animate-spin text-saada-red mx-auto mb-4" />
                                <p className="font-bold text-gray-400">جاري تحميل الأكواد...</p>
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <Ticket className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">لا توجد أكواد خصم حالياً</h3>
                                <p className="text-gray-500 mt-2">ابدأ بإضافة أول كود للترحيب بزبائنك!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coupons.map((coupon) => (
                                    <Card key={coupon.id} className="border-none shadow-md overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 p-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteCoupon(coupon.id)}
                                                className="text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <div className="h-16 w-16 bg-saada-red/10 text-saada-red rounded-2xl flex items-center justify-center">
                                                    <Ticket className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-saada-brown tracking-widest">{coupon.code}</h3>
                                                    <div className="flex items-center justify-center gap-2 mt-2">
                                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% خصم` : `${coupon.discount_value} ج.م خصم`}
                                                        </span>
                                                        <span className="bg-saada-brown/5 text-saada-brown/60 px-3 py-1 rounded-full text-[10px] font-bold">
                                                            تم الاستخدام: {coupon.used_count || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                            <DialogContent className="max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
                                <DialogHeader className="p-8 bg-saada-brown text-white">
                                    <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                        <Ticket className="h-7 w-7" />
                                        إضافة كود خصم جديد
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-saada-brown">كود الخصم (مثلاً SAADA20)</Label>
                                        <Input
                                            placeholder="اكتب الكود هنا..."
                                            className="h-12 rounded-xl text-center uppercase font-black text-xl tracking-widest"
                                            value={newCoupon.code}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-saada-brown">نوع الخصم</Label>
                                            <Select
                                                value={newCoupon.discount_type}
                                                onValueChange={(val) => setNewCoupon({ ...newCoupon, discount_type: val })}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                                                    <SelectItem value="fixed">مبلغ ثابت (ج.م)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-saada-brown">قيمة الخصم</Label>
                                            <Input
                                                type="number"
                                                className="h-12 rounded-xl text-center font-bold"
                                                value={newCoupon.discount_value}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAddCoupon}
                                        className="w-full h-14 bg-saada-red hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl transition-all"
                                    >
                                        حفظ كود الخصم
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : activeTab === "analytics" ? (
                    <AnalyticsDashboard />
                ) : activeTab === "subscribers" ? (
                    <Card className="border-none shadow-xl bg-white overflow-hidden">
                        <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-xl font-bold text-saada-brown">قائمة المشتركين في النشرة البريدية</CardTitle>
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{subscribers.length} مشترك</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        const ws = XLSX.utils.json_to_sheet(subscribers.map(s => ({ "الإيميل": s.email, "تاريخ الاشتراك": new Date(s.created_at).toLocaleString('ar-EG') })));
                                        const wb = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(wb, ws, "المشتركين");
                                        XLSX.writeFile(wb, `subscribers_${new Date().getTime()}.xlsx`);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-10 rounded-xl"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    تصدير للقائمة
                                </Button>
                                <Button onClick={fetchSubscribers} variant="ghost" size="icon">
                                    <RefreshCw className={`h-4 w-4 ${subscribersLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">الإيميل</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">تاريخ الاشتراك</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscribersLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-20 text-gray-500">جاري تحميل المشتركين...</TableCell>
                                            </TableRow>
                                        ) : subscribers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-20 text-gray-500">لا يوجد مشتركين حالياً</TableCell>
                                            </TableRow>
                                        ) : (
                                            subscribers.map((s) => (
                                                <TableRow key={s.id} className="hover:bg-gray-50/80 border-b border-gray-100">
                                                    <TableCell className="py-4 font-bold text-saada-brown">{s.email}</TableCell>
                                                    <TableCell className="py-4 text-xs text-gray-500 font-medium font-outfit">
                                                        {new Date(s.created_at).toLocaleString('ar-EG')}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-none shadow-xl bg-white overflow-hidden">
                        <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold text-saada-brown">سجل تعديلات النظام (Audit Log)</CardTitle>
                            <Button onClick={fetchLogs} variant="ghost" size="icon">
                                <RefreshCw className={`h-4 w-4 ${logsLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">التاريخ والوقت</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">المسؤول</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">الإجراء</TableHead>
                                            <TableHead className="text-right py-4 font-bold text-saada-brown">التفاصيل</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logsLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-20 text-gray-500">جاري تحميل السجلات...</TableCell>
                                            </TableRow>
                                        ) : logs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-20 text-gray-500">لا توجد سجلات تعديل حالياً</TableCell>
                                            </TableRow>
                                        ) : (
                                            logs.map((log) => (
                                                <TableRow key={log.id} className="hover:bg-gray-50/80 border-b border-gray-100">
                                                    <TableCell className="py-4 text-xs">
                                                        {new Date(log.created_at).toLocaleString('ar-EG')}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${log.username === 'elhanafy' ? 'bg-saada-red text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                            {log.username}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4 font-bold text-saada-brown text-sm">
                                                        {log.action === 'add_product' ? '➕ إضافة صنف' :
                                                            log.action === 'edit_product' ? '📝 تعديل صنف' :
                                                                log.action === 'delete_product' ? '🗑️ حذف صنف' :
                                                                    log.action === 'bulk_delete_products' ? '🧹 حذف جماعي' :
                                                                        log.action === 'bulk_move_to_draft' ? '👁️ إخفاء (درافت)' :
                                                                            log.action === 'bulk_restore_from_draft' ? '♻️ استعادة' :
                                                                                log.action === 'excel_sync' ? '📊 مزامنة Excel' :
                                                                                    log.action === 'cleanup_duplicates' ? '🧼 تنظيف مكررات' : log.action}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-xs text-gray-500 max-w-xs truncate">
                                                        {JSON.stringify(log.details)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Edit/Add Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden font-tajawal rtl max-h-[90vh] flex flex-col" dir="rtl">
                    <DialogHeader className="p-6 bg-saada-brown text-white">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {currentProduct.id ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            {currentProduct.id ? "تعديل منتج" : "إضافة منتج جديد"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-grow">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">اسم المنتج</Label>
                                <Input
                                    id="name"
                                    value={currentProduct.name}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">السعر (ج.م)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        disabled={!canEditPrice}
                                        value={currentProduct.price}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">المخزون</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={currentProduct.stock}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Expiry Date Field - Special Users only */}
                            {isSpecial && (
                                <div className="space-y-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <Label htmlFor="expiry" className="text-blue-700 font-bold flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        تاريخ الصلاحية (اختياري)
                                    </Label>
                                    <Input
                                        id="expiry"
                                        type="date"
                                        value={currentProduct.expiry_date || ""}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, expiry_date: e.target.value })}
                                        className="h-11 rounded-xl bg-white"
                                    />
                                    <p className="text-[10px] text-blue-600 font-medium">اترك فارغاً للأصناف التي لا تملك تاريخ انتهاء محدد</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="category">القسم</Label>
                                <Select
                                    value={currentProduct.category_id}
                                    onValueChange={(val) => setCurrentProduct({ ...currentProduct, category_id: val })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="اختر القسم" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div
                                className={`p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer select-none flex items-center justify-between group ${currentProduct.no_tax ? "bg-orange-50/50 border-orange-400/30 shadow-[0_8px_20px_rgba(249,115,22,0.08)]" : "bg-gray-50/50 border-gray-100 hover:border-gray-200"}`}
                                onClick={() => setCurrentProduct({ ...currentProduct, no_tax: !currentProduct.no_tax })}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${currentProduct.no_tax ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-gray-200 text-gray-400 group-hover:bg-gray-300 group-hover:text-gray-600"}`}>
                                        <Percent className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className={`text-base font-black transition-colors ${currentProduct.no_tax ? "text-orange-900" : "text-gray-900"}`}>صنف بدون ضريبة</h4>
                                        <p className={`text-[11px] font-bold transition-colors ${currentProduct.no_tax ? "text-orange-600/80" : "text-gray-400"}`}>سيتم استثناء هذا الصنف من زيادة الـ 14%</p>
                                    </div>
                                </div>
                                <div className="scale-110">
                                    <Switch
                                        id="no-tax-switch"
                                        checked={currentProduct.no_tax}
                                        onCheckedChange={(val) => setCurrentProduct({ ...currentProduct, no_tax: val })}
                                        className="data-[state=checked]:bg-orange-600 shadow-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            <div
                                className={`p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer select-none flex items-center justify-between group ${currentProduct.description?.includes('[DRAFT]') ? "bg-gray-200 border-gray-400 shadow-inner" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}
                                onClick={() => {
                                    const isDraft = currentProduct.description?.includes('[DRAFT]');
                                    let newDesc = (currentProduct.description || '').replace('[DRAFT]', '').trim();
                                    if (!isDraft) newDesc = `${newDesc} [DRAFT]`.trim();
                                    setCurrentProduct({ ...currentProduct, description: newDesc });
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${currentProduct.description?.includes('[DRAFT]') ? "bg-gray-800 text-white shadow-lg" : "bg-gray-200 text-gray-400 group-hover:bg-gray-600 group-hover:text-white"}`}>
                                        <Trash2 className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className={`text-base font-black transition-colors ${currentProduct.description?.includes('[DRAFT]') ? "text-gray-900" : "text-gray-900"}`}>وضع الدرافت (إخفاء)</h4>
                                        <p className={`text-[11px] font-bold transition-colors ${currentProduct.description?.includes('[DRAFT]') ? "text-red-600" : "text-gray-400"}`}>
                                            {currentProduct.description?.includes('[DRAFT]') ? "هذا الصنف الآن في قسم الدرافت فقط وغير ظاهر للعملاء" : "إرسال هذا الصنف لقسم الدرافت لإخفائه مؤقتاً"}
                                        </p>
                                    </div>
                                </div>
                                <div className="scale-110">
                                    <Switch
                                        checked={currentProduct.description?.includes('[DRAFT]')}
                                        onCheckedChange={(val) => {
                                            let newDesc = (currentProduct.description || '').replace('[DRAFT]', '').trim();
                                            if (val) newDesc = `${newDesc} [DRAFT]`.trim();
                                            setCurrentProduct({ ...currentProduct, description: newDesc });
                                        }}
                                        className="data-[state=checked]:bg-gray-800 shadow-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image">الصورة</Label>
                                <div className="flex flex-col gap-3">
                                    <Input
                                        id="image"
                                        value={currentProduct.image}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                                        className="h-11 rounded-xl"
                                        placeholder="رابط الصورة المباشر"
                                    />
                                    <Button
                                        type="button"
                                        disabled={isUploading}
                                        onClick={() => document.getElementById('camera-upload')?.click()}
                                        className="w-full bg-saada-brown hover:bg-black text-white h-12 rounded-xl flex items-center justify-center gap-2 group transition-all"
                                    >
                                        <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        <span>تعديل الصورة (من الجهاز أو الكاميرا)</span>
                                    </Button>
                                    <input
                                        id="camera-upload"
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            <div className={`aspect-video w-full bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group ${isUploading ? 'animate-pulse' : ''}`}>
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2 text-saada-brown">
                                        <Upload className="h-8 w-8 animate-bounce" />
                                        <p className="text-xs font-bold">جاري الرفع...</p>
                                    </div>
                                ) : currentProduct.image ? (
                                    <img src={currentProduct.image} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-12 w-12 text-gray-300" />
                                )}
                                {!isUploading && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <p className="text-white text-sm font-medium">معاينة الصورة</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6 py-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        disabled={!isAdmin}
                                        className="h-4 w-4 rounded text-saada-red"
                                        checked={currentProduct.is_featured}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, is_featured: e.target.checked })}
                                    />
                                    <Label htmlFor="is_featured" className="cursor-pointer">مميز</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_new"
                                        disabled={!isAdmin}
                                        className="h-4 w-4 rounded text-saada-red"
                                        checked={currentProduct.is_new}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, is_new: e.target.checked })}
                                    />
                                    <Label htmlFor="is_new" className="cursor-pointer">جديد</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-gray-50 flex gap-3 sm:justify-end">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-11 px-6 rounded-xl border-gray-300">
                            <X className="h-4 w-4 ml-2" />
                            إلغاء
                        </Button>
                        {isSpecial && currentProduct.id && (
                            <Button
                                type="button"
                                onClick={() => {
                                    const { id, created_at, ...newData } = currentProduct;
                                    setCurrentProduct({ ...newData, stock: 0, expiry_date: "" });
                                    toast.info("تم البدء في إضافة صلاحية جديدة لنفس المنتج. أدخل الرصيد وتاريخ الصلاحية ثم اضغط حفظ.");
                                }}
                                variant="outline"
                                className="h-11 px-6 rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                <Plus className="h-4 w-4 ml-2" />
                                إضافة صلاحية/باتش جديد
                            </Button>
                        )}
                        <Button 
                            onClick={handleSave} 
                            disabled={isUploading}
                            className={`h-11 px-8 rounded-xl bg-saada-brown hover:bg-saada-brown/90 text-white shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Check className="h-4 w-4 ml-2" />
                            {isUploading ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Conflict Resolver Dialog */}
            <Dialog open={isConflictResolverOpen} onOpenChange={setIsConflictResolverOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0 rounded-3xl overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <Merge className="h-7 w-7" />
                            حل تعارضات الباركود والأسماء المكررة
                        </DialogTitle>
                        <p className="text-white/80 text-sm mt-2">
                            بناءً على طلبك، نمنع تكرار الباركود. اختر النسخة الصحيحة التي تريد الاحتفاظ بها وسيتم دمج البيانات وحذف المكررات.
                        </p>
                    </DialogHeader>

                    <div className="p-8 space-y-8">
                        {conflictProducts.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">لا يوجد تعارضات حالياً!</h3>
                                <p className="text-gray-500">متجرك نظيف تماماً من البيانات المكررة.</p>
                            </div>
                        ) : (
                            conflictProducts.map((conflict, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-3xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">
                                            {idx + 1}
                                        </div>
                                        <h3 className="text-lg font-black text-saada-brown">{conflict.key}</h3>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">{conflict.items.length} نسخ مكررة</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        {conflict.items.map(item => {
                                            const isPlaceholder = !item.image || item.image === PLACEHOLDER_IMAGE || item.image.includes('unsplash.com');
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`relative bg-white p-4 rounded-2xl border-2 transition-all hover:shadow-md ${!isPlaceholder ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-100'}`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                                                            <img src={item.image} className="h-full w-full object-cover" alt="" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-saada-brown truncate">{item.name}</h4>
                                                            <p className="text-xs text-gray-500 mt-1 truncate">{item.description || 'بدون وصف'}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-xs font-black text-saada-red">رصيد: {item.stock}</span>
                                                                <span className="text-xs text-saada-brown font-bold">{Number(item.price).toFixed(Number(item.price) % 1 === 0 ? 0 : 1)} ج.م</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-saada-brown hover:bg-black text-white h-9 rounded-xl font-bold text-xs"
                                                            onClick={() => {
                                                                const others = conflict.items.filter(i => i.id !== item.id).map(i => i.id);
                                                                handleMergeProducts(item.id, others);
                                                            }}
                                                        >
                                                            <CheckCircle className="h-3 w-3 ml-1" />
                                                            احتفظ بهذا واحذف الباقي
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-9 w-9 p-0 rounded-xl"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {!isPlaceholder && (
                                                        <div className="absolute -top-2 -left-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                                            <SparklesIcon className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <DialogFooter className="p-8 bg-gray-50 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsConflictResolverOpen(false)}
                            className="px-10 h-12 rounded-2xl border-gray-300 font-bold"
                        >
                            إغلاق النافذة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Cropper Dialog */}
            {tempImageUrl && (
                <ImageCropper
                    image={tempImageUrl}
                    open={isCropperOpen}
                    onClose={() => {
                        setIsCropperOpen(false);
                        setTempImageUrl(null);
                    }}
                    onCropComplete={handleCropComplete}
                    onSkip={handleSkip}
                />
            )}
            {/* Product Lifecycle Dialog */}
            <Dialog open={isLifecycleOpen} onOpenChange={setIsLifecycleOpen}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl overflow-hidden p-0 border-none shadow-2xl font-tajawal rtl" dir="rtl">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-white">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Clock className="h-8 w-8" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black">قصة حياة المنتج</DialogTitle>
                                    <p className="text-white/80 font-medium mt-1">{lifecycleProduct?.name}</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {lifecycleLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
                                <p className="text-gray-500 font-bold">جاري استرجاع ذكريات المنتج...</p>
                            </div>
                        ) : lifecycleData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 font-bold text-lg">لم نعثر على سجلات قديمة لهذا المنتج</p>
                            </div>
                        ) : (
                            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {lifecycleData.map((item, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${item.type === 'ALERT' ? 'bg-red-600 text-white' :
                                                (item.label.includes('دخول') ? 'bg-emerald-600 text-white' :
                                                    (item.label.includes('خروج') ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'))
                                            }`}>
                                            {item.type === 'SALE' || item.label.includes('خروج') ? <TrendingUp className="h-4 w-4" /> :
                                                item.type === 'ALERT' ? <AlertTriangle className="h-4 w-4" /> :
                                                    item.type === 'ADMIN' ? <Edit className="h-4 w-4" /> :
                                                        <SparklesIcon className="h-4 w-4" />}
                                        </div>
                                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${item.type === 'ALERT' ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
                                            }`}>
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-900">{item.label}</div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <time className="text-[10px] font-tajawal font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                                        {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </time>
                                                    <time className="text-[10px] font-bold text-gray-400">
                                                        {new Date(item.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </time>
                                                </div>
                                            </div>
                                            <div className="text-slate-500 text-sm">{item.note}</div>
                                            {item.type === 'SALE' && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                                                        {item.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
