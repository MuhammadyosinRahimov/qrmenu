"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl, getRestaurant } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { useDistanceToRestaurant } from "@/hooks/useDistanceToRestaurant";
import { formatDistance } from "@/lib/geo";
import { parseWorkingHours } from "@/lib/workingHours";

interface Props {
  restaurantId: string;
}

function fmt(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function PickupRestaurantCard({ restaurantId }: Props) {
  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  });

  const distance = useDistanceToRestaurant({
    restaurantLat: restaurant?.lat,
    restaurantLng: restaurant?.lng,
  });

  if (!restaurant) {
    return (
      <div className="bg-white border border-border rounded-2xl h-24 animate-pulse" />
    );
  }

  const logo = getImageUrl(restaurant.logoUrl);
  const parsed = parseWorkingHours(restaurant.workingHours);
  const acceptingOrders = restaurant.acceptingOrders !== false;
  const isOpenNow = acceptingOrders && parsed.isOpenNow;

  // find today's current end if open now
  let statusText = "Закрыт";
  let statusClass = "text-danger";
  if (!acceptingOrders) {
    statusText = "Не принимает заказы";
  } else if (isOpenNow) {
    const today = new Date().getDay();
    const minutesNow = new Date().getHours() * 60 + new Date().getMinutes();
    const day = parsed.weeklySchedule.find((d) => d.dayIndex === today);
    const cur = day?.ranges.find((r) => minutesNow >= r.start && minutesNow < r.end);
    statusText = cur ? `Открыто до ${fmt(cur.end)}` : "Открыто";
    statusClass = "text-emerald-600";
  } else if (parsed.nextOpenLabel) {
    statusText = parsed.nextOpenLabel;
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden relative flex-shrink-0">
          {logo ? (
            <Image src={logo} alt={restaurant.name} fill sizes="56px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Icon name="restaurant" size={22} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">{restaurant.name}</div>
          <div className={`text-[11px] mt-0.5 font-medium ${statusClass}`}>{statusText}</div>
        </div>
      </div>

      {restaurant.address && (
        <div className="flex items-start gap-2 text-sm">
          <Icon name="location" size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="leading-snug">{restaurant.address}</span>
            {distance != null && (
              <span className="ml-1 text-[11px] text-muted">· {formatDistance(distance)}</span>
            )}
          </div>
        </div>
      )}

      {restaurant.phone && (
        <a
          href={`tel:${restaurant.phone}`}
          className="flex items-center gap-2 text-sm font-medium text-primary"
        >
          <Icon name="phone" size={16} />
          <span>{restaurant.phone}</span>
        </a>
      )}
    </div>
  );
}
