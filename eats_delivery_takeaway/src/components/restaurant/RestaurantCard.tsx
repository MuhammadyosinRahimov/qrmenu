"use client";

import Image from "next/image";
import Link from "next/link";
import type { Restaurant } from "@/types";
import { getImageUrl } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { formatTJS } from "@/lib/format";
import { formatDistance } from "@/lib/geo";
import { parseWorkingHours } from "@/lib/workingHours";

interface Props {
  restaurant: Restaurant;
  deliveryFeePreview?: number | null;
  distanceKm?: number;
}

const GRADIENTS = [
  "from-orange-400 via-orange-500 to-red-500",
  "from-purple-500 via-purple-600 to-indigo-600",
  "from-emerald-400 via-emerald-500 to-teal-600",
  "from-blue-400 via-blue-500 to-indigo-500",
  "from-pink-400 via-pink-500 to-rose-500",
  "from-amber-400 via-amber-500 to-orange-500",
];

const FALLBACK_ICONS = [
  "restaurant",
  "lunch_dining",
  "local_pizza",
  "ramen_dining",
  "bakery_dining",
  "local_cafe",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function RestaurantCard({ restaurant, deliveryFeePreview, distanceKm }: Props) {
  const logo = getImageUrl(restaurant.logoUrl);
  const acceptingOrders = restaurant.acceptingOrders !== false;
  const hours = parseWorkingHours(restaurant.workingHours);
  const isOpen = acceptingOrders && hours.isOpenNow;

  const idHash = hashString(restaurant.id || restaurant.name);
  const gradient = GRADIENTS[idHash % GRADIENTS.length];
  const fallbackIcon = FALLBACK_ICONS[idHash % FALLBACK_ICONS.length];

  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className="relative w-full h-32 overflow-hidden">
        {logo ? (
          <Image
            src={logo}
            alt={restaurant.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} relative`}>
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-sm" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10 blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                <Icon name={fallbackIcon} size={32} />
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

        {!acceptingOrders && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-sm">
            <Badge variant="error" size="md">Закрыт</Badge>
          </div>
        )}
        {acceptingOrders && !hours.isOpenNow && (
          <div className="absolute top-2 left-2">
            <Badge variant="warning" size="sm">
              {hours.nextOpenLabel || "Закрыто"}
            </Badge>
          </div>
        )}

        {distanceKm != null && acceptingOrders && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-foreground shadow-sm">
            <Icon name="near_me" size={12} className="text-primary" />
            {formatDistance(distanceKm)}
          </div>
        )}

        <div className="absolute left-3 right-3 bottom-2 text-white drop-shadow-lg">
          <h3 className="font-bold text-base line-clamp-1">{restaurant.name}</h3>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {restaurant.description && (
          <p className="text-xs text-muted line-clamp-2">{restaurant.description}</p>
        )}
        {restaurant.address && (
          <div className="flex items-start gap-1.5 text-[11px] text-muted">
            <Icon name="location" size={14} className="text-primary flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {restaurant.deliveryEnabled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
              <Icon name="delivery" size={12} />
              Доставка
            </span>
          )}
          {restaurant.takeawayEnabled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-light text-secondary text-[10px] font-medium">
              <Icon name="takeaway" size={12} />
              Самовывоз
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2 text-muted">
            {restaurant.rating != null && (
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <Icon name="star" size={14} filled className="text-amber-500" />
                {restaurant.rating.toFixed(1)}
                {restaurant.reviewsCount != null && restaurant.reviewsCount > 0 && (
                  <span className="text-muted font-normal">({restaurant.reviewsCount})</span>
                )}
              </span>
            )}
            {restaurant.prepTimeMinutes != null && (
              <span className="inline-flex items-center gap-1">
                <Icon name="bolt" size={14} className="text-primary" />
                {restaurant.prepTimeMinutes} мин
              </span>
            )}
          </div>
          {(deliveryFeePreview != null || (restaurant.deliveryFee != null && restaurant.deliveryFee > 0)) && (
            <span className="text-primary font-medium">
              {formatTJS(deliveryFeePreview ?? restaurant.deliveryFee ?? 0)}
            </span>
          )}
        </div>

        {!acceptingOrders && restaurant.pauseMessage && (
          <div className="text-[11px] text-red-600 line-clamp-2">
            {restaurant.pauseMessage}
          </div>
        )}

        {/* hidden visual reserve to keep ts happy with isOpen var */}
        <span className="hidden">{isOpen ? "" : ""}</span>
      </div>
    </Link>
  );
}
