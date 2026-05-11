import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";
import { useOrderModeStore } from "./orderModeStore";

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  addingToOrderId: string | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNote: (itemId: string, note: string) => void;
  updateItemSize: (itemId: string, sizeId: string | undefined, sizeName: string | undefined, newUnitPrice: number) => void;
  clearCart: () => void;
  startAddingToOrder: (orderId: string, restaurantId: string) => void;
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      addingToOrderId: null,

      addItem: (item) => {
        const id = `${item.productId}-${item.sizeId || "default"}-${[...item.addonIds].sort().join(",")}`;
        const state = get();

        // If cart has items from a different restaurant — clear it.
        if (state.restaurantId && state.restaurantId !== item.restaurantId) {
          set({ items: [], restaurantId: item.restaurantId, addingToOrderId: null });
        } else if (!state.restaurantId) {
          set({ restaurantId: item.restaurantId });
        }

        const existing = get().items.find((i) => i.id === id);
        if (existing) {
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
        const items = get().items.filter((i) => i.id !== itemId);
        const empty = items.length === 0;
        set({
          items,
          restaurantId: empty ? null : get().restaurantId,
          addingToOrderId: empty ? null : get().addingToOrderId,
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          const items = get().items.filter((i) => i.id !== itemId);
          const empty = items.length === 0;
          set({
            items,
            restaurantId: empty ? null : get().restaurantId,
            addingToOrderId: empty ? null : get().addingToOrderId,
          });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity, totalPrice: quantity * i.unitPrice } : i
          ),
        });
      },

      updateItemNote: (itemId, note) => {
        set({ items: get().items.map((i) => (i.id === itemId ? { ...i, note } : i)) });
      },

      updateItemSize: (itemId, sizeId, sizeName, newUnitPrice) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;
        const newId = `${item.productId}-${sizeId || "default"}-${[...item.addonIds].sort().join(",")}`;
        if (newId === itemId) {
          set({
            items: get().items.map((i) =>
              i.id === itemId
                ? { ...i, sizeId, sizeName, unitPrice: newUnitPrice, totalPrice: i.quantity * newUnitPrice }
                : i
            ),
          });
          return;
        }
        const merge = get().items.find((i) => i.id === newId);
        if (merge) {
          set({
            items: get()
              .items.filter((i) => i.id !== itemId)
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
          set({
            items: get().items.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    id: newId,
                    sizeId,
                    sizeName,
                    unitPrice: newUnitPrice,
                    totalPrice: i.quantity * newUnitPrice,
                  }
                : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [], restaurantId: null, addingToOrderId: null }),

      startAddingToOrder: (orderId, restaurantId) =>
        set({ items: [], restaurantId, addingToOrderId: orderId }),

      getSubtotal: () => get().items.reduce((s, i) => s + i.totalPrice, 0),
      getTax: () => {
        const mode = useOrderModeStore.getState().mode;
        if (mode === "delivery" || mode === "takeaway") return 0;
        return Math.round(get().getSubtotal() * 0.1);
      },
      getDeliveryFee: () => {
        const mode = useOrderModeStore.getState().mode;
        return mode === "delivery" ? useOrderModeStore.getState().deliveryFee : 0;
      },
      getTotal: () => {
        return get().getSubtotal() + get().getTax() + get().getDeliveryFee();
      },
      getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: "cart-storage-eats-v1",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    }
  )
);
