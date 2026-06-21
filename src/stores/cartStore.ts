import { create } from 'zustand';
import type { CartItem, Product } from '../types';
import { generateCartItemId } from '../utils/format';

interface CartStore {
  items: CartItem[];
  addProduct: (product: Product) => void;
  addManualItem: (description: string, amount: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addProduct: (product) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.unitPrice,
              }
            : i
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            id: generateCartItemId(),
            productId: product.id,
            description: product.name,
            quantity: 1,
            unitPrice: Number(product.price),
            subtotal: Number(product.price),
          },
        ],
      });
    }
  },

  addManualItem: (description, amount) => {
    set({
      items: [
        ...get().items,
        {
          id: generateCartItemId(),
          productId: null,
          description,
          quantity: 1,
          unitPrice: amount,
          subtotal: amount,
        },
      ],
    });
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === id
          ? { ...i, quantity, subtotal: quantity * i.unitPrice }
          : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  calculateTotal: () =>
    get().items.reduce((sum, i) => sum + i.subtotal, 0),
}));
