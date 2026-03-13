import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Plus, Star, Share2, MessageCircle, Copy } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { cn, cleanProductName, getShareUrl, copyToClipboard } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  categoryId: string;
  isFeatured?: boolean;
  is_featured?: boolean;
  isNew?: boolean;
  is_new?: boolean;
  isOnSale?: boolean;
  is_on_sale?: boolean;
  discount?: number;
  stock?: number;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  description,
  category,
  categoryId,
  isFeatured = false,
  is_featured = false,
  isNew = false,
  is_new = false,
  isOnSale = false,
  is_on_sale = false,
  discount = 0,
  stock = 0
}: ProductCardProps) => {
  const addItem = useCart((state) => state.addItem);

  const showNew = isNew || is_new;
  const showSale = isOnSale || is_on_sale;
  const showFeatured = isFeatured || is_featured;

  const finalPrice = showSale
    ? price - (price * (discount || 0) / 100)
    : price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cleanName = cleanProductName(name);
    addItem({
      id,
      name: cleanName,
      price,
      image,
      description,
      category_id: categoryId,
      category_name: category,
      is_featured: showFeatured,
      is_new: showNew,
      is_on_sale: showSale,
      discount,
      stock // Add stock to fix type error
    });

    toast.success(`تم إضافة ${cleanName} إلى السلة`, {
      duration: 2500,
      action: {
        label: "عرض السلة",
        onClick: () => window.location.href = '/cart'
      },
      style: { background: 'var(--primary)', color: 'white', borderRadius: '1rem', cursor: 'pointer' }
    });
  };



  const shareToWhatsApp = () => {
    const url = getShareUrl('product', id);
    const cleanName = cleanProductName(name);
    const message = encodeURIComponent(`شوف المنتج الرائع ده من صناع السعادة: ${cleanName}\n${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getShareUrl('product', id);
    const cleanName = cleanProductName(name);
    const shareText = `شوف المنتج الرائع ده من صناع السعادة: ${cleanName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: cleanName,
          text: shareText,
          url: url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          const success = await copyToClipboard(url);
          if (success) toast.success("تم نسخ الرابط");
        }
      }
    } else {
      const success = await copyToClipboard(url);
      if (success) toast.success("تم نسخ رابط المنتج! يمكنك مشاركته الآن.");
    }
  };

  return (
    <div className="group relative bg-card rounded-[1.5rem] md:rounded-[2rem] border border-primary/10 p-2 md:p-3 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 font-tajawal rtl h-full flex flex-col premium-card">

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-[1.25rem] md:rounded-[1.5rem] bg-primary/5">
        <Link to={`/products/${id}`} className="block w-full h-full">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80';
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 transition-transform duration-300 group-hover:scale-105">
          {showSale && (
            <div className="bg-destructive text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
              خصم {discount}%
            </div>
          )}
          {showNew && (
            <div className="bg-secondary text-primary text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
              جديد
            </div>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-10">
          <div className="flex gap-2">
            {/* Mobile: Direct Share */}
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 bg-white/80 backdrop-blur-md rounded-full shadow-xl text-primary hover:bg-secondary hover:text-white transition-colors md:hidden"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>

            {/* Desktop: Dropdown Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 bg-white/80 backdrop-blur-md rounded-full shadow-xl text-primary hover:bg-secondary hover:text-white transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-2 rounded-2xl border-primary/10 shadow-2xl font-tajawal rtl">
                  <DropdownMenuItem onClick={handleShare} className="rounded-xl gap-2 cursor-pointer focus:bg-primary focus:text-white font-bold py-3">
                    <Copy className="h-4 w-4" />
                    مشاركة كـ رابط
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareToWhatsApp} className="rounded-xl gap-2 cursor-pointer focus:bg-emerald-600 focus:text-white font-bold py-3 text-emerald-600">
                    <MessageCircle className="h-4 w-4" />
                    واتسـاب ويب
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 bg-white/80 backdrop-blur-md rounded-full shadow-xl text-primary hover:bg-secondary hover:text-white transition-colors overflow-hidden"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 bg-white/80 backdrop-blur-md rounded-full shadow-xl text-primary hover:bg-secondary hover:text-white transition-colors"
            onClick={handleAddToCart}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-2 md:p-4 flex-grow flex flex-col space-y-1.5 md:space-y-2">
        <div className="flex items-center justify-between">
          <Link to={`/categories/${categoryId}`}>
            <span className="text-[10px] uppercase tracking-wider font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
              {category}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-secondary text-secondary" />
            <span className="text-[10px] font-bold text-muted-foreground">4.8</span>
          </div>
        </div>

        <Link to={`/products/${id}`}>
          <h3 className="font-bold md:font-black text-primary hover:text-secondary transition-colors line-clamp-2 leading-snug text-sm md:text-base">
            {cleanProductName(name)}
          </h3>
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/5">
          <div className="flex flex-col">
            {showSale ? (
              <>
                <span className="text-muted-foreground line-through text-[8px] md:text-[10px] font-bold">{Number(price).toFixed(Number(price) % 1 === 0 ? 0 : 1)} ج.م</span>
                <span className="text-base md:text-lg font-black text-primary tracking-tight">{Number(finalPrice).toFixed(Number(finalPrice) % 1 === 0 ? 0 : 1)} <span className="text-[10px]">ج.م</span></span>
              </>
            ) : (
              <span className="text-base md:text-lg font-black text-primary tracking-tight">{Number(price).toFixed(Number(price) % 1 === 0 ? 0 : 1)} <span className="text-[10px]">ج.م</span></span>
            )}
          </div>

          <Button
            size="icon"
            className="bg-primary hover:bg-secondary text-white rounded-lg md:rounded-xl h-8 w-8 md:h-10 md:w-10 shadow-lg shadow-primary/10 transition-all active:scale-95 group/btn"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover/btn:animate-bounce" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
