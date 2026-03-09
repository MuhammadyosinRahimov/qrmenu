import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  lastUpdated: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useGeolocationStore = create<GeolocationState>()(
  persist(
    (set, get) => ({
      latitude: null,
      longitude: null,
      lastUpdated: null,
      isLoading: false,
      error: null,

      requestLocation: async () => {
        // Check if cache is still valid
        const { lastUpdated } = get();
        if (lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
          return; // Cache is still valid
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
          set({ error: "Geolocation is not supported by this browser" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: CACHE_DURATION,
              });
            }
          );

          set({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            lastUpdated: Date.now(),
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const error = err as GeolocationPositionError;
          let errorMessage = "Failed to get location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      clearLocation: () =>
        set({
          latitude: null,
          longitude: null,
          lastUpdated: null,
          error: null,
        }),
    }),
    {
      name: "geolocation-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
