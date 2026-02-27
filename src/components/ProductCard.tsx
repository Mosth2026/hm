import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Plus, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { cn, cleanProductName } from "@/lib/utils";

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
      style: { background: 'var(--primary)', color: 'white', borderRadius: '1rem', cursor: 'pointer' },
      onClick: () => window.location.href = '/cart'
    });
  };

  return (
    <div className="group relative bg-card rounded-[2rem] border border-primary/10 p-3 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 font-tajawal rtl h-full flex flex-col premium-card">

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-primary/5">
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

        {/* Quick Action Overlay */}
        <div className="absolute inset-x-4 bottom-4 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 bg-white/80 backdrop-blur-md rounded-full shadow-xl text-primary hover:bg-secondary hover:text-white transition-colors"
          >
            <Heart className="h-5 w-5" />
          </Button>
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
      <div className="p-4 flex-grow flex flex-col space-y-2">
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
          <h3 className="font-black text-primary hover:text-secondary transition-colors line-clamp-2 leading-snug">
            {cleanProductName(name)}
          </h3>
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/5">
          <div className="flex flex-col">
            {showSale ? (
              <>
                <span className="text-muted-foreground line-through text-[10px] font-bold">{Number(price).toFixed(Number(price) % 1 === 0 ? 0 : 1)} ج.م</span>
                <span className="text-lg font-black text-primary tracking-tight">{Number(finalPrice).toFixed(Number(finalPrice) % 1 === 0 ? 0 : 1)} <span className="text-xs">ج.م</span></span>
              </>
            ) : (
              <span className="text-lg font-black text-primary tracking-tight">{Number(price).toFixed(Number(price) % 1 === 0 ? 0 : 1)} <span className="text-xs">ج.م</span></span>
            )}
          </div>

          <Button
            size="icon"
            className="bg-primary hover:bg-secondary text-white rounded-xl h-10 w-10 shadow-lg shadow-primary/10 transition-all active:scale-95 group/btn"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 group-hover/btn:animate-bounce" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
