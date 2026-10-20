import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = { productId: number; qty: number };

type CartState = {
  items: CartLine[];
  add: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, qty: Math.min(20, i.qty + 1) } : i,
              ),
            };
          }
          return { items: [...state.items, { productId, qty: 1 }] };
        }),
      setQty: (productId, qty) =>
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((i) => i.productId !== productId) };
          return {
            items: state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
          };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "nlm-cart" },
  ),
);
