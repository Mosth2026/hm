
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, Package, MapPin, Phone, User, Clock, FileText, ShoppingBag } from "lucide-react";
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

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const formatPrice = (price: any) => {
        if (price === null || price === undefined) return "0";
        const num = Number(price);
        if (isNaN(num)) return String(price);
        return num.toFixed(num % 1 === 0 ? 0 : 1);
    };

    const formatDate = (dateStr: any) => {
        if (!dateStr) return "غير محدد";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "غير محدد";
            return date.toLocaleDateString('ar-EG', { dateStyle: 'long' });
        } catch (e) {
            return "غير محدد";
        }
    };

    const fetchOrderDetails = async () => {
        if (!orderId) return;
        setLoading(true);

        const urlParams = new URLSearchParams(window.location.search);
        const urlTotal = urlParams.get('t');
        const itemsString = urlParams.get('i') || urlParams.get('p'); 

        const isOrderIdDraft = String(orderId || "").toUpperCase().startsWith('DRAFT');

        const fetchDraftItems = async (iStr: string) => {
            try {
                const itemPairs = iStr.split('_');
                const itemMap = new Map<number, number>();
                const productIds: number[] = [];

                for (const pair of itemPairs) {
                    const [pid, qty] = pair.split('-');
                    if (pid && qty) {
                        const id = parseInt(pid);
                        const q = parseInt(qty);
                        itemMap.set(id, q);
                        productIds.push(id);
                    }
                }

                if (productIds.length === 0) return [];

                const { data: productsData, error } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', productIds);

                if (error || !productsData) return [];

                return productsData.map(product => ({
                    product_name: product.name,
                    quantity: itemMap.get(product.id) || 1,
                    price: product.is_on_sale
                        ? product.price - (product.price * (product.discount || 0) / 100)
                        : product.price,
                    product_image: product.image
                }));
            } catch (e) {
                return [];
            }
        };

        if (isOrderIdDraft) {
            setOrder({
                id: orderId,
                customer_name: "عميل صناع السعادة",
                customer_phone: "المتابعة عبر واتساب",
                customer_address: "طلب مرسل عبر الواتساب",
                total_price: urlTotal || "جاري الحساب",
                status: 'pending',
                created_at: new Date().toISOString(),
                is_draft: true
            });

            if (itemsString) {
                const draftItems = await fetchDraftItems(itemsString);
                setItems(draftItems);
            }
            setLoading(false);
            return;
        }

        try {
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select("*")
                .eq("id", orderId)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData);

            const { data: itemsData, error: itemsError } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", orderId);

            if (itemsError) {
                if (itemsString) {
                    const recoveredItems = await fetchDraftItems(itemsString);
                    setItems(recoveredItems);
                }
            } else {
                setItems(itemsData || []);
            }
        } catch (error: any) {
            setOrder({
                id: orderId,
                customer_name: "عميل صناع السعادة",
                total_price: urlTotal || "المذكور في الرسالة",
                status: 'pending',
                created_at: new Date().toISOString(),
                is_draft: true
            });
            if (itemsString) {
                const draftItems = await fetchDraftItems(itemsString);
                setItems(draftItems);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsReceived = async () => {
        if (!isAuthenticated || !user) {
            toast.error("يجب تسجيل الدخول كمسؤول أولاً");
            navigate("/admin");
            return;
        }
        try {
            const { error } = await supabase
                .from("orders")
                .update({
                    status: 'received',
                    processed_by: user.username,
                    customer_notes: (order?.customer_notes || "") + ` \n[تم الاستلام بواسطة: ${user.username}]`
                })
                .eq("id", orderId);
            if (error) throw error;
            toast.success("تم تحديث حالة الطلب");
            fetchOrderDetails();
        } catch (error: any) {
            toast.error("فشل تحديث الطلب");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saada-red"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col pt-20 text-center font-tajawal rtl bg-gray-50">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center p-4">
                    <FileText className="h-20 w-20 text-gray-200 mb-4" />
                    <h1 className="text-2xl font-bold">الطلب غير موجود</h1>
                    <Button onClick={() => navigate("/")} className="mt-4">العودة للرئيسية</Button>
                </div>
                <Footer />
            </div>
        );
    }

    const orderTotal = order?.total_price || 0;
    const customerName = order?.customer_name || "عميل صناع السعادة";

    return (
        <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50/50" dir="rtl">
            <Helmet>
                <title>فاتورة رقم #{order.id} | صناع السعادة</title>
                <meta name="description" content={`تفاصيل طلب العميل ${customerName} - إجمالي ${formatPrice(orderTotal)} ج.م`} />
                <meta property="og:title" content={`📦 فاتورة رقم #${order.id}`} />
                <meta property="og:description" content="اضغط لمعاينة تفاصيل طلبك من صناع السعادة" />
                <meta property="og:image" content="/assets/logo.png" />
                <meta property="og:type" content="website" />
            </Helmet>
            <Header />
            <main className="flex-grow pt-24 md:pt-28 pb-12 px-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-saada-brown mb-2 flex items-center gap-3">
                                    <Package className="h-8 w-8 text-saada-red" />
                                    تفاصيل الطلب #{order.id}
                                </h1>
                                <p className="text-gray-500">تاريخ الطلب: {formatDate(order?.created_at)}</p>
                            </div>
                            <div className={`px-6 py-2 rounded-full font-bold text-sm ${order?.is_draft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {order?.is_draft ? 'طلب مرسل (قيد المراجعة)' : 'تم الاستلام بنجاح'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gray-50">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">بيانات العميل</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-saada-brown">
                                        <User className="h-5 w-5 text-saada-red/50" />
                                        <span className="font-bold">{customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-saada-brown">
                                        <Phone className="h-5 w-5 text-saada-red/50" />
                                        <span className="font-bold" dir="ltr">{order?.customer_phone || "جاري التحميل..."}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-saada-brown">
                                        <MapPin className="h-5 w-5 text-saada-red/50 mt-1" />
                                        <span className="leading-relaxed">{order?.customer_address || "عنوان العميل بالرسالة"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest px-2">ملخص الحساب</h3>
                                <div className="bg-gray-50 p-6 rounded-3xl space-y-4 border border-gray-100 min-h-[160px] flex flex-col justify-center">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span className="text-sm opacity-80">إجمالي المنتجات</span>
                                        <span className="font-bold text-saada-brown">{formatPrice(orderTotal)} ج.م</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200/50">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-gray-400">الإجمالي الكلي للدفع</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`${isNaN(Number(orderTotal)) ? 'text-xl' : 'text-3xl'} font-black text-saada-red`}>
                                                    {formatPrice(orderTotal)}
                                                </span>
                                                <span className="text-sm font-bold text-saada-red/70">ج.م</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <h3 className="font-bold text-saada-brown flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                المنتجات المطلوبة
                            </h3>
                            <div className="space-y-3">
                                {items && items.length > 0 ? items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                        <div className="h-16 w-16 bg-white rounded-xl shadow-sm flex items-center justify-center p-1 overflow-hidden">
                                            <img src={item?.product_image || item?.image || "/assets/logo.png"} className="h-full w-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-saada-brown text-sm">{cleanProductName(item?.product_name || "منتج")}</h4>
                                            <p className="text-xs text-gray-500">الكمية: {item?.quantity || 1}</p>
                                        </div>
                                        <div className="text-saada-red font-black text-sm">
                                            {formatPrice((item?.price || 0) * (item?.quantity || 1))} ج.م
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 text-sm italic">سيتم عرض قائمة المنتجات عند تأكيد الطلب</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isAuthenticated && (
                            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-saada-brown text-white rounded-full flex items-center justify-center font-bold">
                                        {user?.username ? user.username[0].toUpperCase() : 'A'}
                                    </div>
                                    <p className="text-sm text-gray-500">مرحباً {user?.username || 'مسؤول'}</p>
                                </div>
                                {order?.status !== 'received' && (
                                    <Button onClick={handleMarkAsReceived} className="bg-green-600 hover:bg-green-700 text-white h-14 px-8 rounded-2xl font-black">
                                        تأكيد الاستلام
                                    </Button>
                                )}
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
