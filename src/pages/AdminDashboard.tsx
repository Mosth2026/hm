
import { useState, useEffect } from "react";
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
    Percent
} from "lucide-react";
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
    const { user, isAuthenticated, login, logout } = useAuth();
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
        readyToShot: 0
    });
    const [activeFilter, setActiveFilter] = useState<"all" | "low" | "value" | "categories" | "zero" | "draft" | "published" | "no-tax" | "ready">("all");
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [updatedSessionIds, setUpdatedSessionIds] = useState<number[]>([]);
    const [importProgress, setImportProgress] = useState<{ current: number, total: number } | null>(null);

    const handleExportNoTax = () => {
        const noTaxProducts = products.filter(p => p.description?.includes('[TAX_EXEMPT]'));
        if (noTaxProducts.length === 0) {
            toast.error("لا توجد منتجات بدون ضريبة لتصديرها");
            return;
        }

        const exportData = noTaxProducts.map(p => ({
            "الاسم": p.name,
            "الباركود": p.description?.match(/باركود\s*:\s*([^ ]+)/)?.[1] || "",
            "القسم": p.category_name,
            "السعر": p.price,
            "المخزون": p.stock
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "منتجات بدون ضريبة");
        XLSX.writeFile(wb, "saada_no_tax_products.xlsx");
        toast.success("تم التصدير بنجاح");
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
                // Check Barcode
                if (p.description && p.description.includes('باركود:')) {
                    const code = p.description.split('باركود:')[1].trim();
                    if (code && code.length > 3) {
                        const existing = barcodeGroups.get(code) || [];
                        barcodeGroups.set(code, [...existing, p]);
                    }
                }
                // Check Name (Normalized)
                const normName = normalize(p.name);
                if (normName && normName.length > 5) {
                    const existing = nameGroups.get(normName) || [];
                    nameGroups.set(normName, [...existing, p]);
                }
            });

            const conflicts: { key: string, items: Product[] }[] = [];
            barcodeGroups.forEach((items, code) => {
                if (items.length > 1) conflicts.push({ key: `الباركود: ${code}`, items });
            });
            nameGroups.forEach((items, name) => {
                const alreadyHandledInBarcode = items.some(item => {
                    const code = item.description?.includes('باركود:') ? item.description.split('باركود:')[1].trim() : null;
                    return code && barcodeGroups.get(code) && barcodeGroups.get(code)!.length > 1;
                });
                if (items.length > 1 && !alreadyHandledInBarcode) {
                    conflicts.push({ key: `الاسم: ${items[0].name}`, items });
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
        }
    }, [activeTab]);

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
        try {
            const { error } = await supabase
                .from("orders")
                .update({
                    status: 'received',
                    processed_by: user?.username
                })
                .eq("id", orderId);

            if (error) throw error;
            toast.success("تم تأكيد استلام الطلب");
            fetchOrders();
        } catch (error: any) {
            toast.error("فشل تحديث الطلب", {
                description: error.message,
                duration: 6000
            });
        }
    };

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

        // Server-side Filters
        if (activeFilter === "low") {
            query = query.lt('stock', 10).gt('stock', 0);
        } else if (activeFilter === "zero") {
            // أصناف منتهية ولها صور (جاهزة للبيع فور توفر الرصيد)
            query = query.eq('stock', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '');
        } else if (activeFilter === "draft") {
            // أصناف رصيدها صفر وبدون صور (تحتاج مراجعة شاملة)
            query = query.eq('stock', 0).or('image.is.null,image.eq.,image.ilike.%unsplash%');
        } else if (activeFilter === "published") {
            query = query.gte('stock', 1).gt('price', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '');
        } else if (activeFilter === "value") {
            query = query.gt('price', 100);
        } else if (activeFilter === "categories" && selectedCategoryLabel) {
            query = query.eq('category_name', selectedCategoryLabel);
        } else if (activeFilter === "no-tax") {
            query = query.ilike('description', '%[TAX_EXEMPT]%');
        } else if (activeFilter === "ready") {
            // أصناف لها رصيد ولكنها مخفية لعدم وجود صور (أهمية قصوى)
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
                let noTax = false;
                if (p.description?.includes('[TAX_EXEMPT]')) {
                    noTax = true;
                }
                return { ...p, no_tax: noTax };
            });
            setProducts(processed);
            calculateStats(processed);
            if (user?.role === 'admin' || user?.username === 'maher' || user?.username === 'h' || user?.username === 'mostafa') fetchConflicts();
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
                { data: allProducts }
            ] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock', 10).gte('stock', 1),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '').neq('image', PLACEHOLDER_IMAGE),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).or('image.is.null,image.eq.,image.ilike.%unsplash%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).gte('stock', 1).gt('price', 0).not('image', 'ilike', '%unsplash.com%').not('image', 'is', null).neq('image', '').neq('image', PLACEHOLDER_IMAGE),
                supabase.from('products').select('*', { count: 'exact', head: true }).ilike('description', '%[TAX_EXEMPT]%'),
                supabase.from('products').select('*', { count: 'exact', head: true }).gte('stock', 1).or('image.is.null,image.eq.,image.ilike.%unsplash%'),
                supabase.from('products').select('price, stock')
            ]);

            const total = totalCount || 0;
            const low = lowStockCount || 0;
            const zero = zeroStockCount || 0;
            const draft = needsPhotoCount || 0;
            const published = publishedCount || 0;
            const noTax = noTaxCount || 0;

            // Calculate total value from all products, not just the current filtered set
            const value = (allProducts || []).reduce((acc, p) => acc + (p.price * (p.stock ?? 0)), 0);

            setStats({
                totalProducts: total,
                lowStock: low,
                totalValue: value,
                categories: categories.length,
                zeroStock: zero,
                needsPhoto: draft,
                published: published,
                noTax: noTax,
                readyToShot: readyToShotCount || 0
            });
        } catch (err) {
            console.error("Error calculating stats:", err);
        }
    };

    const handleEdit = (product: Product) => {
        setCurrentProduct(product);
        setIsEditDialogOpen(true);
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
            no_tax: false
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
            setIsEditDialogOpen(false);
            fetchProducts();
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
                            .select('id, name, category_id, description, image')
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

                const barcodeMap = new Map();
                const categoryMap = new Map();
                const dbImageMap = new Map();

                dbProducts.forEach(p => {
                    if (p.description && p.description.includes('باركود:')) {
                        const code = p.description.split('باركود:')[1].trim();
                        if (code) {
                            const normCode = normalize(code);
                            if (normCode) barcodeMap.set(normCode, p.id);
                        }
                    }
                    categoryMap.set(p.id, p.category_id);
                    dbImageMap.set(p.id, p.image);
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
                    const normCode = excelCode ? normalize(excelCode) : null;

                    const uniqueKey = excelId || normCode || normName;
                    if (uniqueKey && processedInBatch.has(uniqueKey)) {
                        duplicateCount++;
                        continue;
                    }
                    if (uniqueKey) processedInBatch.add(uniqueKey);

                    // --- MATCHING LOGIC (Strictly Barcode or ID) ---
                    let productId = null;
                    const numericExcelId = excelId ? Number(excelId) : null;

                    if (numericExcelId && dbProducts.some(p => p.id === numericExcelId)) {
                        productId = numericExcelId;
                    } else if (normCode && barcodeMap.has(normCode)) {
                        productId = barcodeMap.get(normCode);
                        barcodeMatches++;
                    }

                    const excelCat = getRowValue(row, catKey);

                    // Determine Category ID from Excel or Name
                    let finalCatId: string | null = null;
                    if (excelCat) {
                        const normExcelCat = normalize(excelCat);
                        const match = categories.find(c => normalize(c.label) === normExcelCat);
                        if (match) finalCatId = match.id;
                    }

                    // Fallback to name keywords if no category found
                    if (!finalCatId && excelName) {
                        const normName = normalize(excelName);
                        if (normName.includes('بدون ضريبه') || normName.includes('بدون ضريبة')) finalCatId = 'no-tax';
                        else if (normName.includes('شوكولاته') || normName.includes('شوكولاتة') || normName.includes('نوتيلا')) finalCatId = 'chocolate';
                        else if (normName.includes('قهوه') || normName.includes('قهوة')) finalCatId = 'coffee';
                        else if (normName.includes('بسكويت') || normName.includes('بسكوت') || normName.includes('كوكيز')) finalCatId = 'cookies';
                        else if (normName.includes('كاندي')) finalCatId = 'candy';
                        else if (normName.includes('عصير') || normName.includes('بيبسي') || normName.includes('مشروب')) finalCatId = 'drinks';
                        else if (normName.includes('كوزمتك') || normName.includes('مستحضرات')) finalCatId = 'cosmetics';
                        else if (normName.includes('هدايا') || normName.includes('بوكس')) finalCatId = 'gifts';
                    }

                    if (productId) {
                        importedIds.add(productId);
                        const updateData: any = { id: productId };
                        let hasChanges = false;

                        const dbProduct = dbProducts.find(p => p.id === productId);
                        const currentCatId = finalCatId || dbProduct?.category_id;
                        const isExempt = (currentCatId === 'no-tax') ||
                            dbProduct?.description?.includes('[TAX_EXEMPT]') ||
                            (finalCatId === 'no-tax');

                        if (stockValue !== null) {
                            updateData.stock = stockValue;
                            hasChanges = true;
                        }

                        if (priceValue !== null) {
                            let price = parseFloat(String(priceValue).replace(/[^0-9.]/g, ''));
                            if (!isNaN(price) && price > 0) {
                                // Skip tax only for "No Tax" category
                                if (!isExempt) {
                                    price = price * 1.14;
                                }
                                updateData.price = Number(price.toFixed(1));
                                hasChanges = true;
                            }
                        }

                        if (finalCatId) {
                            updateData.category_id = finalCatId;
                            const catObj = categories.find(c => c.id === finalCatId);
                            updateData.category_name = catObj ? catObj.label : 'الاسناكس';
                            hasChanges = true;
                        }

                        if (hasChanges) {
                            toUpdate.push(updateData);
                        }
                    } else if (excelName && (excelCode || (priceValue !== null && parseFloat(String(priceValue)) > 0))) {
                        let price = priceValue ? parseFloat(String(priceValue).replace(/[^0-9.]/g, '')) : 0;
                        const newCatId = finalCatId || 'snacks';
                        if (price > 0) {
                            const isExempt = (newCatId === 'no-tax');
                            if (!isExempt) {
                                price = price * 1.14;
                            }

                            const catObj = categories.find(c => c.id === newCatId);
                            toInsert.push({
                                name: excelName.trim(),
                                price: Number(price.toFixed(1)),
                                stock: stockValue || 0,
                                category_id: newCatId,
                                category_name: catObj ? catObj.label : 'الاسناكس',
                                description: excelCode ? `باركود: ${excelCode}` : '',
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

                // --- PHASE 1: SEQUENTIAL UPDATES (Stability First) ---
                // We use a simple loop because parallel updates on the same table can hang or cause deadlocks.
                for (let i = 0; i < toUpdate.length; i++) {
                    const p = toUpdate[i];
                    setImportProgress({ current: i, total: finalTotal });

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

                    // Small yield to keep UI responsive every 20 items
                    if (i % 20 === 0) await new Promise(r => setTimeout(r, 0));
                }

                // --- PHASE 2: SEQUENTIAL INSERTS (For stability) ---
                for (let i = 0; i < toInsert.length; i++) {
                    const p = toInsert[i];
                    setImportProgress({ current: toUpdate.length + i, total: finalTotal });

                    const { data: inserted, error } = await supabase.from('products').insert([p]).select('id').single();
                    if (!error && inserted) {
                        addedCount++;
                        importedIds.add(inserted.id);
                    } else {
                        failCount++;
                        if (!firstInsertError) firstInsertError = error;
                        console.error("Insert failed:", error, p);
                    }
                    if (i % 20 === 0) await new Promise(r => setTimeout(r, 0));
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

    const filteredProducts = [...products].sort((a, b) => {
        const aUpdated = updatedSessionIds.includes(a.id);
        const bUpdated = updatedSessionIds.includes(b.id);
        if (aUpdated && !bUpdated) return -1;
        if (!aUpdated && bUpdated) return 1;
        return (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    });

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
                            onClick={() => {
                                if (!login(authData.username, authData.password)) {
                                    toast.error("بيانات الدخول غير صحيحة");
                                } else {
                                    toast.success("مرحباً بك مجدداً");
                                }
                            }}
                        >
                            تسجيل الدخول
                        </Button>

                        <div
                            className="mt-4 text-center text-xs text-gray-300 hover:text-saada-red cursor-pointer transition-colors"
                            onClick={() => {
                                login('h', 'h');
                                toast.success("مرحباً بك (دخول سريع)");
                            }}
                        >
                            دخول سريع للمسؤول (تجربة)
                        </div>
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
                            لوحة تحكم صناع السعادة ({user?.username === 'mostafa' ? 'الموظف مصطفى' : 'المدير'})
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isEditor ? (user?.username === 'mostafa' ? 'تعديل الأسماء، الصور، الأسعار، والحذف' : 'صلاحية محدودة لتعديل الصور والأسماء') : 'إدارة كاملة للمتجر والمنتجات'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {(user?.username === 'hesham' || user?.username === 'mostafa' || user?.role === 'admin') && (
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
                                        className="h-10 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold flex gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        تنظيف المكررات
                                    </Button>
                                </div>
                            </>
                        )}
                        {(!isEditor || user?.username === 'mostafa') && (
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

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "products" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                    >
                        إدارة المنتجات
                    </button>
                    {(!isEditor || user?.username === 'mostafa') && (
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`pb-4 px-4 font-bold text-lg transition-all border-b-2 ${activeTab === "orders" ? "border-saada-red text-saada-red" : "border-transparent text-gray-400"}`}
                        >
                            إدارة الطلبات
                        </button>
                    )}
                </div>

                {activeTab === "products" ? (
                    <>
                        {/* Stats Grid - Hidden for limited Editors */}
                        {(!isEditor || user?.username === 'mostafa') && (
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
                            </div>
                        )}

                        {/* Top Priority Section for Products needing photos but have stock */}
                        {(!isEditor || user?.username === 'mostafa') && stats.readyToShot > 0 && (
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
                        {(!isEditor || user?.username === 'mostafa') && conflictProducts.length > 0 && (
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
                                        {updatedSessionIds.length > 0 && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full animate-pulse border border-emerald-200">
                                                تم تحديث ({updatedSessionIds.length}) منتجات الآن
                                            </span>
                                        )}
                                        {updatedSessionIds.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[10px] h-6 px-2 text-gray-400 hover:text-saada-red"
                                                onClick={() => setUpdatedSessionIds([])}
                                            >
                                                مسح التمييز
                                            </Button>
                                        )}
                                    </CardTitle>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                                        {activeFilter === "no-tax" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleExportNoTax}
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
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">المنتج</TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">الباركود</TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">القسم</TableHead>
                                                <TableHead className="text-right py-4 font-bold text-saada-brown">السعر</TableHead>
                                                {(!isEditor || user?.username === 'mostafa') && <TableHead className="text-right py-4 font-bold text-saada-brown">المخزون</TableHead>}
                                                <TableHead className="text-center py-4 font-bold text-saada-brown">الإجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20 text-gray-500">جاري التحميل...</TableCell>
                                                </TableRow>
                                            ) : filteredProducts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20 text-gray-500">لا توجد منتجات مطابقة لـ "{searchQuery}"</TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredProducts.map((p) => (
                                                    <TableRow
                                                        key={p.id}
                                                        className={`group hover: bg - gray - 50 / 80 transition - colors border - b border - gray - 100 ${updatedSessionIds.includes(p.id) ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : ''
                                                            } `}
                                                    >
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
                                                        {!isEditor && (
                                                            <TableCell className="py-4">
                                                                <span className={`font - bold ${(p.stock ?? 0) < 10 ? 'text-orange-600' : 'text-gray-600'} `}>
                                                                    {p.stock ?? "-"}
                                                                </span>
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEdit(p)}
                                                                    className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                {(!isEditor || user?.username === 'mostafa') && (
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
                ) : (
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
                                        disabled={false} /* تم الفتح مؤقتاً للتجربة */
                                        value={currentProduct.price}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                {!isEditor && (
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
                                )}
                            </div>

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
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image">الصورة</Label>
                                <div className="flex flex-col gap-3">
                                    {!isEditor && (
                                        <Input
                                            id="image"
                                            value={currentProduct.image}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                                            className="h-11 rounded-xl"
                                            placeholder="رابط الصورة المباشر"
                                        />
                                    )}
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

                            <div className={`aspect - video w - full bg - gray - 100 rounded - 2xl overflow - hidden border - 2 border - dashed border - gray - 200 flex items - center justify - center relative group ${isUploading ? 'animate-pulse' : ''} `}>
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
                                        disabled={isEditor}
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
                                        disabled={isEditor}
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
                        <Button onClick={handleSave} className="h-11 px-8 rounded-xl bg-saada-brown hover:bg-saada-brown/90 text-white shadow-lg">
                            <Check className="h-4 w-4 ml-2" />
                            حفظ التعديلات
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
        </div>
    );
};

export default AdminDashboard;
