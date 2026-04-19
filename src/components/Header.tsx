import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, ShoppingCart, Menu, User, X, Search, Heart, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, MessageCircle, Moon, RefreshCw, Tag, Ticket as TicketIcon, CheckCircle2 as CheckCircleIcon } from "lucide-react";
import LiveVisitors from "./LiveVisitors";
import { useAnalytics } from "@/hooks/use-analytics";
import { SITE_CONFIG } from "@/lib/constants";
import { cn, cleanProductName, formatPrice, cleanImageUrl, copyToClipboard, getWhatsAppLink } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { saveOrderToDb } from "@/lib/orders";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useBranchContext } from "@/context/BranchContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { branches, selectedBranch, selectBranch, detectLocation } = useBranchContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { items, removeItem, updateQuantity, getTotalPrice, getDiscountedTotal, getItemCount, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'editor';
  const { logEvent } = useAnalytics();
  const [isWiggling, setIsWiggling] = useState(false);
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart Wiggle Effect
  useEffect(() => {
    if (itemCount > 0) {
      setIsWiggling(true);
      const timer = setTimeout(() => setIsWiggling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  const totalPrice = getTotalPrice();
  const discountedTotal = getDiscountedTotal();
  const [couponInput, setCouponInput] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
      setSearchQuery("");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponInput.trim().toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("كود الخصم غير صحيح أو منتهي");
        return;
      }

      applyCoupon(data);
      toast.success("تم تطبيق الخصم بنجاح!");
      setCouponInput("");
    } catch (err) {
      toast.error("خطأ في التحقق من الكود");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const [dynamicNavLinks, setDynamicNavLinks] = useState<{name: string, path: string}[]>([
    { name: "الرئيسية", path: "/" }
  ]);

  useEffect(() => {
    const fetchNavCategories = async () => {
      try {
        // Fetch ALL categories and products for counting
        const { data: cats, error: catError } = await supabase
          .from("categories")
          .select("*");
        
        const { data: prods } = await supabase
          .from("products")
          .select("category_id")
          .gt("stock", 0)
          .gt("price", 0);

        if (catError) throw catError;

        if (cats) {
          const productList = prods || [];
          const links = cats
            .filter((cat) => {
              const isRoot = !cat.parent_id;
              const label = (cat.label || "").toLowerCase();
              const isAccounting = cat.id === "no-tax" || label.includes("ضريبة") || label.includes("محاسب");
              const isHiddenOnWeb = label.includes("[hide_on_web]");
              
              if (!isRoot || isAccounting || isHiddenOnWeb) return false;

              // Min 4 products rule
              const descendants = [cat.id];
              const children = cats.filter(c => c.parent_id === cat.id);
              descendants.push(...children.map(c => c.id));
              const count = productList.filter(p => descendants.includes(p.category_id)).length;

              return count >= 4;
            })
            // Sort by order_index if it exists
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            .map(cat => ({
              name: (cat.label || "").replace(/\[HIDE_ON_WEB\]/gi, "").trim(),
              path: `/categories/${cat.id}`
            }));
          
          const baseLinks = [{ name: "الرئيسية", path: "/" }];
          const finalLinks = [...baseLinks, ...links];
          
          if (user && user.role === 'customer') {
            finalLinks.push({ name: "طلباتي", path: "/my-orders" });
          }
          
          setDynamicNavLinks(finalLinks);
        }
      } catch (err) {
        console.error("Nav links fetch error:", err);
      }
    };

    fetchNavCategories();
  }, [user]);

  const navLinks = dynamicNavLinks;

  return (
    <>
      <header className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-500 font-tajawal rtl",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border-b border-primary/5"
          : "bg-white/80 backdrop-blur-md"
      )}>
        <div className="border-b border-primary/5">
          <div className="container mx-auto px-4 md:px-8 h-14 md:h-20 flex items-center justify-between gap-4 md:gap-12">
            <Link 
              to="/" 
              onDoubleClick={() => navigate("/admin")}
              className="group flex items-center gap-2 md:gap-3 shrink-0 relative transition-transform hover:scale-[1.02] cursor-pointer selection:bg-transparent"
              title="Happiness Makers"
            >
              <div className="relative h-9 w-9 md:h-13 md:w-13 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] group-hover:shadow-secondary/20 group-hover:rotate-6 transition-all duration-500 overflow-hidden border border-primary/5">
                <img
                  src={SITE_CONFIG.logoPath}
                  alt={SITE_CONFIG.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[17px] md:text-2xl font-black leading-tight tracking-tight text-primary flex items-center gap-1">
                    {SITE_CONFIG.name.slice(0, 3)}<span className="text-[#f31b3e] drop-shadow-[0_0_12px_rgba(243,27,62,0.4)]">{SITE_CONFIG.name.slice(3, 4)}</span>{SITE_CONFIG.name.slice(4)}
                  </span>
                </div>
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.25em] font-outfit text-secondary font-bold leading-none">{SITE_CONFIG.englishName}</span>
              </div>
            </Link>

            {/* Branch Selector - Hidden for Customers as requested */}
            {isAdmin && (
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 md:h-12 px-3 md:px-4 rounded-2xl flex items-center gap-2 text-primary hover:bg-primary/5 transition-all">
                      <div className="h-8 w-8 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold text-muted-foreground leading-tight">الفرع الأقرب</span>
                        <span className="text-sm font-black text-primary leading-tight flex items-center gap-1">
                          {selectedBranch ? selectedBranch.name : "اختر الفرع"}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white rounded-2xl shadow-2xl border-primary/5 font-tajawal rtl p-2">
                    <div className="px-3 py-2 text-[10px] font-black text-secondary uppercase tracking-widest border-b border-primary/5 mb-1">
                      فروعنا في مصر
                    </div>
                    {branches.map(branch => (
                      <DropdownMenuItem 
                        key={branch.id} 
                        onClick={() => selectBranch(branch)}
                        className={cn(
                          "rounded-xl h-12 px-4 font-bold flex items-center justify-between cursor-pointer transition-all",
                          selectedBranch?.id === branch.id ? "bg-primary text-white" : "hover:bg-primary/5 text-primary"
                        )}
                      >
                        <span>{branch.name}</span>
                        {selectedBranch?.id === branch.id && <MapPin className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                    <div className="mt-2 p-2 pt-1 border-t border-primary/5">
                      <Button 
                        variant="ghost" 
                        onClick={detectLocation}
                        className="w-full justify-start h-10 px-2 rounded-lg text-xs font-bold text-secondary hover:bg-secondary/10"
                      >
                        <RefreshCw className="h-3 w-3 ml-2" />
                        تحديد أقرب فرع آلياً
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="hidden lg:block">
              <LiveVisitors />
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl relative group items-center lg:mx-8">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-0 group-focus-within:blur-md group-focus-within:bg-secondary/10 transition-all duration-500" />
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="ابحث عن السعادة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e as any)}
                  className="w-full bg-white/80 border border-primary/10 hover:border-secondary/30 focus:border-secondary/50 focus:bg-white py-3.5 pr-14 pl-5 rounded-2xl text-primary font-bold placeholder-primary/40 focus:outline-none transition-all shadow-[0_2px_15px_rgba(0,0,0,0.02)] focus:shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-0 focus:ring-4 focus:ring-secondary/5"
                />
                <Search className="absolute right-5 h-5 w-5 text-primary/30 group-focus-within:text-secondary group-focus-within:scale-110 transition-all" />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <Link to={user ? (user.role === 'admin' || user.role === 'editor' ? "/admin" : "/my-orders") : "/login"} className="hidden sm:block">
                <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 text-primary hover:bg-secondary/10 hover:text-secondary rounded-2xl transition-all border border-transparent hover:border-secondary/20">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              <Sheet onOpenChange={(open) => open && logEvent('cart_view', { items_count: itemCount })}>
                <SheetTrigger asChild>
                  <Button
                    className={cn(
                      "relative h-10 w-10 md:h-12 md:w-auto md:px-7 bg-primary hover:bg-black text-white rounded-xl md:rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-105 active:scale-95 group flex items-center justify-center md:gap-3 border-b-4 border-black/20 p-0 md:p-auto",
                      isWiggling && "animate-wiggle scale-110 shadow-secondary/50"
                    )}
                  >
                    <ShoppingCart className={cn("h-5 w-5 group-hover:rotate-12 transition-transform", isWiggling && "text-secondary")} />
                    <span className="text-[15px] font-black hidden lg:inline tracking-tight">سلة السعادة</span>
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-secondary text-primary text-[10px] font-black rounded-lg px-1.5 h-5 min-w-[20px] flex items-center justify-center shadow-lg border-2 border-white animate-bounce-slow">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-full sm:max-w-md border-r-0 bg-[#fdfdfd] p-0 flex flex-col font-tajawal rtl overflow-hidden">
                  <SheetHeader className="p-8 bg-primary text-white space-y-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
                    <div className="relative flex items-center justify-between">
                      <SheetTitle className="text-3xl font-black italic text-white flex items-center gap-3">
                        <ShoppingBag className="h-7 w-7 text-secondary" />
                        سلة سعادتك
                      </SheetTitle>
                    </div>
                    <p className="relative text-white/50 text-xs font-black uppercase tracking-[0.2em] italic">
                      Premium selection for you
                    </p>
                  </SheetHeader>

                  <ScrollArea className="flex-grow p-6">
                    {items.length === 0 ? (
                      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-32 w-32 bg-primary/5 rounded-[3rem] flex items-center justify-center rotate-3 animate-pulse">
                          <ShoppingBag className="h-16 w-16 text-primary/10" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-primary font-black text-2xl">السلة بانتظار سعادتك</p>
                          <p className="text-muted-foreground text-sm font-medium">ابدأ الآن بإضافة قطع فريدة إلى مجموعتك</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl border-2 font-bold px-8 h-12" onClick={() => setIsMenuOpen(false)}>
                          ابدأ التسوق
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6 pb-20">
                        {items.map((item) => {
                          const basePrice = item.price || 0;
                          const discount = item.discount || 0;
                          const quantity = item.quantity || 1;
                          const price = item.is_on_sale ? basePrice - (basePrice * discount / 100) : basePrice;

                          return (
                            <div key={item.id} className="flex gap-5 p-4 rounded-3xl bg-white border border-primary/5 hover:border-secondary/30 transition-all group/item shadow-sm">
                              <div className="h-24 w-24 rounded-2xl bg-[#f9f9f9] border border-primary/5 overflow-hidden flex-shrink-0 relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                                />
                                {item.is_on_sale && (
                                  <div className="absolute top-1 right-1 bg-secondary text-primary text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">
                                    خصم
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow flex flex-col justify-between py-1">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-secondary/70 uppercase tracking-widest">{item.category_name}</span>
                                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <h4 className="font-black text-primary text-lg leading-tight group-hover/item:text-secondary transition-colors underline-offset-4 decoration-secondary/30">{cleanProductName(item.name || "منتج")}</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-xl text-primary">{formatPrice(price * quantity)}</span>
                                  <div className="flex items-center gap-3 bg-primary/5 rounded-2xl px-3 py-1.5 border border-primary/5">
                                    <button onClick={() => updateQuantity(item.id, Math.max(0, quantity - 1))} className="text-primary hover:text-secondary transition-transform active:scale-75">
                                      <Minus className="h-4 w-4 stroke-[3px]" />
                                    </button>
                                    <input
                                      type="number"
                                      value={quantity}
                                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                      className="w-12 text-center text-[15px] font-black bg-transparent border-none focus:outline-none focus:ring-0 text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button onClick={() => updateQuantity(item.id, quantity + 1)} className="text-primary hover:text-secondary transition-transform active:scale-75">
                                      <Plus className="h-4 w-4 stroke-[3px]" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {items.length > 0 && (
                    <div className="p-8 bg-white border-t-2 border-primary/5 space-y-5 shadow-[0_-20px_40px_rgba(0,0,0,0.03)] rounded-t-[2.5rem]">
                      {/* Coupon Section */}
                      {appliedCoupon ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                              <TicketIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-emerald-900 font-black text-sm">{appliedCoupon.code}</p>
                              <p className="text-emerald-600 text-[10px] font-bold">
                                خصم {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value} ج.م`}
                              </p>
                            </div>
                          </div>
                          <button onClick={removeCoupon} className="text-emerald-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-primary/5 focus-within:border-secondary/30 transition-all">
                          <div className="relative flex-grow">
                            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
                            <input
                              type="text"
                              placeholder="هل لديك كود خصم؟"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              className="w-full bg-transparent border-none py-2.5 pr-10 pl-4 text-sm font-bold placeholder-primary/30 focus:outline-none"
                            />
                          </div>
                          <Button
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon || !couponInput.trim()}
                            className="h-10 px-6 bg-primary hover:bg-black text-white rounded-xl font-bold text-xs"
                          >
                            {isValidatingCoupon ? <RefreshCw className="h-4 w-4 animate-spin" /> : "تطبيق"}
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground font-black text-xs uppercase tracking-widest">الإجمالي الكلي</span>
                          <span className="text-primary/40 text-[10px] font-bold">
                            {appliedCoupon ? "السعر بعد الخصم" : "شامل كافة الرسوم"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          {appliedCoupon && (
                            <span className="text-sm text-gray-400 line-through font-bold">{formatPrice(totalPrice)}</span>
                          )}
                          <span className="text-4xl font-black text-primary tracking-tighter">{formatPrice(discountedTotal)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <Button
                          asChild
                          className="w-full h-15 bg-primary hover:bg-black text-white rounded-[1.25rem] text-xl font-black shadow-[0_15px_30px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 active:scale-[0.98] group flex items-center justify-center gap-4 overflow-hidden relative"
                        >
                          <Link to="/checkout">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span>إتمام الطلب الآن</span>
                            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-2 transition-transform" />
                          </Link>
                        </Button>

                        <Button
                          onClick={async () => {
                            try {
                              const cartDetails = items.map(item => {
                                const basePrice = item.price || 0;
                                const discount = item.discount || 0;
                                const price = item.is_on_sale ? basePrice - (basePrice * discount / 100) : basePrice;
                                const itemTotal = price * item.quantity;
                                return `• *${cleanProductName(item.name)}*\n  العدد: ${item.quantity}\n  السعر: ${formatPrice(itemTotal)}`;
                              }).join('\n\n');

                              const discountAmount = totalPrice - discountedTotal;
                              const roundedTotal = Math.round(discountedTotal);
                              const orderItems = items.map(item => ({
                                id: item.id,
                                quantity: item.quantity,
                                price: item.is_on_sale ? item.price - (item.price * (item.discount || 0) / 100) : item.price,
                                image: item.image,
                                name: item.name
                              }));

                              const result = await saveOrderToDb(
                                { name: user?.username || "عميل عبر الواتساب", phone: "يُرجى مراجعة رسالة الواتس اب" },
                                orderItems,
                                roundedTotal,
                                "pending",
                                appliedCoupon?.code || "",
                                discountAmount,
                                user?.id
                              );

                              const finalOrderId = result.success ? result.orderId : `DRAFT${Date.now()}`;
                              const trackingId = result.success ? (result.trackingCode || result.orderId) : finalOrderId;
                              const orderNum = `(رقم #${finalOrderId})`;

                              let invoiceUrl = `${window.location.origin}/order-preview/${trackingId}`;
                              if (!result.success) {
                                const itemsParam = orderItems.map(i => `${i.id}-${i.quantity}`).join('_');
                                invoiceUrl += `?t=${roundedTotal}&i=${itemsParam}`;
                                if (appliedCoupon) {
                                  invoiceUrl += `&c=${appliedCoupon.code}&d=${discountAmount}`;
                                }
                              }

                              const message = encodeURIComponent(
                                `🛍️ *طلب جديد من ${selectedBranch?.name || "المتجر"} ${orderNum}* 🛍️\n\n` +
                                `${cartDetails}\n\n` +
                                (appliedCoupon ? `🎟️ *كود الخصم:* ${appliedCoupon.code} (-${formatPrice(discountAmount)})\n\n` : "") +
                                `💰 *الإجمالي:* ${formatPrice(roundedTotal)}\n\n` +
                                `📄 *رابط معاينة الفاتورة:* \n\n${invoiceUrl}\n\n` +
                                `مرحباً فرع ${selectedBranch?.name || "صناع السعادة"}، أود إتمام هذا الطلب من المتجر.`
                              );
                              const whatsappNumber = selectedBranch?.whatsapp_number || SITE_CONFIG.whatsappNumber;
                              const waLink = getWhatsAppLink(whatsappNumber, decodeURIComponent(message));
                              
                              const start = Date.now();
                              window.location.href = waLink;
                              
                              setTimeout(() => {
                                  if (Date.now() - start < 1000) {
                                      window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
                                  }
                              }, 500);
                            } catch (err) {
                              console.error("WhatsApp Error:", err);
                              toast.error("حدث خطأ في الاتصال.");
                            }
                          }}
                          className="w-full h-15 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-[1.25rem] text-xl font-black shadow-[0_15px_30px_rgba(37,211,102,0.2)] flex items-center justify-center gap-4 transition-all hover:-translate-y-1 active:scale-[0.98]"
                        >
                          <MessageCircle className="h-6 w-6 animate-pulse" />
                          <span>تأكيد عبر واتساب</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-11 w-11 text-primary hover:bg-secondary/10 hover:text-secondary rounded-2xl transition-all"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-11 w-11 text-primary hover:bg-primary/5 rounded-2xl transition-all"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Category Navigation - STREAMLINED */}
        <div className="lg:hidden bg-white/70 backdrop-blur-md border-b border-primary/5 overflow-x-auto shadow-sm no-scrollbar">
          <div className="flex items-center gap-1.5 px-3 py-1 min-w-max">
            {navLinks.map((link, idx) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={`${link.path}-${idx}`}
                  to={link.path}
                  className={cn(
                    "px-3 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border-b-2 shadow-sm",
                    isActive
                      ? "bg-primary text-white border-secondary scale-105 shadow-primary/20"
                      : "bg-white/80 text-primary/70 border-transparent hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block bg-white/40 border-b border-primary/5">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-1 xl:gap-2 py-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "relative px-3 xl:px-5 py-2 text-[12px] xl:text-[13px] font-black uppercase tracking-tight xl:tracking-[0.05em] transition-all duration-300 group whitespace-nowrap",
                      isActive ? "text-secondary" : "text-primary/60 hover:text-primary"
                    )}
                  >
                    {link.name}
                    <span className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-secondary rounded-t-full transition-all duration-500",
                      isActive ? "w-8 opacity-100" : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                    )} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 bg-white/98 backdrop-blur-3xl z-[110] flex flex-col transform transition-all duration-1000 ease-out lg:hidden",
        isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="container mx-auto px-8 h-24 flex items-center justify-between">
          <span className="text-xl font-black text-primary">المستكشف</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="h-14 w-14 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        <ScrollArea className="flex-grow px-8 py-4">
          <div className="flex flex-col gap-10">            {isAdmin && (
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">الفرع المختار</span>
                <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{selectedBranch?.name || 'جاري التحديد...'}</h4>
                      <p className="text-[10px] text-primary/40 font-medium">{selectedBranch?.address || 'سيتم اختيار الأقرب تلقائياً'}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/10 bg-white hover:bg-primary/5 text-primary font-bold flex items-center justify-between px-4">
                        <span>تغيير الفرع</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[calc(100vw-80px)] rounded-2xl p-2 border-primary/10">
                      {branches.map((branch) => (
                        <DropdownMenuItem
                          key={branch.id}
                          onClick={() => selectBranch(branch)}
                          className={cn(
                            "rounded-xl h-12 px-4 font-bold transition-all",
                            selectedBranch?.id === branch.id ? "bg-primary text-white" : "hover:bg-primary/5 text-primary"
                          )}
                        >
                          {branch.name}
                        </DropdownMenuItem>
                      ))}
                      <div className="h-px bg-primary/5 my-2" />
                      <DropdownMenuItem
                        onClick={detectLocation}
                        className="rounded-xl h-12 px-4 font-bold text-saada-red hover:bg-saada-red/5 flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        تحديد أقرب فرع تلقائياً
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Sections</span>
              <div className="grid grid-cols-1 gap-3">
                {navLinks.map((link, idx) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-4xl font-black text-primary hover:text-secondary transition-all flex items-center justify-between group"
                    style={{ transitionDelay: `${idx * 40}ms` }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{link.name}</span>
                    <ArrowLeft className="h-6 w-6 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-secondary" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-primary/5 w-full" />

            <div className="flex flex-col gap-6">
              <Link to="/admin" className="flex items-center gap-5 text-xl font-black text-primary/60 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                لوحة التحكم
              </Link>
            </div>
          </div>
        </ScrollArea>

        <div className="p-12 mt-auto bg-primary/2 flex flex-col items-center gap-4 text-center">
          <p className="text-primary/30 text-[10px] font-black tracking-[0.4em] uppercase">Suna Al-Saada • Luxury Retail © 2026</p>
        </div>
      </div>

      {/* Modern Search Overlay */}
      <div className={cn(
        "fixed inset-0 z-[150] bg-primary/98 backdrop-blur-2xl flex flex-col items-center p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] font-tajawal rtl",
        isSearchOpen ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
      )}>
        <button
          className="absolute top-10 left-10 h-16 w-16 text-white/30 hover:text-secondary hover:bg-white/5 rounded-3xl transition-all flex items-center justify-center"
          onClick={() => setIsSearchOpen(false)}
        >
          <X className="h-10 w-10" />
        </button>

        <form onSubmit={handleSearch} className="w-full max-w-4xl mt-[15vh] space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-5xl md:text-8xl font-black text-white leading-tight">عن ماذا تبحث؟</h2>
            <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="اكتب ما يدور بخاطرك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b-[6px] border-white/10 py-8 text-4xl md:text-7xl font-black text-white placeholder-white/5 focus:outline-none focus:border-secondary transition-all"
              autoFocus={isSearchOpen}
            />
            <Button
              type="submit"
              className="absolute left-0 bottom-4 bg-secondary hover:bg-white text-primary rounded-[2rem] h-20 w-20 shadow-3xl transition-all hover:scale-110"
            >
              <Search className="h-10 w-10" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Header;
