"use client";

import { useEffect } from "react";
import { getDriverPosition } from "@/lib/api";
import { useJuraStore } from "@/stores/juraStore";
import { isTrackingActive } from "@/lib/jura";

export function useDriverPosition(orderId: string | null, juraStatusId: number | null) {
  useEffect(() => {
    if (!orderId) return;
    if (!isTrackingActive(juraStatusId)) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const pos = await getDriverPosition(orderId);
        if (cancelled) return;
        if (pos && pos.lat != null && pos.lng != null) {
          useJuraStore.getState().setDriverPosition(pos.lat, pos.lng);
        }
      } catch {
        /* ignore transient errors */
      }
    };

    tick();
    const t = setInterval(tick, 10000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [orderId, juraStatusId]);
}
