import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";
import { useOrderModeStore } from "./orderModeStore";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNote: (itemId: string, note: string) => void;
  updateItemSize: (itemId: string, sizeId: string, sizeName: string, newUnitPrice: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `${item.productId}-${item.sizeId || "default"}-${item.addonIds.sort().join(",")}`;
        const existingItem = get().items.find((i) => i.id === id);

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === id
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,
                    totalPrice: (i.quantity + item.quantity) * i.unitPrice,
                  }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...item, id, totalPrice: item.quantity * item.unitPrice },
            ],
          });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== itemId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.id === itemId
                ? { ...i, quantity, totalPrice: quantity * i.unitPrice }
                : i
            ),
          });
        }
      },

      updateItemNote: (itemId, note) => {
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, note } : i
          ),
        });
      },

      updateItemSize: (itemId, sizeId, sizeName, newUnitPrice) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;

        // Generate new ID based on new size
        const newId = `${item.productId}-${sizeId || "default"}-${item.addonIds.sort().join(",")}`;

        // Check if item with new ID already exists
        const existingItem = get().items.find((i) => i.id === newId && i.id !== itemId);

        if (existingItem) {
          // Merge quantities and remove old item
          set({
            items: get().items
              .filter((i) => i.id !== itemId)
              .map((i) =>
                i.id === newId
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      totalPrice: (i.quantity + item.quantity) * i.unitPrice,
                    }
                  : i
              ),
          });
        } else {
          // Update item with new size
          set({
            items: get().items.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    id: newId,
                    sizeId,
                    sizeName,
                    unitPrice: newUnitPrice,
                    totalPrice: item.quantity * newUnitPrice,
                  }
                : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getTax: () => {
        const mode = useOrderModeStore.getState().mode;
        if (mode === "delivery" || mode === "takeaway") {
          return 0;
        }
        return Math.round(get().getSubtotal() * 0.1);
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax();
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage-v2",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    }
  )
);
