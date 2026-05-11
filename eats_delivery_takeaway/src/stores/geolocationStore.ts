import { create } from "zustand";

const TTL_MS = 5 * 60 * 1000;

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  updatedAt: number | null;
  error: string | null;
  requesting: boolean;
  request: () => Promise<{ lat: number; lng: number } | null>;
}

export const useGeolocationStore = create<GeolocationState>((set, get) => ({
  lat: null,
  lng: null,
  accuracy: null,
  updatedAt: null,
  error: null,
  requesting: false,
  request: async () => {
    const state = get();
    if (
      state.lat != null &&
      state.lng != null &&
      state.updatedAt != null &&
      Date.now() - state.updatedAt < TTL_MS
    ) {
      return { lat: state.lat, lng: state.lng };
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set({ error: "Геолокация недоступна" });
      return null;
    }
    set({ requesting: true, error: null });
    return await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          set({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            updatedAt: Date.now(),
            requesting: false,
            error: null,
          });
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          set({ requesting: false, error: err.message });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: TTL_MS }
      );
    });
  },
}));
