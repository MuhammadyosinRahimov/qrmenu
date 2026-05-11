import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { OrderMode } from "@/types/enums";

export interface DeliveryDetails {
  entrance: string;
  floor: string;
  apartment: string;
  intercom: string;
}

interface OrderModeState {
  mode: OrderMode;
  selectedRestaurantId: string | null;
  deliveryAddress: string | null;
  addressLat: number | null;
  addressLng: number | null;
  juraAddressId: string | null;
  tariffId: number | null;
  deliveryFee: number;
  distanceMeters: number | null;
  durationMinutes: number | null;
  customerName: string;
  customerPhone: string;
  deliveryDetails: DeliveryDetails;

  setMode: (mode: OrderMode) => void;
  setAddress: (a: {
    deliveryAddress: string;
    lat: number | null;
    lng: number | null;
    juraAddressId?: string | null;
  }) => void;
  setTariff: (tariffId: number | null) => void;
  setDeliveryCalc: (fee: number, distanceMeters?: number, durationMinutes?: number) => void;
  setRestaurant: (id: string | null) => void;
  setCustomer: (name: string, phone: string) => void;
  setDeliveryDetails: (d: Partial<DeliveryDetails>) => void;
  clear: () => void;
}

const EMPTY_DETAILS: DeliveryDetails = {
  entrance: "",
  floor: "",
  apartment: "",
  intercom: "",
};

export const useOrderModeStore = create<OrderModeState>()(
  persist(
    (set) => ({
      mode: "delivery",
      selectedRestaurantId: null,
      deliveryAddress: null,
      addressLat: null,
      addressLng: null,
      juraAddressId: null,
      tariffId: null,
      deliveryFee: 0,
      distanceMeters: null,
      durationMinutes: null,
      customerName: "",
      customerPhone: "",
      deliveryDetails: EMPTY_DETAILS,

      setMode: (mode) => set({ mode }),
      setAddress: ({ deliveryAddress, lat, lng, juraAddressId }) =>
        set({
          deliveryAddress,
          addressLat: lat,
          addressLng: lng,
          juraAddressId: juraAddressId ?? null,
        }),
      setTariff: (tariffId) => set({ tariffId }),
      setDeliveryCalc: (fee, distanceMeters, durationMinutes) =>
        set({
          deliveryFee: fee,
          distanceMeters: distanceMeters ?? null,
          durationMinutes: durationMinutes ?? null,
        }),
      setRestaurant: (id) => set({ selectedRestaurantId: id }),
      setCustomer: (customerName, customerPhone) => set({ customerName, customerPhone }),
      setDeliveryDetails: (d) =>
        set((s) => ({ deliveryDetails: { ...s.deliveryDetails, ...d } })),
      clear: () =>
        set({
          selectedRestaurantId: null,
          deliveryAddress: null,
          addressLat: null,
          addressLng: null,
          juraAddressId: null,
          tariffId: null,
          deliveryFee: 0,
          distanceMeters: null,
          durationMinutes: null,
          deliveryDetails: EMPTY_DETAILS,
        }),
    }),
    {
      name: "order-mode-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
