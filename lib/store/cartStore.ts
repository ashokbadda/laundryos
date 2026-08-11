import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => Number(item.id) === Number(newItem.id)
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                Number(item.id) === Number(newItem.id)
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, newItem] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => Number(item.id) !== Number(id)),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              Number(item.id) === Number(id)
                ? { ...item, quantity: Math.max(0, quantity) }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "laundry-cart-storage",
    }
  )
);