
import React from 'react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
    ImageIcon, Upload, Camera, Save, X, Trash2, Clock, TrendingUp, Sparkles, AlertTriangle,
    Edit, Plus, List
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ImageCropper from "@/components/admin/ImageCropper";

interface DashboardDialogsProps {
    // Edit Product Dialog
    isEditDialogOpen: boolean;
    setIsEditDialogOpen: (open: boolean) => void;
    currentProduct: any;
    setCurrentProduct: (product: any) => void;
    handleSave: () => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    categories: any[];
    
    // Image Cropper
    isCropperOpen: boolean;
    setIsCropperOpen: (open: boolean) => void;
    tempImageUrl: string | null;
    handleCropComplete: (blob: Blob) => void;
    handleSkip: () => void;
    
    // Lifecycle
    isLifecycleOpen: boolean;
    setIsLifecycleOpen: (open: boolean) => void;
    lifecycleProduct: any;
    lifecycleData: any[];
    lifecycleLoading: boolean;

    // Bulk Category
    isBulkCategoryOpen: boolean;
    setIsBulkCategoryOpen: (open: boolean) => void;
    bulkCategoryId: string;
    setBulkCategoryId: (id: string) => void;
    handleBulkCategoryUpdate: () => void;

    // Coupon Dialog
    isCouponDialogOpen: boolean;
    setIsCouponDialogOpen: (open: boolean) => void;
    newCoupon: { code: string; discount_type: string; discount_value: number };
    setNewCoupon: (c: any) => void;
    handleCreateCoupon: () => void;
}

