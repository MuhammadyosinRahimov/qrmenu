"use client";

import { useQuery } from "@tanstack/react-query";
import { getRestaurantStatus } from "@/lib/api";

export function useRestaurantStatus(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ["restaurant-status", restaurantId],
    queryFn: () => getRestaurantStatus(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
