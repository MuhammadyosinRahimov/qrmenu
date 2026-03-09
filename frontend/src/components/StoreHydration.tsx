"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useTableStore } from "@/stores/tableStore";
import { useGeolocationStore } from "@/stores/geolocationStore";

export function StoreHydration() {
  useEffect(() => {
    // Явная гидрация всех stores из localStorage
    useTableStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();

    // Request geolocation if cache is expired (>5 minutes)
    const requestGeolocation = async () => {
      const { lastUpdated, requestLocation } = useGeolocationStore.getState();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (!lastUpdated || Date.now() - lastUpdated > CACHE_DURATION) {
        await requestLocation();
      }
    };

    requestGeolocation();
  }, []);

  return null;
}