const DashboardDialogs: React.FC<DashboardDialogsProps> = ({
    isEditDialogOpen, setIsEditDialogOpen, currentProduct, setCurrentProduct, handleSave, handleImageUpload, isUploading, categories,
    isCropperOpen, setIsCropperOpen, tempImageUrl, handleCropComplete, handleSkip,
    isLifecycleOpen, setIsLifecycleOpen, lifecycleProduct, lifecycleData, lifecycleLoading,
    isBulkCategoryOpen, setIsBulkCategoryOpen, bulkCategoryId, setBulkCategoryId, handleBulkCategoryUpdate,
    isCouponDialogOpen, setIsCouponDialogOpen, newCoupon, setNewCoupon, handleCreateCoupon
}) => {
    return (
        <>
            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl bg-white rounded-3xl p-8 font-tajawal max-h-[90vh] overflow-y-auto border-none shadow-2xl rtl" dir="rtl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black text-saada-brown flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-saada-brown/10 flex items-center justify-center">
                                {currentProduct.id ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            </div>
                            {currentProduct.id ? "تعديل المنتج" : "إضافة منتج جديد"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        {/* Right: Info */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-saada-brown font-black text-lg">اسم المنتج</Label>
                                <Input
                                    value={currentProduct.name || ""}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                    className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold"
                                    placeholder="مثلاً: كاندي ملون بالكيلو"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-saada-brown font-black text-lg">السعر الأساسي</Label>
                                    <Input
                                        type="number"
                                        value={currentProduct.price || ""}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                                        className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-saada-brown font-black text-lg">المخزون الحالي</Label>
                                    <Input
                                        type="number"
                                        value={currentProduct.stock || 0}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })}
                                        className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-saada-brown font-black text-lg">القسم المفضل</Label>
                                <Select 
                                    value={currentProduct.category_id || ""} 
                                    onValueChange={(val) => {
                                        const cat = categories.find(c => c.id === val);
                                        setCurrentProduct({ ...currentProduct, category_id: val, category_name: cat?.label || "" });
                                    }}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold">
                                        <SelectValue placeholder="اختر القسم..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl shadow-xl border-none p-2 font-tajawal">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} className="rounded-xl h-12 font-bold focus:bg-saada-brown focus:text-white">{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-saada-brown font-black text-lg">الباركود والوصف</Label>
                                <Input
                                    value={currentProduct.description || ""}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                    className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold"
                                    placeholder="مثلاً: باركود: 123456"
                                />
                            </div>
                        </div>

                        {/* Left: Image & Extra */}
                        <div className="space-y-6">
                            <div className="space-y-3 text-center">
                                <Label className="text-saada-brown font-black text-lg block text-right">صورة المنتج</Label>
                                <div className="relative group mx-auto w-full aspect-square max-w-[280px]">
                                    <img 
                                        src={currentProduct.image || '/placeholder.png'} 
                                        alt="Current" 
                                        className="w-full h-full rounded-3xl object-cover shadow-xl border-4 border-white ring-1 ring-gray-100"
                                    />
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-3xl flex flex-col items-center justify-center cursor-pointer text-white gap-2">
                                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                            <Camera className="h-6 w-6" />
                                        </div>
                                        <span className="font-bold">تغيير الصورة</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                    </label>
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                                            <div className="h-10 w-10 rounded-full border-4 border-saada-brown border-t-transparent animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-4 rounded-3xl border border-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <Label className="text-saada-brown font-black text-sm">بدون ضريبة</Label>
                                        <span className="text-[10px] text-gray-400 font-bold">تفعيل الخصم التلقائي</span>
                                    </div>
                                    <Switch 
                                        checked={currentProduct.no_tax} 
                                        onCheckedChange={(val) => setCurrentProduct({ ...currentProduct, no_tax: val })}
                                        className="data-[state=checked]:bg-saada-brown"
                                    />
                                </div>
                                <div className="space-y-2 mt-2">
                                    <Label className="text-saada-brown font-black text-sm">تاريخ الصلاحية</Label>
                                    <Input 
                                        type="date" 
                                        value={currentProduct.expiry_date || ""} 
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, expiry_date: e.target.value })}
                                        className="h-11 rounded-2xl bg-white border-gray-100 font-bold" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-8 gap-3 sm:gap-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditDialogOpen(false)} 
                            className="flex-1 h-14 rounded-2xl font-black text-lg border-gray-200 text-gray-400 hover:bg-gray-50 transition-all"
                        >
                            إلغاء
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isUploading}
                            className="flex-[2] h-14 rounded-2xl font-black text-lg bg-saada-brown hover:bg-black text-white shadow-xl shadow-saada-brown/20 transition-all gap-2"
                        >
                            <Save className="h-5 w-5" />
                            حفظ التعديلات
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Cropper */}
            {tempImageUrl && (
                <ImageCropper 
                    image={tempImageUrl} 
                    open={isCropperOpen} 
                    onClose={() => setIsCropperOpen(false)} 
                    onCropComplete={handleCropComplete} 
                    onSkip={handleSkip} 
                />
            )}

            {/* Product Lifecycle */}
            <Dialog open={isLifecycleOpen} onOpenChange={setIsLifecycleOpen}>
                <DialogContent className="sm:max-w-2xl bg-slate-50 rounded-3xl p-0 font-tajawal overflow-hidden border-none shadow-2xl rtl" dir="rtl">
                    <div className="bg-saada-brown text-white p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                <Clock className="h-6 w-6" />
                                قصة حياة المنتج: {lifecycleProduct?.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-2">
                                <span className="text-xs opacity-70">الرصيد الحالي:</span>
                                <span className="text-lg font-black">{lifecycleProduct?.stock}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-2">
                                <span className="text-xs opacity-70">إجمالي المبيعات:</span>
                                <span className="text-lg font-black">{lifecycleData.filter(i => i.type === 'SALE').reduce((sum, item) => sum + (item.quantity || 0), 0)} قطعة</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        {lifecycleLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="h-10 w-10 rounded-full border-4 border-saada-brown border-t-transparent animate-spin"></div>
                                <span className="text-saada-brown font-bold">جاري مراجعة الأرشيف...</span>
                            </div>
                        ) : (
                            <div className="relative space-y-6 before:absolute before:inset-0 before:mr-5 before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {lifecycleData.map((item, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between group">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 shadow-sm shrink-0 z-10 ${
                                            item.type === 'ALERT' ? 'bg-red-600 text-white' :
                                            (item.label.includes('دخول') ? 'bg-emerald-600 text-white' :
                                            (item.label.includes('خروج') ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'))
                                        }`}>
                                            {item.type === 'SALE' || item.label.includes('خروج') ? <TrendingUp className="h-4 w-4" /> :
                                            item.type === 'ALERT' ? <AlertTriangle className="h-4 w-4" /> :
                                            item.type === 'ADMIN' ? <Edit className="h-4 w-4" /> :
                                            <Sparkles className="h-4 w-4" />}
                                        </div>
                                        <div className="w-[calc(100%-4rem)] p-5 rounded-3xl border bg-white shadow-sm transition-all hover:shadow-md border-slate-100 relative after:absolute after:right-[-20px] after:top-[15px] after:w-0 after:h-0 after:border-t-[10px] after:border-t-transparent after:border-b-[10px] after:border-b-transparent after:border-l-[10px] after:border-l-white">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-black text-slate-900 text-lg">{item.label}</div>
                                                <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none rounded-lg text-[10px]">
                                                    {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-slate-500 font-medium">{item.note}</div>
                                            {item.status && <Badge className="mt-2 bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">{item.status}</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                        <Button onClick={() => setIsLifecycleOpen(false)} className="h-12 px-10 rounded-2xl bg-saada-brown text-white font-black">فهمت، إغلاق</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Category Update */}
            <Dialog open={isBulkCategoryOpen} onOpenChange={setIsBulkCategoryOpen}>
                <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-8 font-tajawal border-none shadow-2xl rtl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-saada-brown flex items-center gap-3">
                            <List className="h-6 w-6" />
                            تحديث القسم جماعياً
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 border-dashed text-amber-700 text-sm font-bold">
                            سيتم تطبيق هذا القسم على جميع الأصناف المختارة ({bulkCategoryId.split(',').filter(Boolean).length} صنف تم اختياره).
                        </div>
                        <div className="space-y-3">
                            <Label className="text-saada-brown font-black text-lg">اختر القسم الجديد</Label>
                            <Select 
                                value={bulkCategoryId} 
                                onValueChange={setBulkCategoryId}
                            >
                                <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold">
                                    <SelectValue placeholder="اختر القسم..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl border-none p-2 font-tajawal">
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id} className="rounded-xl h-12 font-bold focus:bg-saada-brown focus:text-white">{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0 mt-4">
                        <Button variant="outline" onClick={() => setIsBulkCategoryOpen(false)} className="flex-1 h-14 rounded-2xl font-black border-gray-100 text-gray-400">إلغاء</Button>
                        <Button onClick={handleBulkCategoryUpdate} disabled={!bulkCategoryId} className="flex-[2] h-14 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200">تحديث الآن</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Coupon Dialog */}
            <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white rounded-3xl p-8 font-tajawal border-none shadow-2xl rtl" dir="rtl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black text-saada-brown flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-saada-red/10 flex items-center justify-center">
                                <Ticket className="h-5 w-5 text-saada-red" />
                            </div>
                            إنشاء كود خصم جديد
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-saada-brown font-black">كود الخصم</Label>
                            <input
                                type="text"
                                placeholder="مثلاً: SAADA20"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                className="w-full h-14 px-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ring-saada-red text-lg font-black tracking-widest"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black">نوع الخصم</Label>
                                <Select value={newCoupon.discount_type} onValueChange={v => setNewCoupon({ ...newCoupon, discount_type: v })}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl font-tajawal">
                                        <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                                        <SelectItem value="fixed">مبلغ ثابت ج.م</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black">القيمة</Label>
                                <input
                                    type="number"
                                    min={1}
                                    placeholder={newCoupon.discount_type === 'percentage' ? '20' : '50'}
                                    value={newCoupon.discount_value || ''}
                                    onChange={e => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                                    className="w-full h-14 px-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ring-saada-red text-lg font-black"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 mt-6">
                        <Button variant="outline" onClick={() => setIsCouponDialogOpen(false)} className="flex-1 h-14 rounded-2xl font-black border-gray-100 text-gray-400">إلغاء</Button>
                        <Button onClick={handleCreateCoupon} className="flex-[2] h-14 rounded-2xl font-black bg-saada-red hover:bg-black text-white shadow-xl">إنشاء الكود</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DashboardDialogs;
