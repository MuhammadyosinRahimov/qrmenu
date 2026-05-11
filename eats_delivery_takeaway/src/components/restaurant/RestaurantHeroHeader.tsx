"use client";

import Image from "next/image";
import type { Restaurant } from "@/types";
import { getImageUrl } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

interface Props {
  restaurant: Restaurant;
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

export function RestaurantHeroHeader({ restaurant }: Props) {
  const cover = getImageUrl(restaurant.logoUrl);
  const idHash = hashString(restaurant.id || restaurant.name);
  const gradient = GRADIENTS[idHash % GRADIENTS.length];
  const fallbackIcon = FALLBACK_ICONS[idHash % FALLBACK_ICONS.length];

  return (
    <div className="relative w-full h-52 overflow-hidden">
      {cover ? (
        <Image src={cover} alt={restaurant.name} fill priority sizes="100vw" className="object-cover" />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} relative`}>
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-md" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-white/10 blur-md" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Icon name={fallbackIcon} size={48} />
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />

      <div className="absolute inset-x-4 bottom-10 text-white drop-shadow-lg">
        <h1 className="text-2xl font-bold leading-tight">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="text-sm mt-1 line-clamp-1 text-white/90">{restaurant.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-sm">
          {restaurant.rating != null && (
            <span className="inline-flex items-center gap-1 font-semibold">
              <Icon name="star" size={14} filled className="text-amber-300" />
              {restaurant.rating.toFixed(1)}
              {restaurant.reviewsCount != null && restaurant.reviewsCount > 0 && (
                <span className="font-normal text-white/80">({restaurant.reviewsCount})</span>
              )}
            </span>
          )}
          {restaurant.prepTimeMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Icon name="bolt" size={14} className="text-amber-300" />
              {restaurant.prepTimeMinutes} мин
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
