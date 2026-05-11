"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";

export function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    useOrderModeStore.persist.rehydrate();
    // Check token expiry
    setTimeout(() => useAuthStore.getState().checkAuth(), 0);

    // Unregister any stale service worker from previous PWA setups —
    // they intercept fetches and force a hard reload on every navigation,
    // which breaks Next.js soft routing and feels like a full page refresh.
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          regs.forEach((r) => r.unregister().catch(() => {}));
        })
        .catch(() => {});
      // Clear cache storage left over from previous SW versions.
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => keys.forEach((k) => caches.delete(k).catch(() => {})))
          .catch(() => {});
      }
    }
  }, []);
  return null;
}
