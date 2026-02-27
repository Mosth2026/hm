
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './use-products';

interface CartItem extends Product {
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getItemCount: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.id === product.id);
                const safeQuantity = Math.max(1, quantity);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: (item.quantity || 0) + safeQuantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { ...product, quantity: safeQuantity }] });
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

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
        }),
        {
            name: 'saada-makers-cart-v2',
        }
    )
);
