
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, ChevronRight, MapPin, Phone, User, CreditCard, MessageCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/constants";

const CheckoutPage = () => {
    const { items, getTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        notes: "",
    });

    const totalPrice = getTotalPrice();

    if (items.length === 0 && !isSuccess) {
        navigate("/cart");
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleWhatsAppSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error("يرجى ملء البيانات الأساسية أولاً");
            return;
        }
        setIsSubmitting(true);

        try {
            let orderId: string | number = `DRAFT${Date.now()}`;
            let success = false;

            try {
                // 1. إنشاء الطلب في سوبابيز
                const { data: order, error: orderError } = await supabase
                    .from("orders")
                    .insert([
                        {
                            customer_name: formData.name,
                            customer_phone: formData.phone,
                            customer_address: formData.address,
                            customer_notes: formData.notes + " (طلب عبر واتساب من صفحة الدفع)",
                            total_price: totalPrice,
                            status: "pending",
                        },
                    ])
                    .select()
                    .single();

                if (!orderError && order) {
                    orderId = order.id;

                    // 2. إضافة تفاصيل المنتجات في جدول order_items
                    const orderItems = items.map((item) => ({
                        order_id: order.id,
                        product_id: item.id,
                        product_name: item.name,
                        quantity: item.quantity,
                        price: item.is_on_sale
                            ? item.price - (item.price * (item.discount || 0) / 100)
                            : item.price,
                    }));

                    await supabase.from("order_items").insert(orderItems);
                    success = true;
                }
            } catch (dbErr) {
                console.error("Database backup failed, proceeding with direct WhatsApp", dbErr);
            }

            // 3. تحضير رسالة الواتساب
            const cartDetails = items.map(item => {
                const basePrice = item.price || 0;
                const discount = item.discount || 0;
                const price = item.is_on_sale ? basePrice - (basePrice * discount / 100) : basePrice;
                const itemTotal = price * item.quantity;
                return `• *${item.name}*\n  العدد: ${item.quantity}\n  السعر: ${itemTotal.toFixed(itemTotal % 1 === 0 ? 0 : 1)} ج.م`;
            }).join('\n\n');

            let invoiceUrl = `${window.location.origin}/order-preview/${orderId}`;
            if (!success) {
                const itemsParam = items.map(i => `${i.id}-${i.quantity}`).join('_');
                invoiceUrl += `?t=${totalPrice}&i=${itemsParam}`;
            }

            const message = encodeURIComponent(
                `🛒 *طلب جديد (رقم #${orderId})* 🛒\n\n` +
                `👤 *العميل:* ${formData.name}\n` +
                `📞 *رقم الهاتف:* ${formData.phone}\n` +
                `📍 *العنوان:* ${formData.address}\n\n` +
                `📦 *المنتجات:*\n${cartDetails}\n\n` +
                `💰 *الإجمالي الكلي:* ${Number(totalPrice).toFixed(Number(totalPrice) % 1 === 0 ? 0 : 1)} ج.م\n\n` +
                `📄 *رابط الفاتورة الرقمية:* ${invoiceUrl}\n\n` +
                `مرحباً صناع السعادة، أود إتمام هذا الطلب الذي سجلته على الموقع.`
            );

            // 4. فتح واتساب
            window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${message}`, '_blank');

            setIsSuccess(true);
            clearCart();
            toast.success("تم تسجيل طلبك وتحويلك للواتساب!");
        } catch (error: any) {
            console.error("Error creating order:", error);
            toast.error("حدث خطأ أثناء إرسال الطلب.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. إنشاء الطلب في سوبابيز
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert([
                    {
                        customer_name: formData.name,
                        customer_phone: formData.phone,
                        customer_address: formData.address,
                        customer_notes: formData.notes,
                        total_price: totalPrice,
                        status: "pending",
                    },
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. إضافة تفاصيل المنتجات في جدول order_items
            const orderItems = items.map((item) => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.is_on_sale
                    ? item.price - (item.price * (item.discount || 0) / 100)
                    : item.price,
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. نجاح الطلب
            setIsSuccess(true);
            clearCart();
            toast.success("تم استلام طلبك بنجاح! سنتواصل معك قريباً.");
        } catch (error: any) {
            console.error("Error creating order:", error);
            toast.error("حدث خطأ أثناء إرسال الطلب. تأكد من إعداد جداول orders و order_items في Supabase.");

            // حتى لو فشل الحفظ في القاعدة (بسبب عدم وجود الجداول)، سنظهر نجاحاً وهمياً للمستخدم (اختياري للتدريب)
            // لكن الأفضل أن نكون صريحين. هنا سنتركها تفشل لنبه المستخدم.
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col font-tajawal rtl">
                <Header />
                <main className="flex-grow flex items-center justify-center pt-24 md:pt-28 pb-20 px-4">
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="bg-green-100 p-6 rounded-full inline-block mb-6">
                            <CheckCircle2 className="h-20 w-20 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-saada-brown mb-4">شكراً لطلبك!</h1>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            تم تسجيل طلبك بنجاح. سنقوم بمراجعته والتواصل معك عبر الهاتف لتأكيد الشحن في أقرب وقت ممكن.
                        </p>
                        <Button
                            onClick={() => navigate("/")}
                            className="bg-saada-red hover:bg-saada-brown text-white px-10 py-6 text-lg rounded-xl transition-all"
                        >
                            العودة للرئيسية
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>إتمام الطلب - صناع السعادة</title>
            </Helmet>
            <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50">
                <Header />
                <main className="flex-grow pt-24 md:pt-28 pb-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl font-bold text-saada-brown mb-8 text-center">إتمام الطلب</h1>

                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* نموذج البيانات */}
                                <div className="bg-white p-8 rounded-2xl shadow-md">
                                    <h2 className="text-xl font-bold text-saada-brown mb-6 flex items-center gap-2">
                                        <User className="h-5 w-5 text-saada-red" />
                                        بيانات الشحن
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-saada-red focus:bg-white outline-none transition-all"
                                                    placeholder="هاني المصري"
                                                />
                                                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-saada-red focus:bg-white outline-none transition-all text-left"
                                                    placeholder="01xxxxxxxxx"
                                                />
                                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان بالتفصيل</label>
                                            <div className="relative">
                                                <textarea
                                                    required
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-saada-red focus:bg-white outline-none transition-all"
                                                    placeholder="المدينة، الحي (مثال: الإسكندرية، سان ستيفانو)، الشارع، رقم العمارة..."
                                                ></textarea>
                                                <MapPin className="absolute right-3 top-4 h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية (اختياري)</label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                rows={2}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-saada-red focus:bg-white outline-none transition-all"
                                                placeholder="أي تفاصيل أخرى بخصوص الطلب أو التوصيل..."
                                            ></textarea>
                                        </div>

                                        <div className="pt-4">
                                            <div className="bg-saada-orange/10 p-4 rounded-xl flex gap-3 items-start border border-saada-orange/20 mb-6">
                                                <CreditCard className="h-5 w-5 text-saada-orange shrink-0 mt-0.5" />
                                                <p className="text-xs text-saada-brown leading-relaxed">
                                                    نظام الدفع المتاح حالياً هو <strong>الدفع عند الاستلام</strong> فقط. ستدفع قيمة الطلب لمندوب الشحن عند وصوله إليك.
                                                </p>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-saada-red hover:bg-saada-brown text-white py-8 text-xl rounded-xl shadow-lg transition-all hover:scale-[1.01]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-6 w-6 ml-2 animate-spin" />
                                                        جاري إرسال الطلب...
                                                    </>
                                                ) : (
                                                    "تأكيد الطلب وشراء الآن"
                                                )}
                                            </Button>

                                            <div className="relative my-6 text-center">
                                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                                                <span className="relative bg-white px-2 text-xs text-gray-500 uppercase">أو تفضل الواتساب؟</span>
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={handleWhatsAppSubmit}
                                                disabled={isSubmitting}
                                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-8 text-xl rounded-xl shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle className="h-6 w-6" />
                                                أكمل الطلب عبر واتساب
                                            </Button>
                                        </div>
                                    </form>
                                </div>

                                {/* ملخص السلة */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-saada-brown mb-4 border-b pb-4">محتويات السلة</h3>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pl-2">
                                            {items.map((item) => {
                                                const itemPrice = item.is_on_sale
                                                    ? item.price - (item.price * (item.discount || 0) / 100)
                                                    : item.price;
                                                return (
                                                    <div key={item.id} className="flex gap-3">
                                                        <img src={item.image} className="h-14 w-14 rounded-lg object-cover" />
                                                        <div className="flex-grow">
                                                            <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                                                            <div className="flex justify-between items-center text-xs mt-1">
                                                                <span className="text-gray-500">{item.quantity} × {itemPrice.toFixed(itemPrice % 1 === 0 ? 0 : 1)} ج.م</span>
                                                                <span className="font-bold text-saada-red">{(item.quantity * itemPrice).toFixed((item.quantity * itemPrice) % 1 === 0 ? 0 : 1)} ج.م</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-saada-brown text-white p-6 rounded-2xl shadow-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="opacity-80">الإجمالي الكلي</span>
                                            <span className="text-2xl font-bold">{Number(totalPrice).toFixed(Number(totalPrice) % 1 === 0 ? 0 : 1)} ج.م</span>
                                        </div>
                                        <p className="text-[10px] opacity-60 text-center mt-4">
                                            بضغطك على تأكيد الطلب أنت توافق على شروط وأحكام متجر صناع السعادة
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default CheckoutPage;
