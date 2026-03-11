import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OrderMode = "qr" | "delivery" | "dinein" | "takeaway";

const QR_MODE_KEY = "current-mode";

// Helper function to check if we're in QR mode (for use in other stores)
export const isQrMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(QR_MODE_KEY) === "qr";
};

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

      setMode: (mode) => {
        if (typeof window !== "undefined") {
          if (mode === "qr") {
            sessionStorage.setItem(QR_MODE_KEY, "qr");
          } else {
            sessionStorage.removeItem(QR_MODE_KEY);
          }
        }
        set({ mode });
      },

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

      clearMode: () => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(QR_MODE_KEY);
        }
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
        }));
      },

      clearRestaurant: () =>
        set({
          selectedRestaurantId: null,
          selectedRestaurantName: null,
          deliveryFee: 0,
        }),
    }),
    {
      name: "order-mode-storage-v2",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
