"use client";

import { Icon } from "@/components/ui/Icon";
import { formatDistance } from "@/lib/geo";
import { useDistanceToRestaurant } from "@/hooks/useDistanceToRestaurant";
import { WorkingHoursBlock } from "./WorkingHoursBlock";
import type { Restaurant } from "@/types";

interface Props {
  restaurant: Restaurant;
}

export function RestaurantInfoBlock({ restaurant }: Props) {
  const distance = useDistanceToRestaurant({
    restaurantLat: restaurant.lat,
    restaurantLng: restaurant.lng,
  });

  return (
    <div className="mx-4 -mt-6 relative z-10 bg-white rounded-2xl shadow-sm border border-border p-4 space-y-3">
      <WorkingHoursBlock
        workingHours={restaurant.workingHours}
        acceptingOrders={restaurant.acceptingOrders !== false}
        pauseMessage={restaurant.pauseMessage}
      />

      {restaurant.address && (
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-50 text-primary flex-shrink-0">
            <Icon name="location" size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium leading-snug">{restaurant.address}</span>
            {distance != null && (
              <span className="block text-[11px] text-muted mt-0.5 inline-flex items-center gap-1">
                <Icon name="near_me" size={11} className="text-primary" />
                {formatDistance(distance)} от вас
              </span>
            )}
          </div>
        </div>
      )}

      {restaurant.phone && (
        <a
          href={`tel:${restaurant.phone}`}
          className="flex items-center gap-3 -mx-1 px-1 py-1 rounded-xl hover:bg-surface transition"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-50 text-primary flex-shrink-0">
            <Icon name="phone" size={18} />
          </span>
          <span className="font-medium text-sm">{restaurant.phone}</span>
        </a>
      )}
    </div>
  );
}
