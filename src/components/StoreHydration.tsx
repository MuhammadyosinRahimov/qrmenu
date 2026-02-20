"use client";

import { useEffect } from "react";
import { useTableStore } from "@/stores/tableStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

export function StoreHydration() {
  useEffect(() => {
    useTableStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
