import { create } from "zustand";

interface JuraState {
  orderId: string | null;
  juraOrderId: string | null;
  juraStatusId: number | null;
  statusName: string | null;
  performerName: string | null;
  performerPhone: string | null;
  driverLat: number | null;
  driverLng: number | null;
  lastPosAt: number | null;
  deliveryCost: number | null;

  setOrder: (orderId: string, juraOrderId?: string | null) => void;
  setStatus: (statusId: number | null, statusName?: string | null) => void;
  setPerformer: (name: string | null, phone: string | null) => void;
  setDriverPosition: (lat: number, lng: number) => void;
  setDeliveryCost: (cost: number | null) => void;
  clear: () => void;
}

export const useJuraStore = create<JuraState>((set) => ({
  orderId: null,
  juraOrderId: null,
  juraStatusId: null,
  statusName: null,
  performerName: null,
  performerPhone: null,
  driverLat: null,
  driverLng: null,
  lastPosAt: null,
  deliveryCost: null,

  setOrder: (orderId, juraOrderId) => set({ orderId, juraOrderId: juraOrderId ?? null }),
  setStatus: (juraStatusId, statusName) => set({ juraStatusId, statusName: statusName ?? null }),
  setPerformer: (performerName, performerPhone) => set({ performerName, performerPhone }),
  setDriverPosition: (driverLat, driverLng) =>
    set({ driverLat, driverLng, lastPosAt: Date.now() }),
  setDeliveryCost: (deliveryCost) => set({ deliveryCost }),
  clear: () =>
    set({
      orderId: null,
      juraOrderId: null,
      juraStatusId: null,
      statusName: null,
      performerName: null,
      performerPhone: null,
      driverLat: null,
      driverLng: null,
      lastPosAt: null,
      deliveryCost: null,
    }),
}));
