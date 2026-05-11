"use client";

import { useEffect, useState } from "react";
import { calculateDelivery } from "@/lib/api";
import { normalizePhoneForApi } from "@/lib/format";
import type { JuraAddress } from "@/types/jura";

export interface DeliveryQuote {
  loading: boolean;
  error: string | null;
  price: number | null;
  distance: number | null;
  duration: number | null;
}

/**
 * Расчёт стоимости доставки JURA по выбранному адресу + тарифу.
 */
export function useDeliveryQuote(
  selected: JuraAddress | null,
  tariffId: number | null,
  phone: string | null,
  enabled: boolean = true
): DeliveryQuote {
  const [state, setState] = useState<DeliveryQuote>({
    loading: false,
    error: null,
    price: null,
    distance: null,
    duration: null,
  });

  useEffect(() => {
    if (!enabled || !selected || !tariffId) {
      setState({ loading: false, error: null, price: null, distance: null, duration: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    calculateDelivery({
      tariffId,
      phone: normalizePhoneForApi(phone ?? ""),
      toAddress: {
        lat: selected.lat,
        lng: selected.lng,
        id: selected.id,
        address: selected.name,
      },
    })
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setState({
            loading: false,
            error: null,
            price: res.price,
            distance: res.distance ?? null,
            duration: res.duration ?? null,
          });
        } else {
          setState({
            loading: false,
            error: res.message || "Не удалось рассчитать стоимость",
            price: null,
            distance: null,
            duration: null,
          });
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: e instanceof Error ? e.message : "Ошибка расчёта",
          price: null,
          distance: null,
          duration: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, selected, tariffId, phone]);

  return state;
}
