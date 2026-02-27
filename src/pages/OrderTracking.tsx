
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

    const fetchOrderDetails = async () => {
        if (!orderId) return;
        setLoading(true);

        const urlParams = new URLSearchParams(window.location.search);
        const urlTotal = urlParams.get('t');
        const itemsString = urlParams.get('i') || urlParams.get('p'); // Support both new 'i' and old 'p' 

        const isOrderIdDraft = orderId.toString().toUpperCase().startsWith('DRAFT');

        // Helper to fetch product details for draft preview
        const fetchDraftItems = async (iStr: string) => {
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

            return productsData.map(product => {
                const hasNoTax = product.description?.includes('[TAX_EXEMPT]');
                return {
                    product_name: product.name,
                    quantity: itemMap.get(product.id) || 1,
                    no_tax: hasNoTax,
                    price: product.is_on_sale
                        ? product.price - (product.price * (product.discount || 0) / 100)
                        : product.price,
                    product_image: product.image
                };
            });
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
            } else {
                setItems([]);
            }

            setLoading(false);
            return;
        }

        try {
            // Fetch order
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select("*")
                .eq("id", orderId)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData);

            // Fetch order items
            const { data: itemsData, error: itemsError } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", orderId);

            if (itemsError) {
                // If items fail but order exists, try to recover from URL if available
                if (itemsString) {
                    const recoveredItems = await fetchDraftItems(itemsString);
                    setItems(recoveredItems);
                } else {
                    setItems([]);
                }
            } else {
                setItems(itemsData || []);
            }
        } catch (error: any) {
            console.error("Error fetching order:", error);

            // Fallback for failed fetches
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
                    customer_notes: (order.customer_notes || "") + ` \n[تم الاستلام بواسطة: ${user.username}]`
                })
                .eq("id", orderId);

            if (error) throw error;

            toast.success("تم تحديث حالة الطلب إلى (تم الاستلام)");
            fetchOrderDetails();
        } catch (error: any) {
            console.error("Error updating order:", error);
            toast.error("فشل تحديث الطلب");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saada-red"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col pt-20 text-center font-tajawal rtl">
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

    return (
        <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50/50" dir="rtl">
            <Helmet>
                <title>فاتورة رقم #{order.id} | صناع السعادة</title>
                <meta name="description" content={`تفاصيل طلب العميل ${order.customer_name} - إجمالي ${Number(order.total_price).toFixed(Number(order.total_price) % 1 === 0 ? 0 : 1)} ج.م`} />
                <meta property="og:title" content={`📦 فاتورة رقم #${order.id}`} />
                <meta property="og:description" content="اضغط لمعاينة تفاصيل طلبك من صناع السعادة" />
                <meta property="og:image" content="/lovable-uploads/cf9082da-6aac-4f3b-85cf-515fdb61963a.png" />
                <meta property="og:type" content="website" />
            </Helmet>
            <Header />
            <main className="flex-grow pt-24 md:pt-28 pb-12 px-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-saada-brown mb-2 flex items-center gap-3">
                                    <Package className="h-8 w-8 text-saada-red" />
                                    تفاصيل الطلب #{order.id}
                                </h1>
                                <p className="text-gray-500">تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</p>
                            </div>
                            <div className={`px-6 py-2 rounded-full font-bold text-sm ${order.is_draft
                                ? 'bg-amber-100 text-amber-700'
                                : order.status === 'received'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-saada-red/10 text-saada-red'
                                }`}>
                                {order.is_draft
                                    ? 'طلب مرسل (قيد المراجعة)'
                                    : order.status === 'received'
                                        ? 'تم الاستلام بنجاح'
                                        : 'جاري التجهيز'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gray-50">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">بيانات العميل</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-saada-brown">
                                        <User className="h-5 w-5 text-saada-red/50" />
                                        <span className="font-bold">{order.customer_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-saada-brown">
                                        <Phone className="h-5 w-5 text-saada-red/50" />
                                        <span className="font-bold" dir="ltr">{order.customer_phone}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-saada-brown">
                                        <MapPin className="h-5 w-5 text-saada-red/50 mt-1" />
                                        <span className="leading-relaxed">{order.customer_address}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">ملخص الحساب</h3>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-2xl">
                                    <div className="flex justify-between text-gray-600">
                                        <span>إجمالي المنتجات</span>
                                        <span>{Number(order.total_price).toFixed(Number(order.total_price) % 1 === 0 ? 0 : 1)} ج.م</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>التوصيل</span>
                                        <span className="text-green-600 font-bold">مجاني</span>
                                    </div>
                                    <div className="pt-2 border-t mt-2 flex justify-between text-saada-brown">
                                        <span className="font-black">الإجمالي الكلي</span>
                                        <span className="text-2xl font-black text-saada-red">{Number(order.total_price).toFixed(Number(order.total_price) % 1 === 0 ? 0 : 1)} ج.م</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="mt-8 space-y-4">
                            <h3 className="font-bold text-saada-brown flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                المنتجات المطلوبة
                            </h3>
                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                        <div className="h-16 w-16 bg-white rounded-xl shadow-sm flex items-center justify-center p-1 overflow-hidden">
                                            {(item.product_image || item.image) ? (
                                                <img
                                                    src={item.product_image || item.image}
                                                    alt={item.product_name}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <Package className="h-8 w-8 text-gray-200" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-saada-brown">{cleanProductName(item.product_name)}</h4>
                                            <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                                        </div>
                                        <div className="text-saada-red font-black">
                                            {(item.price * item.quantity).toFixed((item.price * item.quantity) % 1 === 0 ? 0 : 1)} ج.م
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin Action */}
                        {isAuthenticated && (
                            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-saada-brown text-white rounded-full flex items-center justify-center font-bold">
                                        {user?.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">مرحباً {user?.username}</p>
                                        <p className="text-xs text-saada-brown font-bold">أنت تشاهد نسخة الإدارة</p>
                                    </div>
                                </div>

                                {order.status !== 'received' ? (
                                    <Button
                                        onClick={handleMarkAsReceived}
                                        className="bg-green-600 hover:bg-green-700 text-white h-14 px-8 rounded-2xl font-black shadow-xl shadow-green-100 transition-all hover:scale-105 gap-2"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        تأكيد الاستلام مع العميل
                                    </Button>
                                ) : (
                                    <div className="text-green-600 font-bold flex items-center gap-2 bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                                        <CheckCircle2 className="h-5 w-5" />
                                        تم الاستلام مسبقاً
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="text-center text-gray-400 text-xs px-8">
                        هذه الفاتورة منشأة تلقائياً برقم مرجعي #{order.id}. في حال وجود أي استفسار يرجى التواصل مع الدعم الفني.
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderTracking;
