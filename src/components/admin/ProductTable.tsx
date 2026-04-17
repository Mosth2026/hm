
import React from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
    Package, Edit, Trash2, Clock, CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, Sparkles, Image as ImageIcon, Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductTableProps {
    products: any[];
    loading: boolean;
    activeFilter: string;
    searchQuery: string;
    selectedProductIds: number[];
    setSelectedProductIds: (ids: number[]) => void;
    handleEdit: (product: any) => void;
    handleDelete: (id: number) => void;
    handleToggleDraft?: (product: any) => void;
    fetchProductLifecycle: (product: any) => void;
    formatPrice: (price: number) => string;
    isSpecial: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
    products,
    loading,
    activeFilter,
    searchQuery,
    selectedProductIds,
    setSelectedProductIds,
    handleEdit,
    handleDelete,
    handleToggleDraft,
    fetchProductLifecycle,
    formatPrice,
    isSpecial
}) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-saada-brown border-t-transparent animate-spin"></div>
                </div>
                <div className="text-xl font-bold text-saada-brown">جاري جلب البيانات...</div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-40 gap-4 text-gray-400">
                    <Search className="h-16 w-16 opacity-10" />
                    <div className="text-xl font-bold">لا توجد منتجات مطابقة لـ "{searchQuery}"</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="font-tajawal">
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-100">
                            <TableHead className="w-12 py-6 text-center">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded-md border-gray-300 transition-all checked:bg-saada-brown"
                                    checked={selectedProductIds.length === products.length && products.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedProductIds(products.map(p => p.id));
                                        else setSelectedProductIds([]);
                                    }}
                                />
                            </TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">المنتج</TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">الباركود</TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">القسم</TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">السعر</TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">المخزون</TableHead>
                            {isSpecial && (
                                <TableHead className="text-right py-6 font-black text-saada-brown text-lg">الصلاحية</TableHead>
                            )}
                            <TableHead className="text-center py-6 font-black text-saada-brown text-lg">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => {
                            const isDraft = product.description?.includes('[DRAFT]');
                            const isNoTax = product.description?.includes('[TAX_EXEMPT]') || product.category_id === 'no-tax';
                            const barcode = product.description?.includes('باركود:') ? product.description.split('باركود:')[1].trim().replace('[TAX_EXEMPT]', '').replace('[DRAFT]', '').trim() : "لا يوجد";
                            
                            return (
                                <TableRow key={product.id} className={`hover:bg-saada-brown/5 border-b border-gray-50 transition-all ${isDraft ? 'opacity-50' : ''}`}>
                                    <TableCell className="text-center">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded-md border-gray-300 transition-all checked:bg-saada-brown"
                                            checked={selectedProductIds.includes(product.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedProductIds([...selectedProductIds, product.id]);
                                                else setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative group">
                                                <img 
                                                    src={product.image || '/placeholder.png'} 
                                                    alt={product.name} 
                                                    className="h-14 w-14 rounded-2xl object-cover shadow-sm transition-transform group-hover:scale-110"
                                                />
                                                {isDraft && <Badge variant="destructive" className="absolute -top-2 -right-2 px-1 text-[8px] rounded-lg">درافت</Badge>}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-saada-brown text-lg">{product.name}</span>
                                                {isNoTax && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none w-fit text-[10px] mt-1">بدون ضريبة</Badge>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge variant="outline" className="h-9 px-4 rounded-xl border-gray-200 text-gray-400 font-mono text-xs">{barcode}</Badge>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge variant="secondary" className="h-9 px-4 rounded-xl bg-gray-100 text-gray-600 border-none font-bold text-xs">{product.category_name}</Badge>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="font-black text-saada-brown text-lg">{formatPrice(product.price)}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-xl font-black ${product.stock <= 0 ? 'text-red-600' : product.stock < 10 ? 'text-amber-600' : 'text-saada-brown'}`}>
                                                {product.stock}
                                            </span>
                                            {product.stock <= 0 ? (
                                                <span className="text-[10px] text-red-400 font-bold whitespace-nowrap italic animate-pulse">منتهي الصلاحية</span>
                                            ) : product.stock < 10 && (
                                                <span className="text-[10px] text-amber-500 font-bold whitespace-nowrap italic">اقترب النفاذ</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    {isSpecial && (
                                        <TableCell className="py-5">
                                            <Badge className={`h-9 px-4 rounded-xl border-none font-bold text-[10px] ${product.expiry_date ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                                                {product.expiry_date || "غير محدد"}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    <TableCell className="py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => fetchProductLifecycle(product)} className="h-10 w-10 text-gray-400 hover:text-saada-brown hover:bg-saada-brown/10 rounded-xl">
                                                <Clock className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-10 w-10 text-gray-400 hover:text-saada-brown hover:bg-saada-brown/10 rounded-xl">
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                            {handleToggleDraft && (
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => handleToggleDraft(product)}
                                                    title={isDraft ? 'إلغاء الدرافت' : 'تحويل لدرافت'}
                                                    className={`h-10 w-10 rounded-xl ${isDraft ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                                                >
                                                    <AlertTriangle className="h-5 w-5" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};

export default ProductTable;
