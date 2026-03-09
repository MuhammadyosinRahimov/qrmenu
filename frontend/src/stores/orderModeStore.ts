import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OrderMode = "qr" | "delivery" | "dinein" | "takeaway";

interface OrderModeState {
  mode: OrderMode;
  selectedRestaurantId: string | null;
  selectedRestaurantName: string | null;
  deliveryAddress: string;
  tableNumber: number | null;
  customerName: string;
  customerPhone: string;
  deliveryFee: number;

  // Actions
  setMode: (mode: OrderMode) => void;
  setRestaurant: (id: string, name: string, deliveryFee?: number) => void;
  setDeliveryAddress: (address: string) => void;
  setTableNumber: (number: number | null) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  clearMode: () => void;
  clearRestaurant: () => void;
}

export const useOrderModeStore = create<OrderModeState>()(
  persist(
    (set) => ({
      mode: "delivery",
      selectedRestaurantId: null,
      selectedRestaurantName: null,
      deliveryAddress: "",
      tableNumber: null,
      customerName: "",
      customerPhone: "",
      deliveryFee: 0,

      setMode: (mode) => set({ mode }),

      setRestaurant: (id, name, deliveryFee = 0) =>
        set({
          selectedRestaurantId: id,
          selectedRestaurantName: name,
          deliveryFee,
        }),

      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      setTableNumber: (number) => set({ tableNumber: number }),

      setCustomerName: (name) => set({ customerName: name }),

      setCustomerPhone: (phone) => set({ customerPhone: phone }),

      clearMode: () =>
        set((state) => ({
          mode: "delivery",
          selectedRestaurantId: null,
          selectedRestaurantName: null,
          deliveryAddress: "",
          tableNumber: null,
          customerName: "",
          // Сохраняем телефон при очистке
          customerPhone: state.customerPhone,
          deliveryFee: 0,
        })),

      clearRestaurant: () =>
        set({
          selectedRestaurantId: null,
          selectedRestaurantName: null,
          deliveryFee: 0,
        }),
    }),
    {
      name: "order-mode-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
