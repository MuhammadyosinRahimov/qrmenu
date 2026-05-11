"use client";

import { useEffect, useMemo } from "react";
import { useGeolocationStore } from "@/stores/geolocationStore";
import { haversineKm } from "@/lib/geo";

interface Args {
  restaurantLat?: number | null;
  restaurantLng?: number | null;
  /** Silently ask for geolocation if missing. Default true. */
  autoRequest?: boolean;
}

/** Computes haversine distance from user to restaurant (km). Returns null if unknown. */
export function useDistanceToRestaurant({
  restaurantLat,
  restaurantLng,
  autoRequest = true,
}: Args): number | null {
  const lat = useGeolocationStore((s) => s.lat);
  const lng = useGeolocationStore((s) => s.lng);
  const request = useGeolocationStore((s) => s.request);

  useEffect(() => {
    if (!autoRequest) return;
    if (lat == null || lng == null) {
      request().catch(() => {});
    }
  }, [autoRequest, lat, lng, request]);

  return useMemo(() => {
    if (lat == null || lng == null) return null;
    if (restaurantLat == null || restaurantLng == null) return null;
    return haversineKm({ lat, lng }, { lat: restaurantLat, lng: restaurantLng });
  }, [lat, lng, restaurantLat, restaurantLng]);
}
