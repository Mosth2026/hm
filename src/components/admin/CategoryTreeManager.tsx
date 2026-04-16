
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    ChevronRight, ChevronDown, Plus, Package, Check, 
    ArrowRight, Layers, Search, Filter, RefreshCw, Trash2, Edit2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface CategoryTreeManagerProps {
    categories: any[];
    products: any[];
    onRefresh: () => void;
    onRefreshCategories: () => void;
}

export const CategoryTreeManager: React.FC<CategoryTreeManagerProps> = ({ categories, products, onRefresh, onRefreshCategories }) => {
    const [expandedParents, setExpandedParents] = useState<string[]>([]);
    const [isRefineDialogOpen, setIsRefineDialogOpen] = useState(false);
    const [targetSubCategory, setTargetSubCategory] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // For manual subcategory addition
    const [isAddSubDialogOpen, setIsAddSubDialogOpen] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState("");
    const [activeParentForNewSub, setActiveParentForNewSub] = useState<any>(null);
    
    // For editing categories (Main or Sub)
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editCategoryImage, setEditCategoryImage] = useState("");
    
    // For adding main categories
    const [isAddMainDialogOpen, setIsAddMainDialogOpen] = useState(false);
    const [newMainCategoryName, setNewMainCategoryName] = useState("");

    // Refresh categories when this component is opened to ensure visibility
    useEffect(() => {
        onRefreshCategories();
    }, []);

    const APP_HIERARCHY = [
        {
            id: 'chocolate', label: 'الشوكولاتة', subcategories: [
                { id: 'milk-chocolate', label: 'ميلك' },
                { id: 'dark-chocolate', label: 'دارك' },
                { id: 'white-chocolate', label: 'وايت' },
                { id: 'stevia-chocolate', label: 'ستيفيا' },
                { id: 'fruits-chocolate', label: 'فواكه' },
                { id: 'nuts-chocolate', label: 'مكسرات' },
            ]
        },
        {
            id: 'cookies', label: 'الكوكيز', subcategories: [
                { id: 'sugar-free-cookies', label: 'شوجر فري' },
                { id: 'gluten-free-cookies', label: 'جلوتين فري' },
                { id: 'sugar-gluten-free', label: 'شوجر & جلوتين فري' },
            ]
        },
        {
            id: 'coffee', label: 'القهوة', subcategories: [
                { id: 'instant-coffee', label: 'سريعة التحضير' },
                { id: 'turkish-coffee', label: 'قهوة تركية' },
                { id: 'espresso', label: 'اسبريسو' },
            ]
        },
        { id: 'candy', label: 'الكاندي' },
        { id: 'snacks', label: 'الاسناكس' },
        { id: 'dietary', label: 'الدايت والصحة' },
        { id: 'cosmetics', label: 'لمسات الجمال' },
        { id: 'gifts', label: 'بوكسات الهدايا' }
    ];

    const handleSyncCategories = async () => {
        setIsSyncing(true);
        const toastId = toast.loading("جاري تأسيس شجرة الأقسام...");
        
        try {
            for (const parent of APP_HIERARCHY) {
                await supabase.from('categories').upsert({
                    id: parent.id,
                    label: parent.label,
                    parent_id: null
                });

                if (parent.subcategories) {
                    for (const sub of parent.subcategories) {
                        await supabase.from('categories').upsert({
                            id: sub.id,
                            label: sub.label,
                            parent_id: parent.id
                        });
                    }
                }
            }

            toast.success("تمت مزامنة الشجرة مع تطبيق الجوال بنجاح", { id: toastId });
            onRefreshCategories();
        } catch (e) {
            toast.error("فشل المزامنة", { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteSubCategory = async (cat: any) => {
        if (!window.confirm(`هل أنت متأكد من حذف قسم "${cat.label}"؟ سيتم إزالته فوراً، وسيتم نقل المنتجات المرتبطة به إلى القسم الأب "${categories.find(c => c.id === cat.parent_id)?.label || 'الرئيسي'}" تلقائياً.`)) return;
        
        const toastId = toast.loading("جاري معالجة البيانات...");
        try {
            // 1. Unlink products and move them to parent
            const parentId = cat.parent_id;
            const parentCat = categories.find(c => c.id === parentId);
            const parentLabel = parentCat?.label || "متنوع";
            
            await supabase.from('products')
                .update({ category_id: parentId, category_name: parentLabel })
                .eq('category_id', cat.id);
            
            // 2. Clear secondary tags [ADD_CAT:id] from descriptions (optional but cleaner)
            // This is harder via simple API, we'll focus on the primary constraint first.
            
            // 3. Delete the category
            const { error } = await supabase.from('categories').delete().eq('id', cat.id);
            
            if (!error) {
                toast.success(`تم حذف قسم "${cat.label}" بنجاح`, { id: toastId });
                onRefreshCategories();
            } else {
                toast.error("فشل حذف القسم من قاعدة البيانات. تأكد من إفراغ الأقسام الفرعية أولاً.", { id: toastId });
            }
        } catch (e) {
            toast.error("حدث خطأ تقني أثناء الحذف", { id: toastId });
        }
    };

    const handleEditCategory = async () => {
        if (!editingCategory) return;
        
        const toastId = toast.loading("جاري حفظ التعديلات...");
        const { error } = await supabase.from('categories')
            .update({ 
                label: editCategoryName || editingCategory.label,
                image: editCategoryImage 
            })
            .eq('id', editingCategory.id);

        if (!error) {
            toast.success("تم تحديث بيانات القسم بنجاح", { id: toastId });
            setIsEditCategoryDialogOpen(false);
            onRefreshCategories();
        } else {
            console.error("Category Update Error:", error);
            toast.error("عذراً، فشل تحديث بيانات القسم. يرجى التأكد من الصلاحيات.", { id: toastId });
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategoryName || !activeParentForNewSub) return;
        const id = `manual-${Date.now()}`;
        const { error } = await supabase.from('categories').insert([{
            id, label: newSubCategoryName, parent_id: activeParentForNewSub.id
        }]);

        if (!error) {
            toast.success(`تمت إضافة قسم ${newSubCategoryName}`);
            setNewSubCategoryName("");
            setIsAddSubDialogOpen(false);
            onRefreshCategories();
        } else {
            console.error("SubCategory Insert Error:", error);
            toast.error(`فشل إضافة القسم: ${error.message}`);
        }
    };

    const handleAddMainCategory = async () => {
        if (!newMainCategoryName) return;
        const id = `root-${Date.now()}`;
        
        const { error } = await supabase.from('categories').insert([{
            id, label: newMainCategoryName, parent_id: null
        }]);

        if (!error) {
            toast.success(`تمت إضافة القسم الرئيسي "${newMainCategoryName}" بنجاح`);
            setNewMainCategoryName("");
            setIsAddMainDialogOpen(false);
            onRefreshCategories();
        } else {
            console.error("Main Category Insert Error:", error);
            toast.error(`فشل إضافة القسم الرئيسي: ${error.message}`);
        }
    };

    const treeData = useMemo(() => {
        const parents = categories.filter(c => !c.parent_id);
        return parents.map(p => ({
            ...p,
            children: categories.filter(c => c.parent_id === p.id)
        }));
    }, [categories]);

    const toggleParent = (parentId: string) => {
        setExpandedParents(prev => 
            prev.includes(parentId) ? prev.filter(id => id !== parentId) : [...prev, parentId]
        );
    };

    const openRefineDialog = (subCat: any) => {
        setTargetSubCategory(subCat);
        setSelectedProductIds([]);
        setIsRefineDialogOpen(true);
    };

    const candidateProducts = useMemo(() => {
        if (!targetSubCategory) return [];
        const parentId = targetSubCategory.parent_id;
        
        // Show both products in parent AND already classified siblings (to allow multi-category)
        const siblingIds = categories.filter(c => c.parent_id === parentId).map(c => c.id);
        
        return products.filter(p => {
            const isInCategoryFamily = p.category_id === parentId || siblingIds.includes(p.category_id);
            const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            return isInCategoryFamily && matchesSearch;
        });
    }, [targetSubCategory, products, searchQuery, categories]);

    const handleRefineUpdate = async (isMulti: boolean = false) => {
        if (selectedProductIds.length === 0 || !targetSubCategory) return;
        
        setIsUpdating(true);
        const toastId = toast.loading(isMulti ? "جاري الإضافة لقسم إضافي..." : "جاري النقل للقسم الجديد...");
        
        try {
            for (const productId of selectedProductIds) {
                const product = products.find(p => p.id === productId);
                if (!product) continue;

                if (isMulti) {
                    // Real multi-category: Append instead of replace
                    const currentDesc = (product.description || "");
                    const tagToAdd = `[ADD_CAT:${targetSubCategory.id}]`;
                    
                    // Check if already has this tag to prevent duplicates
                    if (!currentDesc.includes(tagToAdd)) {
                        const newDesc = `${currentDesc} ${tagToAdd}`.trim();
                        await supabase.from('products').update({
                            description: newDesc
                        }).eq('id', productId);
                    }
                } else {
                    await supabase.from('products').update({
                        category_id: targetSubCategory.id,
                        category_name: targetSubCategory.label
                    }).eq('id', productId);
                }
            }

            toast.success(`تم بنجاح تحديث ${selectedProductIds.length} منتج`, { id: toastId });
            setIsRefineDialogOpen(false);
            onRefresh();
        } catch (e) {
            toast.error("فشل التحديث", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6 font-tajawal rtl" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-saada-brown">إدارة شجرة الأقسام</h2>
                    <p className="text-gray-500 font-bold mt-1">نظام التوزيع الذكي للمنتجات داخل الأقسام الفرعية</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={handleSyncCategories}
                        disabled={isSyncing}
                        variant="outline"
                        className="h-14 px-6 rounded-2xl border-saada-brown/20 text-saada-brown font-black hover:bg-saada-brown hover:text-white transition-all gap-2"
                    >
                        <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "جاري التأسيس..." : "تأسيس الشجرة من الجوال"}
                    </Button>
                    <Button 
                        onClick={() => setIsAddMainDialogOpen(true)}
                        className="h-14 px-8 bg-saada-red text-white rounded-2xl font-black shadow-xl shadow-saada-red/20 transform hover:scale-[1.02] active:scale-95 transition-all gap-2"
                    >
                        <Plus className="h-6 w-6" />
                        إضافة قسم رئيسي
                    </Button>
                    <div className="h-14 px-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <Layers className="h-6 w-6 text-saada-red" />
                        <span className="font-black text-saada-brown">{categories.filter(c => !c.parent_id).length} قسم رئيسي</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {treeData.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-[2.5rem] shadow-sm">
                        <Package className="h-20 w-20 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-saada-brown">البداية هنا!</h3>
                        <p className="text-gray-400 font-bold mb-8">اضغط على زر "تأسيس الشجرة" لتحويل المتجر لنظام الأقسام الاحترافي</p>
                        <Button onClick={handleSyncCategories} className="h-16 px-10 bg-saada-brown text-white rounded-2xl font-black">تأسيس الشجرة الآن</Button>
                    </div>
                ) : (
                    treeData.map((parent) => (
                        <Card key={parent.id} className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] transition-all hover:shadow-2xl">
                            <CardHeader 
                                className="p-8 cursor-pointer hover:bg-gray-50 transition-colors flex flex-row items-center justify-between"
                                onClick={() => toggleParent(parent.id)}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-saada-brown/5 flex items-center justify-center text-saada-brown group relative overflow-hidden">
                                        {parent.image ? (
                                            <img src={parent.image} alt="" className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <Package className="h-8 w-8 group-hover:scale-110 transition-transform" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black text-saada-brown">{parent.label}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-saada-red/10 text-saada-red border-none font-black px-3 py-1">
                                                {parent.children.length} أقسام فرعية
                                            </Badge>
                                            <span className="text-gray-400 font-bold text-sm">
                                                • {products.filter(p => p.category_id === parent.id).length} منتجات أساسية
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-12 w-12 rounded-full hover:bg-saada-brown hover:text-white transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCategory(parent);
                                                setEditCategoryName(parent.label);
                                                setEditCategoryImage(parent.image || "");
                                                setIsEditCategoryDialogOpen(true);
                                            }}
                                        >
                                            <Edit2 className="h-6 w-6" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-saada-brown hover:text-white transition-all">
                                            {expandedParents.includes(parent.id) ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                                        </Button>
                                    </div>
                            </CardHeader>
                            
                            {expandedParents.includes(parent.id) && (
                                <CardContent className="p-8 pt-0 border-t border-gray-50 bg-gray-50/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                                        {parent.children.map((child: any) => (
                                            <div 
                                                key={child.id} 
                                                className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group transition-all hover:-translate-y-2 hover:shadow-xl"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Badge variant="outline" className="text-gray-400 border-gray-200 font-bold px-3">قسم فرعي</Badge>
                                                        <div className="flex items-center gap-1">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-saada-brown/30 hover:text-saada-brown hover:bg-saada-brown/10 rounded-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingCategory(child);
                                                                    setEditCategoryName(child.label);
                                                                    setEditCategoryImage(child.image || "");
                                                                    setIsEditCategoryDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-saada-red/30 hover:text-saada-red hover:bg-saada-red/10 rounded-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteSubCategory(child);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-xl font-black text-saada-brown group-hover:text-saada-red transition-colors">{child.label}</h4>
                                                    <p className="text-gray-400 font-bold text-sm mt-1">
                                                        {products.filter(p => p.category_id === child.id || (p.description && p.description.includes(`[ADD_CAT:${child.id}]`))).length} صنف فعلي
                                                    </p>
                                                </div>
                                                
                                                <Button 
                                                    onClick={() => openRefineDialog(child)}
                                                    className="mt-6 w-full h-12 rounded-2xl bg-saada-brown hover:bg-black text-white font-black shadow-lg shadow-saada-brown/20 gap-2 transition-all"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    إضافة منتجات من {parent.label}
                                                </Button>
                                            </div>
                                        ))}

                                        <div 
                                            onClick={() => {
                                                setActiveParentForNewSub(parent);
                                                setIsAddSubDialogOpen(true);
                                            }}
                                            className="border-2 border-dashed border-gray-200 p-6 rounded-[2rem] flex flex-col items-center justify-center text-gray-300 hover:border-saada-red hover:text-saada-red transition-all cursor-pointer group"
                                        >
                                            <Plus className="h-10 w-10 mb-2 group-hover:scale-125 transition-transform" />
                                            <span className="font-black">قسم فرعي جديد</span>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Smart Refinement Dialog (Move/Add Products) */}
            <Dialog open={isRefineDialogOpen} onOpenChange={setIsRefineDialogOpen}>
                <DialogContent className="sm:max-w-3xl bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-[0_30px_100px_rgba(0,0,0,0.25)] font-tajawal rtl" dir="rtl">
                    <div className="bg-saada-brown p-8 text-white relative">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <Filter className="h-8 w-8" />
                                <div>
                                    <DialogTitle className="text-2xl font-black">توزيع صنف إلى {targetSubCategory?.label}</DialogTitle>
                                    <DialogDescription className="text-white/60 font-bold">
                                        اختر من منتجات {categories.find(c => c.id === targetSubCategory?.parent_id)?.label}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8">
                        <div className="relative mb-6">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                                placeholder="ابحث عن منتج..." 
                                className="h-14 pr-12 rounded-2xl border-none bg-gray-100 font-bold text-base focus:ring-2 ring-saada-brown transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[400px] pr-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {candidateProducts.map((p) => (
                                    <div 
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedProductIds(prev => 
                                                prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                                            );
                                        }}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                                            selectedProductIds.includes(p.id) 
                                            ? 'border-saada-red bg-saada-red/5' 
                                            : 'border-gray-100 hover:border-saada-brown bg-white'
                                        }`}
                                    >
                                        <Checkbox checked={selectedProductIds.includes(p.id)} className="h-6 w-6 rounded-lg" />
                                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-saada-brown leading-tight">{p.name}</span>
                                                <Badge variant="secondary" className="text-[10px] h-5 bg-gray-100 text-gray-400 font-bold">
                                                    {p.category_name || "بدون قسم"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-saada-red font-bold">{p.price} ج.م</span>
                                                {p.description && p.description.includes('[ADD_CAT:') && (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black h-4">متعدد الأقسام</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter className="p-8 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <Button variant="ghost" onClick={() => setIsRefineDialogOpen(false)} className="h-14 px-8 rounded-2xl font-black text-gray-400">إلغاء</Button>
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="outline"
                                onClick={() => handleRefineUpdate(true)}
                                disabled={selectedProductIds.length === 0 || isUpdating}
                                className="h-14 px-8 rounded-2xl border-saada-brown text-saada-brown font-black shadow-lg gap-2"
                            >
                                {isUpdating ? "جاري الحفظ..." : <><Plus className="h-5 w-5" /> إضافة كقسم ثانٍ</>}
                            </Button>
                            <Button 
                                onClick={() => handleRefineUpdate(false)}
                                disabled={selectedProductIds.length === 0 || isUpdating}
                                className="h-14 px-8 rounded-2xl bg-saada-red text-white font-black shadow-xl shadow-saada-red/20 gap-2"
                            >
                                {isUpdating ? "جاري النقل..." : <><Check className="h-5 w-5" /> نقل هنا فقط</>}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manual Category Add Dialog */}
            <Dialog open={isAddSubDialogOpen} onOpenChange={setIsAddSubDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white rounded-[2.5rem] p-8 border-none font-tajawal rtl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-saada-brown">إضافة قسم فرعي جديد</DialogTitle>
                        <DialogDescription className="font-bold text-gray-400">سيتم إضافة هذا القسم تحت قسم {activeParentForNewSub?.label}</DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Input 
                            placeholder="اسم القسم (مثلاً: جلوتين فري)..." 
                            className="h-14 rounded-2xl bg-gray-50 border-none font-black text-lg focus:ring-2 ring-saada-brown"
                            value={newSubCategoryName}
                            onChange={(e) => setNewSubCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubCategory()}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddSubCategory} className="w-full h-14 bg-saada-red text-white rounded-2xl font-black text-lg shadow-xl shadow-saada-red/20 transition-all hover:scale-[1.02]">تأكيد الإضافة</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Edit Dialog (Main or Sub) */}
            <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white rounded-[2.5rem] p-8 border-none font-tajawal rtl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-saada-brown">تعديل القسم</DialogTitle>
                        <DialogDescription className="font-bold text-gray-400">تعديل اسم وصورة قسم: {editingCategory?.label}</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-saada-brown">اسم القسم</label>
                            <Input 
                                placeholder="الاسم الجديد..." 
                                className="h-14 rounded-2xl bg-gray-50 border-none font-black text-lg"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-saada-brown">رابط صورة القسم (PNG شفاف)</label>
                            <Input 
                                placeholder="https://.../image.png" 
                                className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                                value={editCategoryImage}
                                onChange={(e) => setEditCategoryImage(e.target.value)}
                            />
                            {editCategoryImage && (
                                <div className="mt-4 p-4 rounded-3xl bg-gray-50 border border-dashed border-gray-200 flex justify-center">
                                    <img src={editCategoryImage} alt="Preview" className="h-32 w-32 object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditCategory} className="w-full h-16 bg-saada-brown text-white rounded-2xl font-black text-xl shadow-xl shadow-saada-brown/20 transition-all hover:scale-[1.02]">
                            حفظ التغييرات
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Category Add Dialog */}
            <Dialog open={isAddMainDialogOpen} onOpenChange={setIsAddMainDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white rounded-[2.5rem] p-8 border-none font-tajawal rtl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-saada-brown">إضافة قسم رئيسي جديد</DialogTitle>
                        <DialogDescription className="font-bold text-gray-400">سيظهر هذا القسم في الصفحة الرئيسية والتصفح العام</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 px-2">اسم القسم</label>
                            <Input 
                                placeholder="مثلاً: سويس فرو، كاندي مستورد..." 
                                className="h-14 rounded-2xl bg-gray-50 border-none font-black text-lg focus:ring-2 ring-saada-brown"
                                value={newMainCategoryName}
                                onChange={(e) => setNewMainCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMainCategory()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddMainCategory} className="w-full h-14 bg-saada-red text-white rounded-2xl font-black text-lg shadow-xl shadow-saada-red/20 transition-all hover:scale-[1.02]">تأكيد إضافة القسم الرئيسي</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
