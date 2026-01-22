import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types/database';

interface CartState {
    items: (CartItem & { product: Product })[];
    isLoading: boolean;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setItems: (items: (CartItem & { product: Product })[]) => void;
    setLoading: (loading: boolean) => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find((item) => item.product_id === product.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.product_id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    const newItem: CartItem & { product: Product } = {
                        id: `temp-${Date.now()}`,
                        user_id: '',
                        product_id: product.id,
                        quantity,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        product,
                    };
                    set({ items: [...items, newItem] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.product_id !== productId) });
            },
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.product_id === productId ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            setItems: (items) => set({ items }),
            setLoading: (isLoading) => set({ isLoading }),
            getTotal: () => {
                return get().items.reduce((total, item) => {
                    const price = item.product.sale_price || item.product.regular_price;
                    return total + price * item.quantity;
                }, 0);
            },
            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
