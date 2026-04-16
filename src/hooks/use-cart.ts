
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './use-products';

interface CartItem extends Product {
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    appliedCoupon: any | null;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getDiscountedTotal: () => number;
    getItemCount: () => number;
    applyCoupon: (coupon: any) => void;
    removeCoupon: () => void;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            appliedCoupon: null,

            addItem: (product, quantity = 1) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.id === product.id);
                const safeQuantity = Math.max(1, quantity);
                
                // UNBREAKABLE STOCK RULE: Never add more than available in branch
                const maxStock = product.stock || 0;

                if (existingItem) {
                    const newQty = Math.min(maxStock, (existingItem.quantity || 0) + safeQuantity);
                    set({
                        items: currentItems.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: newQty }
                                : item
                        ),
                    });
                } else {
                    const finalQty = Math.min(maxStock, safeQuantity);
                    if (finalQty > 0) {
                        set({ items: [...currentItems, { ...product, quantity: finalQty }] });
                    }
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                });
            },

            updateQuantity: (productId, quantity) => {
                const item = get().items.find(i => i.id === productId);
                if (!item) return;

                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                // UNBREAKABLE STOCK RULE: Limit by current branch stock
                const maxStock = item.stock || 0;
                const finalQty = Math.min(maxStock, quantity);

                set({
                    items: get().items.map((i) =>
                        i.id === productId ? { ...i, quantity: finalQty } : i
                    ),
                });
            },

            clearCart: () => set({ items: [], appliedCoupon: null }),

            getItemCount: () => {
                return get().items.reduce((count, item) => count + (item.quantity || 0), 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const price = item.is_on_sale
                        ? item.price - (item.price * (item.discount || 0) / 100)
                        : item.price;
                    return total + (price * item.quantity);
                }, 0);
            },

            getDiscountedTotal: () => {
                const total = get().getTotalPrice();
                const coupon = get().appliedCoupon;
                if (!coupon) return total;

                if (coupon.discount_type === 'percentage') {
                    return total - (total * coupon.discount_value / 100);
                } else {
                    return Math.max(0, total - coupon.discount_value);
                }
            },

            applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
            removeCoupon: () => set({ appliedCoupon: null }),
        }),

        {
            name: 'saada-makers-cart-v2',
        }
    )
);
