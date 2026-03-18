"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useTableStore } from "@/stores/tableStore";
import { useOrderModeStore } from "@/stores/orderModeStore";

export function StoreHydration() {
  useEffect(() => {
    // Явная гидрация всех stores из sessionStorage/localStorage
    useTableStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    useOrderModeStore.persist.rehydrate();
  }, []);

  return null;
}
