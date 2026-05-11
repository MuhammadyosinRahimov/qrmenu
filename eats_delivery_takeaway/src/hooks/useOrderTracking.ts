"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onHubEvent, offHubEvent } from "@/lib/signalr";
import { useJuraStore } from "@/stores/juraStore";
import type { Order } from "@/types";

/**
 * Subscribes to SignalR events on the Customer_{userId} group for a specific order.
 * Backend emits: MyOrderUpdated, MyOrderStatusUpdated, OrderCreated, JuraStatusChanged.
 * Falls back to 15s polling via React Query invalidation.
 */
export function useOrderTracking(orderId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!orderId) return;

    const store = useJuraStore.getState();

    const applyOrderPayload = (o: Order) => {
      if (!o) return;
      if (o.id && o.id !== orderId) return;
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      if (o.juraOrderId) store.setOrder(orderId, o.juraOrderId);
      if (o.juraStatusId != null) {
        store.setStatus(o.juraStatusId, o.juraStatusName ?? null);
      }
      if (o.performerName || o.performerPhone) {
        store.setPerformer(o.performerName ?? null, o.performerPhone ?? null);
      }
    };

    const onOrderUpdated = (payload: unknown) => applyOrderPayload(payload as Order);
    const onStatusUpdated = (payload: unknown) => applyOrderPayload(payload as Order);
    const onOrderCreated = (payload: unknown) => applyOrderPayload(payload as Order);

    const onJura = (payload: unknown) => {
      const p = payload as { orderId: string; juraStatusId: number; statusName?: string; performerName?: string; performerPhone?: string };
      if (!p || p.orderId !== orderId) return;
      if (p.juraStatusId != null) store.setStatus(p.juraStatusId, p.statusName ?? null);
      if (p.performerName || p.performerPhone) {
        store.setPerformer(p.performerName ?? null, p.performerPhone ?? null);
      }
      qc.invalidateQueries({ queryKey: ["order", orderId] });
    };

    onHubEvent("MyOrderUpdated", onOrderUpdated);
    onHubEvent("MyOrderStatusUpdated", onStatusUpdated);
    onHubEvent("OrderCreated", onOrderCreated);
    onHubEvent("JuraStatusChanged", onJura);

    const poll = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["order", orderId] });
    }, 15000);

    return () => {
      offHubEvent("MyOrderUpdated", onOrderUpdated);
      offHubEvent("MyOrderStatusUpdated", onStatusUpdated);
      offHubEvent("OrderCreated", onOrderCreated);
      offHubEvent("JuraStatusChanged", onJura);
      clearInterval(poll);
    };
  }, [orderId, qc]);
}
