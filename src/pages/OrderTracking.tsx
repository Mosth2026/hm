
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, Package, MapPin, Phone, User, FileText, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cleanProductName } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

const OrderTracking = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Helpers
    const safeFormatPrice = (price: any) => {
        if (price === null || price === undefined) return "0";
        const val = String(price);
        if (isNaN(Number(val))) return val;
        const num = Number(val);
        return num.toFixed(num % 1 === 0 ? 0 : 1);
    };

    const safeFormatDate = (dateStr: any) => {
        if (!dateStr) return "غير محدد";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "غير محدد";
            return date.toLocaleDateString('ar-EG', { dateStyle: 'long' });
        } catch (e) { return "غير محدد"; }
    };

    const fetchOrderDetails = async () => {
        if (!orderId) return;
        setLoading(true);

        const urlParams = new URLSearchParams(window.location.search);
        const urlTotal = urlParams.get('t');
        const itemsString = urlParams.get('i') || urlParams.get('p'); 

        const isDraft = String(orderId).toUpperCase().startsWith('DRAFT');

        const fetchItemsFromUrl = async (iStr: string) => {
            try {
                const pairs = iStr.split('_');
                const productIds = pairs.map(p => parseInt(p.split('-')[0])).filter(id => !isNaN(id));
                const qtyMap = new Map();
                pairs.forEach(p => {
                    const [id, q] = p.split('-');
                    qtyMap.set(parseInt(id), parseInt(q));
                });

                if (productIds.length === 0) return [];
                const { data } = await supabase.from('products').select('*').in('id', productIds);
                return (data || []).map(p => ({
                    product_name: p.name,
                    quantity: qtyMap.get(p.id) || 1,
                    price: p.is_on_sale ? p.price - (p.price * (p.discount || 0) / 100) : p.price,
                    product_image: p.image
                }));
            } catch (e) { return []; }
        };

        if (isDraft) {
            setOrder({
                id: orderId,
                customer_name: "عميل صناع السعادة",
                customer_phone: "المتابعة عبر واتساب",
                customer_address: "طلب مرسل مباشرة",
                total_price: urlTotal || "0",
                created_at: new Date().toISOString(),
                is_draft: true
            });
            if (itemsString) setItems(await fetchItemsFromUrl(itemsString));
            setLoading(false);
            return;
        }

        try {
            const { data: orderData, error: orderErr } = await supabase.from("orders").select("*").eq("id", orderId).single();
            if (orderErr) throw orderErr;
            setOrder(orderData);

            const { data: itemsData } = await supabase.from("order_items").select("*").eq("order_id", orderId);
            if (itemsData && itemsData.length > 0) {
                setItems(itemsData);
            } else if (itemsString) {
                setItems(await fetchItemsFromUrl(itemsString));
            }
        } catch (err) {
            setOrder({
                id: orderId,
                customer_name: "عميل صناع السعادة",
                total_price: urlTotal || "المذكور في الرسالة",
                created_at: new Date().toISOString(),
                is_draft: true
            });
            if (itemsString) setItems(await fetchItemsFromUrl(itemsString));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrderDetails(); }, [orderId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saada-red"></div></div>;
    if (!order) return <div className="min-h-screen flex flex-col items-center justify-center font-tajawal rtl"><Header /><FileText className="h-16 w-16 text-gray-200 mb-4" /><h1 className="text-xl font-bold">عذراً، الطلب غير موجود</h1><Button onClick={() => navigate("/")} className="mt-4">الرئيسية</Button><Footer /></div>;

    // Pre-calculated values for safe render
    const displayTotal = safeFormatPrice(order.total_price);
    const displayDate = safeFormatDate(order.created_at);
    const customerName = order.customer_name || "عميل صناع السعادة";
    const customerPhone = order.customer_phone || "المتابعة عبر واتساب";
    const customerAddress = order.customer_address || "عنوان العميل بالرسالة";

    return (
        <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50/50" dir="rtl">
            <Helmet>
                <title>فاتورة رقم #{orderId} | صناع السعادة</title>
            </Helmet>
            <Header />
            <main className="flex-grow pt-28 pb-12 px-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 bg-saada-red/10 rounded-xl flex items-center justify-center"><Package className="h-6 w-6 text-saada-red" /></div>
                                    <h1 className="text-2xl font-black text-saada-brown">فاتورة رقم #{orderId}</h1>
                                </div>
                                <p className="text-gray-400 text-sm">تاريخ الإنشاء: {displayDate}</p>
                            </div>
                            <div className={`px-5 py-2 rounded-full font-bold text-xs ${order?.is_draft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {order?.is_draft ? 'طلب واتساب (قيد المراجعة)' : 'تم التأكيد'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-gray-50">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">بيانات الاستلام</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3"><User className="h-4 w-4 text-saada-red/40" /><span className="font-bold text-saada-brown text-sm">{customerName}</span></div>
                                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-saada-red/40" /><span className="font-bold text-saada-brown text-sm" dir="ltr">{customerPhone}</span></div>
                                    <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-saada-red/40 mt-1" /><span className="text-sm text-saada-brown/80 leading-relaxed">{customerAddress}</span></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ملخص الحساب</h3>
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3"><span>إجمالي المنتجات</span><span className="font-bold">{displayTotal} ج.م</span></div>
                                    <div className="pt-3 border-t border-gray-200/50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">الإجمالي الكلي</span>
                                        <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-saada-red">{displayTotal}</span><span className="text-xs font-bold text-saada-red/60">ج.م</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <h3 className="font-bold text-saada-brown flex items-center gap-2 text-sm"><ShoppingBag className="h-4 w-4" />المنتجات المطلوبة</h3>
                            <div className="grid gap-3">
                                {items.length > 0 ? items.filter(Boolean).map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-saada-red/10 transition-colors">
                                        <div className="h-14 w-14 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0"><img src={item?.product_image || item?.image || "/assets/logo.png"} className="h-full w-full object-contain" /></div>
                                        <div className="flex-grow min-w-0"><h4 className="font-bold text-saada-brown text-sm truncate">{cleanProductName(item?.product_name || item?.name)}</h4><p className="text-[10px] text-gray-400">الكمية: {item?.quantity || 1}</p></div>
                                        <div className="text-saada-red font-black text-sm whitespace-nowrap">{safeFormatPrice((item?.price || 0) * (item?.quantity || 1))} ج.م</div>
                                    </div>
                                )) : <div className="text-center py-6 text-gray-400 text-xs italic">يرجى مراجعة تفاصيل المنتجات في رسالة الواتساب</div>}
                            </div>
                        </div>

                        {isAuthenticated && (
                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3"><div className="h-8 w-8 bg-saada-brown text-white rounded-lg flex items-center justify-center font-bold text-xs">{user?.username?.[0]?.toUpperCase() || 'U'}</div><p className="text-xs text-gray-500">مرحباً {user?.username}</p></div>
                                {order.status !== 'received' && <Button size="sm" onClick={async () => {
                                    const { error } = await supabase.from("orders").update({ status: 'received' }).eq("id", orderId);
                                    if (!error) { toast.success("تم تحديث الحالة"); fetchOrderDetails(); }
                                }} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">تأكيد الاستلام</Button>}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderTracking;
