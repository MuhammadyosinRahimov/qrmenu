"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

export function StoreHydration() {
  useEffect(() => {
    // tableStore теперь гидрируется автоматически (skipHydration убран)
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
