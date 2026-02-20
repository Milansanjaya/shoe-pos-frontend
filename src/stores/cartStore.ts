import { create } from 'zustand';
import { CartItem } from '../types/sale.types';

type DiscountType = 'NONE' | 'PERCENTAGE' | 'FLAT';

interface CartState {
    items: CartItem[];
    paymentMethod: 'Cash' | 'Card' | 'Transfer';
    discountType: DiscountType;
    discountValue: number;
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, size: string, color: string) => void;
    updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
    setPaymentMethod: (method: 'Cash' | 'Card' | 'Transfer') => void;
    setDiscount: (type: DiscountType, value: number) => void;
    clearCart: () => void;
    subtotal: () => number;
    discountAmount: () => number;
    grandTotal: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
    items: [],
    paymentMethod: 'Cash',
    discountType: 'NONE',
    discountValue: 0,
    addItem: (item) => {
        const existing = get().items.find(
            (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );
        if (existing) {
            set((s) => ({
                items: s.items.map((i) =>
                    i.productId === item.productId && i.size === item.size && i.color === item.color
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                ),
            }));
        } else {
            set((s) => ({ items: [...s.items, item] }));
        }
    },
    removeItem: (productId, size, color) =>
        set((s) => ({
            items: s.items.filter(
                (i) => !(i.productId === productId && i.size === size && i.color === color)
            ),
        })),
    updateQuantity: (productId, size, color, qty) =>
        set((s) => ({
            items: s.items.map((i) =>
                i.productId === productId && i.size === size && i.color === color
                    ? { ...i, quantity: qty }
                    : i
            ),
        })),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setDiscount: (type, value) => set({ discountType: type, discountValue: value }),
    clearCart: () => set({ items: [], discountType: 'NONE', discountValue: 0 }),
    subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    discountAmount: () => {
        const sub = get().subtotal();
        const { discountType, discountValue } = get();
        if (discountType === 'PERCENTAGE') return Math.min(sub, (sub * discountValue) / 100);
        if (discountType === 'FLAT') return Math.min(sub, discountValue);
        return 0;
    },
    grandTotal: () => get().subtotal() - get().discountAmount(),
}));
