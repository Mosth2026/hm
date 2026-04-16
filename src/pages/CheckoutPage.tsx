
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
    Loader2, CheckCircle2, MapPin, Phone, User,
    CreditCard, MessageCircle, ChevronRight, AlertCircle, Zap
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/constants";
import { saveOrderToDb } from "@/lib/orders";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useEffect as useReactEffect } from "react";
import { useBranchContext } from "@/context/BranchContext";
import { usePaymentSettings } from "@/hooks/use-payment-settings";

type PaymentMethodId = 'cod' | 'paymob' | 'paymob_wallet' | 'fawry' | 'whatsapp';

const CheckoutPage = () => {
    const { items, getTotalPrice, getDiscountedTotal, appliedCoupon, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('cod');
    const { logEvent } = useAnalytics();
    const { user } = useAuth();
    const { branches, selectedBranch, selectBranch } = useBranchContext();
    const { enabledGateways, loading: gatewaysLoading } = usePaymentSettings();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        notes: "",
        confirm_email: "", // Honeypot field for bot protection
    });

    const [hasSetDefault, setHasSetDefault] = useState(false);

    useReactEffect(() => {
        logEvent('checkout_view', { items_count: items.length, total: discountedTotal });
        // Set default payment to first enabled gateway only once
        if (enabledGateways.length > 0 && !hasSetDefault) {
            setSelectedPayment(enabledGateways[0].id as PaymentMethodId);
            setHasSetDefault(true);
        }
    }, [enabledGateways, hasSetDefault]);

    const totalPrice = getTotalPrice();
    const discountedTotal = getDiscountedTotal();
    const discountAmount = totalPrice - discountedTotal;

    if (items.length === 0 && !isSuccess) {
        navigate("/cart");
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        if (value.length > 3) {
            logEvent('checkout_progress', { field: name }, newFormData);
        }
    };

    const [waMessage, setWaMessage] = useState("");

    // --- WhatsApp Submit ---
    const handleWhatsAppSubmit = async () => {
        if (!formData.name || !formData.phone) {
            toast.error("يرجى ملء البيانات الأساسية أولاً");
            return;
        }
        if (formData.confirm_email) return;

        setIsSubmitting(true);
        try {
            let orderId: string | number = `DRAFT${Date.now()}`;
            let trackingId: string | number = orderId;
            let dbSuccess = false;

            // 1. Save order to DB first to get a real ID
            try {
                const result = await saveOrderToDb(
                    {
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address,
                        notes: formData.notes + " (طلب عبر واتساب)"
                    },
                    items.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.is_on_sale
                            ? item.price - (item.price * (item.discount || 0) / 100)
                            : item.price,
                        image: item.image
                    })),
                    discountedTotal,
                    "pending",
                    appliedCoupon?.code || "",
                    discountAmount,
                    user?.id
                );
                if (result.success) {
                    orderId = result.orderId!;
                    trackingId = result.trackingCode || result.orderId!;
                    dbSuccess = true;
                }
            } catch (dbErr) {
                console.error("DB error:", dbErr);
            }

            // 2. Prepare Message
            const cartDetails = items.map(item => {
                const basePrice = item.price || 0;
                const discount = item.discount || 0;
                const price = item.is_on_sale ? basePrice - (basePrice * discount / 100) : basePrice;
                return `• *${item.name}*\n  العدد: ${item.quantity}\n  السعر: ${formatPrice(price * item.quantity)}`;
            }).join('\n\n');

            let invoiceUrl = `${window.location.origin}/order-preview/${trackingId}`;
            if (!dbSuccess) {
                const itemsParam = items.map(i => `${i.id}-${i.quantity}`).join('_');
                invoiceUrl += `?t=${discountedTotal}&i=${itemsParam}`;
                if (appliedCoupon) invoiceUrl += `&c=${appliedCoupon.code}&d=${discountAmount}`;
            }

            const message = 
                `مرحباً فرع ${selectedBranch?.name || "صناع السعادة"}، أود إتمام هذا الطلب:\n\n` +
                `🛒 *طلب جديد (رقم #${orderId})* 🛒\n\n` +
                `👤 *العميل:* ${formData.name}\n` +
                `📞 *رقم الهاتف:* ${formData.phone}\n` +
                `📍 *العنوان:* ${formData.address}\n\n` +
                (appliedCoupon ? `🎟️ *كود الخصم:* ${appliedCoupon.code} (-${discountAmount} ج.م)\n\n` : "") +
                `📦 *المنتجات:*\n${cartDetails}\n\n` +
                `💰 *الإجمالي الكلي:* ${formatPrice(discountedTotal)}\n\n` +
                `📄 *رابط الفاتورة الرقمية:* ${invoiceUrl}`;

            setWaMessage(message);
            logEvent('whatsapp_checkout_init', { order_id: orderId }, formData);
            
            // 3. Move to Success/Action state
            setIsSuccess(true);
            clearCart();
            toast.success("تم تسجيل طلبك! اضغط على زر الواتساب لإرساله للمتجر.");
        } catch (error: any) {
            toast.error("حدث خطأ أثناء إرسال الطلب.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Standard DB Submit ---
    const handleCodSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await saveOrderToDb(
                {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    notes: formData.notes
                },
                items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.is_on_sale
                        ? item.price - (item.price * (item.discount || 0) / 100)
                        : item.price,
                    image: item.image
                })),
                discountedTotal,
                "pending",
                appliedCoupon?.code || "",
                discountAmount,
                user?.id
            );
            if (!result.success) throw new Error(result.error);
            setIsSuccess(true);
            logEvent('order_complete', { order_id: result.orderId!, total: discountedTotal }, formData);
            clearCart();
            toast.success("تم استلام طلبك بنجاح! سنتواصل معك قريباً.");
        } catch (error: any) {
            toast.error("حدث خطأ أثناء إرسال الطلب.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Paymob Cards Submit ---
    const handlePaymobSubmit = async (gatewayConfig: any) => {
        if (!gatewayConfig.api_key || !gatewayConfig.integration_id || !gatewayConfig.iframe_id) {
            toast.error("بوابة Paymob غير مهيأة بعد. تواصل مع الإدارة.");
            return;
        }
        setIsSubmitting(true);
        try {
            // 1. Save order to DB first
            const result = await saveOrderToDb(
                { name: formData.name, phone: formData.phone, address: formData.address, notes: formData.notes },
                items.map(item => ({
                    id: item.id, name: item.name, quantity: item.quantity,
                    price: item.is_on_sale ? item.price - (item.price * (item.discount || 0) / 100) : item.price,
                    image: item.image
                })),
                discountedTotal, "pending_payment", appliedCoupon?.code || "", discountAmount, user?.id
            );

            if (!result.success) throw new Error(result.error);

            // 2. Get Paymob Auth Token
            const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: gatewayConfig.api_key }),
            });
            const authData = await authRes.json();
            if (!authData.token) throw new Error('Paymob auth failed');

            // 3. Create Order in Paymob
            const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: authData.token,
                    delivery_needed: false,
                    amount_cents: Math.round(discountedTotal * 100),
                    currency: 'EGP',
                    merchant_order_id: String(result.orderId),
                    items: items.map(item => ({
                        name: item.name,
                        amount_cents: Math.round((item.is_on_sale ? item.price - (item.price * (item.discount || 0) / 100) : item.price) * item.quantity * 100),
                        description: item.name,
                        quantity: item.quantity,
                    })),
                }),
            });
            const orderData = await orderRes.json();
            if (!orderData.id) throw new Error('Paymob order creation failed');

            // 4. Get Payment Key
            const payKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: authData.token,
                    amount_cents: Math.round(discountedTotal * 100),
                    expiration: 3600,
                    order_id: orderData.id,
                    billing_data: {
                        first_name: formData.name.split(' ')[0] || formData.name,
                        last_name: formData.name.split(' ').slice(1).join(' ') || 'N/A',
                        email: 'NA@email.com',
                        phone_number: formData.phone,
                        apartment: 'NA', floor: 'NA', street: formData.address || 'NA',
                        building: 'NA', shipping_method: 'NA', postal_code: 'NA',
                        city: 'Cairo', country: 'EGY', state: 'Egypt',
                    },
                    currency: 'EGP',
                    integration_id: parseInt(gatewayConfig.integration_id),
                }),
            });
            const payKeyData = await payKeyRes.json();
            if (!payKeyData.token) throw new Error('Paymob payment key failed');

            // 5. Redirect to iFrame
            const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${gatewayConfig.iframe_id}?payment_token=${payKeyData.token}`;
            clearCart();
            window.location.href = iframeUrl;
        } catch (error: any) {
            console.error('Paymob error:', error);
            toast.error('حدث خطأ مع بوابة Paymob: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Paymob Wallet Submit ---
    const handleWalletSubmit = async (gatewayConfig: any) => {
        const walletIntegrationId = gatewayConfig.extra_config?.wallet_integration_id;
        if (!gatewayConfig.api_key || !walletIntegrationId) {
            toast.error("بيانات محفظة الموبايل غير مكتملة. تواصل مع الإدارة.");
            return;
        }
        if (!formData.phone) {
            toast.error("يرجى إدخال رقم هاتف المحفظة أولاً");
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await saveOrderToDb(
                { name: formData.name, phone: formData.phone, address: formData.address, notes: formData.notes },
                items.map(item => ({
                    id: item.id, name: item.name, quantity: item.quantity,
                    price: item.is_on_sale ? item.price - (item.price * (item.discount || 0) / 100) : item.price,
                    image: item.image
                })),
                discountedTotal, "pending_payment", appliedCoupon?.code || "", discountAmount, user?.id
            );
            if (!result.success) throw new Error(result.error);

            const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: gatewayConfig.api_key }),
            });
            const authData = await authRes.json();
            if (!authData.token) throw new Error('Paymob auth failed');

            const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: authData.token,
                    delivery_needed: false,
                    amount_cents: Math.round(discountedTotal * 100),
                    currency: 'EGP',
                    merchant_order_id: String(result.orderId),
                    items: [],
                }),
            });
            const orderData = await orderRes.json();

            const payKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: authData.token,
                    amount_cents: Math.round(discountedTotal * 100),
                    expiration: 3600,
                    order_id: orderData.id,
                    billing_data: {
                        first_name: formData.name || 'Customer',
                        last_name: 'N/A', email: 'NA@email.com',
                        phone_number: formData.phone,
                        apartment: 'NA', floor: 'NA', street: 'NA',
                        building: 'NA', shipping_method: 'NA', postal_code: 'NA',
                        city: 'Cairo', country: 'EGY', state: 'Egypt',
                    },
                    currency: 'EGP',
                    integration_id: parseInt(walletIntegrationId),
                }),
            });
            const payKeyData = await payKeyRes.json();
            if (!payKeyData.token) throw new Error('Payment key failed');

            const walletRes = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: { identifier: formData.phone, subtype: 'WALLET' },
                    payment_token: payKeyData.token,
                }),
            });
            const walletData = await walletRes.json();

            if (walletData.redirect_url) {
                clearCart();
                window.location.href = walletData.redirect_url;
            } else {
                throw new Error('لم يتم الحصول على رابط الدفع');
            }
        } catch (error: any) {
            toast.error('خطأ في الدفع بالمحفظة: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Main Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.confirm_email) return; // Honeypot
        if (!formData.name || !formData.phone) {
            toast.error("يرجى ملء الاسم ورقم الهاتف أولاً");
            return;
        }

        const gatewayConfig = enabledGateways.find(g => g.id === selectedPayment);

        switch (selectedPayment) {
            case 'whatsapp':
                await handleWhatsAppSubmit();
                break;
            case 'paymob':
                await handlePaymobSubmit(gatewayConfig);
                break;
            case 'paymob_wallet':
                await handleWalletSubmit(gatewayConfig);
                break;
            case 'fawry':
                toast.info("بوابة فوري قريباً - سيتم تفعيلها قريباً!");
                break;
            case 'cod':
            default:
                await handleCodSubmit();
                break;
        }
    };

    if (isSuccess) {
        const waNumber = selectedBranch?.whatsapp_number || SITE_CONFIG.whatsappNumber;
        const waLink = getWhatsAppLink(waNumber, waMessage);
        
        // Add a small helper to handle the fallback if deep link fails (mostly for mobile)
        const handleWhatsAppClick = () => {
            const start = Date.now();
            window.location.href = waLink;
            
            // If after 500ms the page is still visible, it means the deep link might have failed
            // (e.g., app not installed). We then fallback to the universal link.
            setTimeout(() => {
                if (Date.now() - start < 1000) {
                    const universalLink = `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`;
                    window.open(universalLink, '_blank');
                }
            }, 500);
        };

        return (
            <div className="min-h-screen flex flex-col font-tajawal rtl">
                <Header />
                <main className="flex-grow flex items-center justify-center pt-24 md:pt-28 pb-20 px-4">
                    <div className="text-center animate-in zoom-in duration-500 max-w-lg">
                        <div className="bg-green-100 p-6 rounded-full inline-block mb-6">
                            <CheckCircle2 className="h-20 w-20 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-saada-brown mb-4">تم تسجيل طلبك بنجاح!</h1>
                        
                        {waMessage ? (
                            <div className="space-y-6">
                                <p className="text-gray-600 mb-6 font-medium">
                                    شكراً لاختيارك الدفع عبر واتساب. الخطوة الأخيرة هي إرسال تفاصيل طلبك لخدمة العملاء من خلال الزر أدناه.
                                </p>
                                <Button
                                    onClick={handleWhatsAppClick}
                                    className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full py-8 text-xl rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                                >
                                    <MessageCircle className="h-7 w-7" />
                                    إرسال الطلب عبر واتساب الآن
                                </Button>
                                <button 
                                    onClick={() => navigate("/")}
                                    className="text-gray-500 text-sm hover:underline font-bold"
                                >
                                    العودة للمتجر
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-8 mx-auto">
                                    تم استلام طلبك. سنقوم بمراجعته والتواصل معك عبر الهاتف لتأكيد الشحن في أقرب وقت ممكن.
                                </p>
                                <Button
                                    onClick={() => navigate("/")}
                                    className="bg-saada-red hover:bg-saada-brown text-white px-10 py-6 text-lg rounded-xl transition-all"
                                >
                                    العودة للرئيسية
                                </Button>
                            </>
                        )}
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

                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Left: Form */}
                                <div className="space-y-6">
                                    {/* Shipping Info */}
                                    <div className="bg-white p-8 rounded-2xl shadow-md">
                                        <h2 className="text-xl font-bold text-saada-brown mb-6 flex items-center gap-2">
                                            <User className="h-5 w-5 text-saada-red" />
                                            بيانات الشحن
                                        </h2>

                                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                                            {/* Honeypot */}
                                            <div className="hidden" aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                                                <input type="text" name="confirm_email" tabIndex={-1} value={formData.confirm_email} onChange={handleInputChange} autoComplete="off" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                                                <div className="relative">
                                                    <input
                                                        required name="name" value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-saada-red focus:bg-white outline-none transition-all"
                                                        placeholder="هاني المصري"
                                                    />
                                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    رقم الهاتف
                                                    {selectedPayment === 'paymob_wallet' && (
                                                        <span className="text-saada-red font-bold"> (رقم المحفظة)</span>
                                                    )}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        required type="tel" name="phone" value={formData.phone}
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
                                                        required name="address" value={formData.address}
                                                        onChange={handleInputChange} rows={3}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-saada-red focus:bg-white outline-none transition-all"
                                                        placeholder="المدينة، الحي، الشارع، رقم العمارة..."
                                                    />
                                                    <MapPin className="absolute right-3 top-4 h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية (اختياري)</label>
                                                <textarea
                                                    name="notes" value={formData.notes}
                                                    onChange={handleInputChange} rows={2}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-saada-red focus:bg-white outline-none transition-all"
                                                    placeholder="أي تفاصيل أخرى بخصوص الطلب أو التوصيل..."
                                                />
                                            </div>
                                        </form>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="bg-white p-8 rounded-2xl shadow-md">
                                        <h2 className="text-xl font-bold text-saada-brown mb-6 flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-saada-red" />
                                            طريقة الدفع
                                        </h2>

                                        {gatewaysLoading ? (
                                            <div className="flex items-center justify-center py-8 gap-3 text-gray-400">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span className="font-medium">جاري تحميل طرق الدفع...</span>
                                            </div>
                                        ) : enabledGateways.length === 0 ? (
                                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                                <p className="text-sm font-medium text-amber-700">
                                                    لا توجد طرق دفع مفعّلة. تواصل مع الإدارة.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {enabledGateways.map((gateway) => (
                                                    <div key={gateway.id} className="space-y-3">
                                                        <label
                                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                                                selectedPayment === gateway.id
                                                                    ? 'border-saada-red bg-saada-red/5 shadow-sm'
                                                                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="payment"
                                                                value={gateway.id}
                                                                checked={selectedPayment === gateway.id}
                                                                onChange={() => setSelectedPayment(gateway.id as PaymentMethodId)}
                                                                className="sr-only"
                                                            />
                                                            <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                                                selectedPayment === gateway.id ? 'border-saada-red' : 'border-gray-300'
                                                            }`}>
                                                                {selectedPayment === gateway.id && (
                                                                    <div className="h-2.5 w-2.5 rounded-full bg-saada-red" />
                                                                )}
                                                            </div>
                                                            <span className="text-2xl">{gateway.logo}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-bold text-sm ${selectedPayment === gateway.id ? 'text-saada-red' : 'text-gray-800'}`}>
                                                                    {gateway.name_ar}
                                                                </p>
                                                                <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">
                                                                    {gateway.description_ar}
                                                                </p>
                                                            </div>
                                                        </label>

                                                        {/* Branch Selector - Visible only when WhatsApp is selected */}
                                                        {selectedPayment === 'whatsapp' && gateway.id === 'whatsapp' && (
                                                            <div className="mr-9 p-4 bg-white rounded-xl border border-dashed border-saada-red/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                <p className="text-xs font-bold text-saada-brown flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3 text-saada-red" />
                                                                    اختر الفرع الأقرب إليك:
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {branches.length > 0 ? (
                                                                        branches.map((branch) => (
                                                                            <button
                                                                                key={branch.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    selectBranch(branch);
                                                                                    toast.success(`تم اختيار ${branch.name}`);
                                                                                }}
                                                                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                                                    selectedBranch?.id === branch.id
                                                                                        ? 'bg-saada-red text-white border-saada-red shadow-md ring-2 ring-saada-red/20'
                                                                                        : 'bg-white text-gray-600 border-gray-100 hover:border-saada-red/50 hover:bg-white shadow-sm'
                                                                                }`}
                                                                            >
                                                                                {branch.name}
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="col-span-2 text-center py-2 text-xs text-gray-400">
                                                                            جاري تحميل الفروع...
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Order Summary */}
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
                                                                <span className="text-gray-500">{item.quantity} × {formatPrice(itemPrice)}</span>
                                                                <span className="font-bold text-saada-red">{formatPrice(item.quantity * itemPrice)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-saada-brown text-white p-6 rounded-2xl shadow-lg">
                                        {appliedCoupon && (
                                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-saada-orange" />
                                                    <span className="text-sm">الكود: {appliedCoupon.code}</span>
                                                </div>
                                                <span className="text-sm font-bold text-saada-orange">-{discountAmount} ج.م</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="opacity-80">الإجمالي {appliedCoupon ? "بعد الخصم" : "الكلي"}</span>
                                            <div className="text-right">
                                                {appliedCoupon && (
                                                    <div className="text-[10px] line-through opacity-50 mb-1">{formatPrice(totalPrice)}</div>
                                                )}
                                                <span className="text-2xl font-bold">{formatPrice(discountedTotal)}</span>
                                            </div>
                                        </div>

                                        {/* Selected payment summary */}
                                        {selectedPayment && (
                                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                                                <span className="text-sm opacity-70">طريقة الدفع:</span>
                                                <span className="text-sm font-bold">
                                                    {enabledGateways.find(g => g.id === selectedPayment)?.logo}{' '}
                                                    {enabledGateways.find(g => g.id === selectedPayment)?.name_ar}
                                                </span>
                                            </div>
                                        )}

                                        <p className="text-[10px] opacity-60 text-center mt-4">
                                            بضغطك على تأكيد الطلب أنت توافق على شروط وأحكام متجر صناع السعادة
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        form="checkout-form"
                                        type="submit"
                                        disabled={isSubmitting || enabledGateways.length === 0}
                                        className={`w-full py-7 text-lg md:text-xl rounded-xl shadow-lg transition-all hover:scale-[1.01] ${
                                            selectedPayment === 'whatsapp'
                                                ? 'bg-[#25D366] hover:bg-[#128C7E]'
                                                : 'bg-saada-red hover:bg-saada-brown'
                                        } text-white`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-6 w-6 ml-2 animate-spin" />
                                                جاري معالجة الطلب...
                                            </>
                                        ) : selectedPayment === 'whatsapp' ? (
                                            <><MessageCircle className="h-6 w-6 ml-2" /> أكمل الطلب عبر واتساب</>
                                        ) : selectedPayment === 'cod' ? (
                                            'تأكيد الطلب - الدفع عند الاستلام'
                                        ) : selectedPayment === 'paymob' ? (
                                            <><Zap className="h-5 w-5 ml-2" /> ادفع الآن ببطاقتك البنكية</>
                                        ) : selectedPayment === 'paymob_wallet' ? (
                                            <><Zap className="h-5 w-5 ml-2" /> ادفع بمحفظتك الإلكترونية</>
                                        ) : selectedPayment === 'fawry' ? (
                                            <><Zap className="h-5 w-5 ml-2" /> أكمل الدفع عبر فوري</>
                                        ) : (
                                            'تأكيد الطلب'
                                        )}
                                    </Button>
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
