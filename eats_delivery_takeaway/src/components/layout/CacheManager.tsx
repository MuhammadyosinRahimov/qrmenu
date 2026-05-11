"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";

const THREE_HOURS = 3 * 60 * 60 * 1000;
const LAST_ACTIVITY_KEY = "eats:lastActivity";

export function CacheManager() {
  useEffect(() => {
    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || now);
    if (now - last > THREE_HOURS) {
      // Clear transient session state
      try {
        sessionStorage.clear();
      } catch { /* noop */ }
      useCartStore.getState().clearCart();
      useOrderModeStore.getState().clear();
    }
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));

    const ping = () => localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    window.addEventListener("visibilitychange", ping);
    window.addEventListener("focus", ping);
    const interval = setInterval(ping, 60_000);
    return () => {
      window.removeEventListener("visibilitychange", ping);
      window.removeEventListener("focus", ping);
      clearInterval(interval);
    };
  }, []);
  return null;
}
