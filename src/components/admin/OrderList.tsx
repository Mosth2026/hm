
import React from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
    ShoppingCart, RefreshCw, Trash2, CheckCircle2, RotateCcw, ExternalLink, Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface OrderListProps {
    orders: any[];
    loading: boolean;
    handleMarkAsReceived: (id: number) => void;
    handleReturnOrder: (id: number) => void;
    handleDeleteOrder: (id: number) => void;
    formatPrice: (price: number) => string;
}

const OrderList: React.FC<OrderListProps> = ({ 
    orders, 
    loading, 
    handleMarkAsReceived, 
    handleReturnOrder, 
    handleDeleteOrder,
    formatPrice 
}) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-saada-brown border-t-transparent animate-spin"></div>
                </div>
                <div className="text-xl font-bold text-saada-brown">جاري جلب الطلبات...</div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden p-20 text-center">
                <ShoppingCart className="h-16 w-16 opacity-10 mx-auto mb-4" />
                <div className="text-xl font-bold text-gray-400">لا توجد طلبات مسجلة حالياً</div>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="font-tajawal">
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-100">
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">العميل</TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">التاريخ</TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">المبلغ الإجمالي</TableHead>
                            <TableHead className="text-right py-6 font-black text-saada-brown text-lg">الحالة</TableHead>
                            <TableHead className="text-center py-6 font-black text-saada-brown text-lg">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-saada-brown/5 border-b border-gray-50 transition-all">
                                <TableCell className="py-5">
                                    <div className="flex flex-col">
                                        <span className="font-black text-saada-brown text-lg">{order.customer_name}</span>
                                        <span className="text-xs text-gray-400 font-medium">{order.customer_phone || "بدون هاتف"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5">
                                    <Badge variant="outline" className="h-9 px-4 rounded-xl border-gray-200 text-gray-500 font-bold text-xs gap-2">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(order.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-5">
                                    <span className="font-black text-saada-red text-xl whitespace-nowrap">{formatPrice(order.total_price)}</span>
                                </TableCell>
                                <TableCell className="py-5">
                                    <Badge className={`h-9 px-4 rounded-xl border-none font-bold text-xs shadow-sm ${
                                        order.status === 'received' 
                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100 italic'
                                    }`}>
                                        {order.status === 'received' ? 'تم الاستلام' : 'بانتظار التأكيد'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => window.open(`/order-preview/${order.tracking_code || order.id}`, '_blank')}
                                            className="h-10 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            معاينة
                                        </Button>
                                        
                                        {order.status !== 'received' ? (
                                            <Button 
                                                onClick={() => handleMarkAsReceived(order.id)}
                                                className="h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                تأكيد استلام
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleReturnOrder(order.id)}
                                                className="h-10 gap-2 border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl font-bold"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                عمل مرتجع
                                            </Button>
                                        ) }
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};

export default OrderList;
