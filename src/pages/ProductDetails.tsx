
import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ChevronRight, Loader2, ShieldCheck, Truck, RotateCcw, Star, MessageCircle, Plus, Minus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { cn, cleanProductName, cleanImageUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import { saveOrderToDb } from "@/lib/orders";
import { useAuth } from "@/hooks/use-auth";

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, error } = useProduct(Number(productId));
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'editor';

  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const items = useCart((state) => state.items);

  const handleAddToCart = () => {
    if (product) {
      const cleanName = cleanProductName(product.name);
      addItem(product, quantity);
      toast.success(`تم إضافة ${quantity} من ${cleanName} إلى السلة`, {
        duration: 2500,
        action: {
          label: "عرض السلة",
          onClick: () => window.location.href = '/cart'
        },
        style: { background: 'var(--primary)', color: 'white', borderRadius: '1rem', cursor: 'pointer' },
        onClick: () => window.location.href = '/cart'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col font-tajawal rtl bg-white">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="text-primary font-bold animate-pulse">جاري تحضير تفاصيل المنتج...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product && product.stock <= 0;
  const isInternalItem = product && product.category_id === 'no-tax';

  if (error || !product || ((isOutOfStock || isInternalItem) && !isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col font-tajawal rtl bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32 md:pt-40 pb-20 px-4">
          <div className="text-center p-12 bg-primary/5 rounded-[3rem] border border-primary/10 max-w-lg mx-auto">
            <h1 className="text-3xl font-black text-primary mb-4">
              {isOutOfStock ? "المنتج نفذ من المخزون" : "المنتج غير متوفر حالياً"}
            </h1>
            <p className="text-muted-foreground mb-8 font-medium italic">
              {isOutOfStock
                ? "عذراً، هذا المنتج غير متوفر في الوقت الحالي. سنقوم بتوفيره قريباً."
                : "عذراً، لم نتمكن من العثور على ما تبحث عنه في مجموعتنا المختارة."}
            </p>
            <Link to="/">
              <Button className="bg-primary hover:bg-white hover:text-primary text-white h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all border-2 border-primary">
                العودة للمتجر
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const finalPrice = product.is_on_sale
    ? product.price - (product.price * (product.discount || 0) / 100)
    : product.price;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": cleanProductName(product.name),
    "image": [product.image],
    "description": product.description,
    "sku": product.id.toString(),
    "brand": {
      "@type": "Brand",
      "name": "صناع السعادة"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "EGP",
      "price": finalPrice,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <Helmet>
        <title>{cleanProductName(product.name)} | صناع السعادة</title>
        <meta name="description" content={product.description} />
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col font-tajawal rtl bg-white">
        <Header />
        <main className="flex-grow pt-32 md:pt-40 pb-12">
          <div className="container mx-auto px-4 md:px-8">

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mb-12">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/categories/${product.category_id}`} className="hover:text-primary transition-colors">{product.category_name}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-secondary italic">{cleanProductName(product.name)}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Product Image Stage */}
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-700" />
                <div className="relative bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-primary/5 aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80';
                    }}
                  />
                  {/* Labels */}
                  <div className="absolute top-8 right-8 flex flex-col gap-2">
                    {product.is_new && (
                      <span className="bg-secondary text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl ring-4 ring-white">New</span>
                    )}
                    {product.is_on_sale && (
                      <span className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl ring-4 ring-white">Save {product.discount}%</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-10 py-6">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight">
                    {cleanProductName(product.name)}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">(24 Verified Reviews)</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-4">
                  {product.is_on_sale ? (
                    <>
                      <span className="text-4xl md:text-5xl font-black text-primary">{Number(finalPrice).toFixed(Number(finalPrice) % 1 === 0 ? 0 : 1)} ج.م</span>
                      <span className="text-xl text-muted-foreground line-through italic font-medium">{Number(product.price).toFixed(Number(product.price) % 1 === 0 ? 0 : 1)} ج.م</span>
                    </>
                  ) : (
                    <span className="text-4xl md:text-5xl font-black text-primary">{Number(product.price).toFixed(Number(product.price) % 1 === 0 ? 0 : 1)} ج.م</span>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-lg text-primary/80 font-medium leading-relaxed italic">
                      "{product.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-primary/10 rounded-2xl flex items-center gap-3">
                      <Truck className="h-5 w-5 text-secondary" />
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary">Fast Delivery</div>
                    </div>
                    <div className="p-4 bg-white border border-primary/10 rounded-2xl flex items-center gap-3">
                      <RotateCcw className="h-5 w-5 text-secondary" />
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary">Free Returns</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">الكمية / الوزن</span>
                    <div className="flex items-center bg-primary/5 rounded-2xl p-2 border border-primary/10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 flex items-center justify-center hover:bg-white rounded-xl transition-all text-primary"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center font-black text-xl bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-10 w-10 flex items-center justify-center hover:bg-white rounded-xl transition-all text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="flex-grow h-16 bg-primary hover:bg-white hover:text-primary text-white text-lg font-black rounded-2xl border-2 border-primary shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-6 w-6 ml-3 group-hover:scale-110 transition-transform" />
                    <span>أضف للسلة</span>
                  </Button>

                  <Button
                    onClick={async () => {
                      const cleanPrice = parseFloat(finalPrice.toString().replace(/,/g, ''));
                      const roundedPrice = Math.round(cleanPrice * 100) / 100;

                      const orderItems = [{
                        id: product.id,
                        name: product.name,
                        quantity: 1,
                        price: roundedPrice,
                        image: product.image
                      }];

                      const result = await saveOrderToDb(
                        { name: "عميل واتساب (استفسار منتج)", phone: "01000000000" },
                        orderItems,
                        roundedPrice,
                        "pending"
                      );

                      if (!result.success) {
                        console.error("Order Save Failed:", result.error);
                      }

                      const finalOrderId = result.success ? result.orderId : `DRAFT${Date.now()}`;
                      const orderNum = `(رقم #${finalOrderId})`;

                      let invoiceUrl = `${window.location.origin}/order-preview/${finalOrderId}`;
                      if (!result.success) {
                        const itemsParam = `${product.id}-1`;
                        invoiceUrl += `?t=${roundedPrice}&i=${itemsParam}`;
                      }

                      const message = encodeURIComponent(
                        `🛍️ *طلب منتج جديد ${orderNum}* 🛍️\n\n` +
                        `*المنتج:* ${cleanProductName(product.name)}\n` +
                        `*السعر:* ${Number(roundedPrice).toFixed(Number(roundedPrice) % 1 === 0 ? 0 : 1)} ج.م\n` +
                        `*الرابط:* ${window.location.href}\n` +
                        `*الملف:* ${cleanImageUrl(product.image)}\n\n` +
                        `📄 *إضغط لعرض الفاتورة:* \n\n${invoiceUrl}\n\n` +
                        `مرحباً صناع السعادة، أود استلام هذا المنتج.`
                      );
                      window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${message}`, '_blank');
                    }}
                    variant="outline"
                    className="flex-grow sm:flex-grow-0 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>اطلب عبر واتساب</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-8 rounded-2xl border-2 border-primary/10 hover:border-secondary hover:bg-secondary/5 text-primary transition-all group shadow-sm"
                  >
                    <Heart className="h-6 w-6 group-hover:fill-secondary group-hover:text-secondary transition-colors" />
                  </Button>
                </div>

                <div className="pt-8 border-t border-primary/10 flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    Secured Transaction
                  </div>
                  <div className="h-1 w-1 rounded-full bg-primary/10" />
                  <span>Brand Heritage: Makers of Happiness</span>
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

export default ProductDetails;

