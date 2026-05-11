"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRestaurants } from "@/lib/api";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useGeolocationStore } from "@/stores/geolocationStore";
import { RestaurantCard } from "./RestaurantCard";
import { haversineKm } from "@/lib/geo";
import { parseWorkingHours } from "@/lib/workingHours";
import type { Restaurant } from "@/types";

export type RestaurantSort = "smart" | "popular" | "rating" | "time" | "fee" | "distance";

interface Props {
  query?: string;
  minRating?: number;
  maxPrepTime?: number;
  sort?: RestaurantSort;
  openOnly?: boolean;
  categoryId?: string | null;
}

interface RestaurantWithDistance extends Restaurant {
  distanceKm?: number;
  isOpenNow?: boolean;
}

function isRestaurantOpen(r: Restaurant): boolean {
  if (r.acceptingOrders === false) return false;
  return parseWorkingHours(r.workingHours).isOpenNow;
}

export function RestaurantList({
  query = "",
  minRating = 0,
  maxPrepTime = 0,
  sort = "smart",
  openOnly = false,
  categoryId = null,
}: Props) {
  const mode = useOrderModeStore((s) => s.mode);
  const lat = useGeolocationStore((s) => s.lat);
  const lng = useGeolocationStore((s) => s.lng);
  const requestGeo = useGeolocationStore((s) => s.request);

  // Silently request geolocation if missing — we want distances when possible.
  useEffect(() => {
    if (lat == null || lng == null) {
      requestGeo().catch(() => {});
    }
  }, [lat, lng, requestGeo]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurants", mode, categoryId],
    queryFn: () => getRestaurants(mode, categoryId ?? undefined),
  });

  const filtered = useMemo<RestaurantWithDistance[]>(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const userPos = lat != null && lng != null ? { lat, lng } : null;

    let list: RestaurantWithDistance[] = data
      .filter((r) => {
        if (q && !r.name.toLowerCase().includes(q) && !(r.description ?? "").toLowerCase().includes(q)) {
          return false;
        }
        if (minRating > 0 && (r.rating ?? 0) < minRating) return false;
        if (maxPrepTime > 0 && (r.prepTimeMinutes ?? 0) > maxPrepTime) return false;
        if (openOnly && !isRestaurantOpen(r)) return false;
        return true;
      })
      .map((r) => {
        let distanceKm: number | undefined;
        if (userPos && r.lat != null && r.lng != null) {
          distanceKm = haversineKm(userPos, { lat: r.lat, lng: r.lng });
        }
        return { ...r, distanceKm, isOpenNow: isRestaurantOpen(r) };
      });

    list = [...list];
    switch (sort) {
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "time":
        list.sort((a, b) => (a.prepTimeMinutes ?? 999) - (b.prepTimeMinutes ?? 999));
        break;
      case "fee":
        list.sort((a, b) => (a.deliveryFee ?? 0) - (b.deliveryFee ?? 0));
        break;
      case "distance":
        list.sort((a, b) => {
          const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
          const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
          return da - db;
        });
        break;
      case "smart":
        list.sort((a, b) => {
          // 1. Open first (acceptingOrders + working hours)
          const aOpen = a.isOpenNow ? 1 : 0;
          const bOpen = b.isOpenNow ? 1 : 0;
          if (aOpen !== bOpen) return bOpen - aOpen;
          // 2. Closer first (when distance known)
          const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
          const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
          if (da !== db) return da - db;
          // 3. Higher rating first
          return (b.rating ?? 0) - (a.rating ?? 0);
        });
        break;
      case "popular":
      default:
        break;
    }
    return list;
  }, [data, query, minRating, maxPrepTime, sort, lat, lng, openOnly]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 py-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 text-sm">
        Не удалось загрузить рестораны. Попробуйте позже.
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="p-8 text-center text-muted">
        <p className="text-sm">
          {query || minRating > 0 || maxPrepTime > 0 || openOnly
            ? "Ничего не найдено по выбранным параметрам"
            : `Нет ресторанов, поддерживающих ${mode === "delivery" ? "доставку" : "самовывоз"}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 py-4">
      {filtered.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} distanceKm={r.distanceKm} />
      ))}
    </div>
  );
}
