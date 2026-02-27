
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle } from "lucide-react";
import { cleanProductName } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/constants";
import { saveOrderToDb } from "@/lib/orders";
import { toast } from "sonner";

const CartPage = () => {
    const { items, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCart();
    const navigate = useNavigate();

    const totalPrice = getTotalPrice();
    const itemCount = getItemCount();

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center font-tajawal rtl pt-24 md:pt-28">
                    <div className="text-center py-20 px-4">
                        <div className="bg-gray-100 p-8 rounded-full inline-block mb-6">
                            <ShoppingBag className="h-16 w-16 text-gray-300" />
                        </div>
                        <h1 className="text-2xl font-bold text-saada-brown mb-4">سلة التسوق فارغة</h1>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            يبدو أنك لم تضف أي منتجات إلى السلة بعد. استكشف تشكيلتنا الرائعة وابدأ التسوق الآن!
                        </p>
                        <Link to="/">
                            <Button size="lg" className="bg-saada-red hover:bg-saada-brown text-white px-8">
                                ابدأ التسوق
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>سلة التسوق - صناع السعادة</title>
            </Helmet>
            <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50">
                <Header />
                <main className="flex-grow pt-24 md:pt-28 pb-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl font-bold text-saada-brown mb-8">سلة التسوق ({itemCount})</h1>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* قائمة المنتجات */}
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => {
                                    const itemPrice = item.is_on_sale
                                        ? item.price - (item.price * (item.discount || 0) / 100)
                                        : item.price;

                                    return (
                                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            </div>

                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-xs text-saada-red font-medium">{item.category_name}</span>
                                                        <Link to={`/products/${item.id}`}>
                                                            <h3 className="font-bold text-saada-brown hover:text-saada-red transition-colors line-clamp-1">{cleanProductName(item.name)}</h3>
                                                        </Link>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1 hover:bg-white rounded-md transition-colors"
                                                        >
                                                            <Minus className="h-4 w-4 text-saada-brown" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                            className="w-16 text-center font-bold text-saada-brown bg-transparent border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-white rounded-md transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4 text-saada-brown" />
                                                        </button>
                                                    </div>

                                                    <div className="text-left">
                                                        <span className="font-bold text-saada-red">{(itemPrice * item.quantity).toFixed((itemPrice * item.quantity) % 1 === 0 ? 0 : 1)} ج.م</span>
                                                        {item.quantity > 1 && (
                                                            <p className="text-[10px] text-gray-400">{itemPrice.toFixed(itemPrice % 1 === 0 ? 0 : 1)} ج.م للقطعة</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="flex justify-between pt-4">
                                    <Link to="/">
                                        <Button variant="ghost" className="text-saada-brown hover:text-saada-red">
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                            مواصلة التسوق
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* ملخص الطلب */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-6 rounded-2xl shadow-md sticky top-32">
                                    <h2 className="text-xl font-bold text-saada-brown mb-6">ملخص الطلب</h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>إجمالي المنتجات</span>
                                            <span>{totalPrice.toFixed(totalPrice % 1 === 0 ? 0 : 1)} ج.م</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>تخصيص التوصيل</span>
                                            <span className="text-green-600 font-medium">مجاني</span>
                                        </div>
                                        <div className="border-t pt-4 flex justify-between items-center">
                                            <span className="text-lg font-bold text-saada-brown">الإجمالي كلياً</span>
                                            <span className="text-2xl font-bold text-saada-red">{totalPrice.toFixed(totalPrice % 1 === 0 ? 0 : 1)} ج.م</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Link to="/checkout">
                                            <Button className="w-full bg-saada-red hover:bg-saada-brown text-white py-6 text-lg rounded-xl shadow-lg shadow-saada-red/20 transition-all hover:scale-[1.02]">
                                                إتمام الطلب (الدفع الإلكتروني)
                                            </Button>
                                        </Link>

                                        <Button
                                            onClick={async () => {
                                                try {
                                                    const cartDetails = items.map(item => {
                                                        const basePrice = item.price || 0;
                                                        const discount = item.discount || 0;
                                                        const price = item.is_on_sale ? basePrice - (basePrice * discount / 100) : basePrice;
                                                        const subTotal = price * item.quantity;
                                                        return `• *${cleanProductName(item.name)}*\n  العدد/الوزن: ${item.quantity}\n  السعر: ${subTotal.toFixed(subTotal % 1 === 0 ? 0 : 1)} ج.م`;
                                                    }).join('\n\n');

                                                    // الحفظ في قاعدة البيانات كمسودة
                                                    const orderItems = items.map(item => ({
                                                        id: item.id,
                                                        name: item.name,
                                                        quantity: item.quantity,
                                                        price: item.is_on_sale ? item.price - (item.price * (item.discount || 0) / 100) : item.price,
                                                        image: item.image
                                                    }));

                                                    const roundedTotal = Math.round(totalPrice * 100) / 100;

                                                    const result = await saveOrderToDb(
                                                        { name: "عميل واتساب سريع", phone: "01000000000" },
                                                        orderItems,
                                                        roundedTotal,
                                                        "pending"
                                                    );

                                                    if (!result.success) {
                                                        console.error("Order Save Failed:", result.error);
                                                    }

                                                    const finalOrderId = result.success ? result.orderId : `DRAFT${Date.now()}`;
                                                    const orderNum = `(رقم #${finalOrderId})`;

                                                    let invoiceUrl = `${window.location.origin}/order-preview/${finalOrderId}`;
                                                    if (!result.success) {
                                                        const itemsParam = orderItems.map(i => `${i.id}-${i.quantity}`).join('_');
                                                        invoiceUrl += `?t=${roundedTotal}&i=${itemsParam}`;
                                                    }

                                                    const message = encodeURIComponent(
                                                        `🛒 *طلب جديد من السلة ${orderNum}* 🛒\n\n` +
                                                        `${cartDetails}\n\n` +
                                                        `💰 *الإجمالي الكلي:* ${roundedTotal.toFixed(roundedTotal % 1 === 0 ? 0 : 1)} ج.م\n\n` +
                                                        `📄 *إضغط لعرض الفاتورة:* \n\n${invoiceUrl}\n\n` +
                                                        `مرحباً صناع السعادة، أود إتمام هذا الطلب.`
                                                    );

                                                    const waLink = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${message}`;
                                                    window.open(waLink, '_blank');
                                                } catch (err) {
                                                    console.error("WhatsApp Button Error:", err);
                                                    toast.error("حدث خطأ غير متوقع. جرب مرة أخرى.");
                                                }
                                            }}
                                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-6 text-lg rounded-xl shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            <span>أرسل الطلب عبر واتساب</span>
                                        </Button>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                            <span>الدفع عند الاستلام متاح</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                            <span>توصيل سريع خلال 24-48 ساعة</span>
                                        </div>
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

export default CartPage;
