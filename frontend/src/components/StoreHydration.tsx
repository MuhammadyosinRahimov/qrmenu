"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useTableStore } from "@/stores/tableStore";

export function StoreHydration() {
  useEffect(() => {
    // Явная гидрация всех stores из localStorage
    useTableStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
