"use client";

import Image from "next/image";
import type { Restaurant } from "@/types";
import { getImageUrl } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { parseWorkingHours } from "@/lib/workingHours";

export function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
  const logo = getImageUrl(restaurant.logoUrl);
  const hours = parseWorkingHours(restaurant.workingHours);
  const acceptingOrders = restaurant.acceptingOrders !== false;
  const isOpen = acceptingOrders && hours.isOpenNow;

  return (
    <div className="bg-white">
      <div className="relative w-full h-44 bg-gray-100">
        {logo ? (
          <Image src={logo} alt={restaurant.name} fill sizes="100vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Icon name="restaurant" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
              isOpen
                ? "bg-emerald-500/90 text-white"
                : "bg-red-500/90 text-white",
            ].join(" ")}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-white" : "bg-white/80"}`} />
            {isOpen ? "Открыто" : acceptingOrders ? "Закрыто" : "Закрыт"}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight">{restaurant.name}</h2>
            {restaurant.description && (
              <p className="text-sm text-muted mt-1 line-clamp-2">{restaurant.description}</p>
            )}
          </div>
          {restaurant.rating != null && (
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700">
                <Icon name="star" size={16} filled />
                <span className="font-semibold text-sm">{restaurant.rating.toFixed(1)}</span>
              </div>
              {restaurant.reviewsCount != null && restaurant.reviewsCount > 0 && (
                <span className="text-[11px] text-muted">{restaurant.reviewsCount} отзывов</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {restaurant.address && (
            <div className="flex items-start gap-2 text-muted">
              <Icon name="location" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="leading-snug">{restaurant.address}</span>
            </div>
          )}
          {restaurant.workingHours && (
            <div className="flex items-start gap-2 text-muted">
              <Icon name="clock" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="leading-snug">
                {restaurant.workingHours}
                {!isOpen && hours.nextOpenLabel && (
                  <span className="ml-1 text-foreground">· {hours.nextOpenLabel}</span>
                )}
              </span>
            </div>
          )}
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex items-center gap-2 text-foreground hover:text-primary transition"
            >
              <Icon name="phone" size={16} className="text-primary flex-shrink-0" />
              <span className="font-medium">{restaurant.phone}</span>
            </a>
          )}
        </div>

        {!acceptingOrders && restaurant.pauseMessage && (
          <div className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            <Icon name="info" size={16} className="mt-0.5 flex-shrink-0" />
            <span>{restaurant.pauseMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {restaurant.deliveryEnabled && (
            <Badge variant="primary">
              <span className="inline-flex items-center gap-1">
                <Icon name="delivery" size={12} /> Доставка
              </span>
            </Badge>
          )}
          {restaurant.takeawayEnabled && (
            <Badge variant="default">
              <span className="inline-flex items-center gap-1">
                <Icon name="takeaway" size={12} /> Самовывоз
              </span>
            </Badge>
          )}
          {restaurant.prepTimeMinutes != null && (
            <Badge variant="default">
              <span className="inline-flex items-center gap-1">
                <Icon name="clock" size={12} /> {restaurant.prepTimeMinutes} мин
              </span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
