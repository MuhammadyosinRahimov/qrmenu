"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import type { PublicRestaurant } from "@/lib/api";
import { getImageUrl } from "@/lib/api";

interface RestaurantCardProps {
  restaurant: PublicRestaurant;
  onSelect: (restaurant: PublicRestaurant) => void;
  showDeliveryFee?: boolean;
}

// Gradient backgrounds for restaurants without images
const gradients = [
  "from-orange-400 via-orange-500 to-red-500",
  "from-purple-500 via-purple-600 to-indigo-600",
  "from-emerald-400 via-emerald-500 to-teal-600",
  "from-blue-400 via-blue-500 to-indigo-500",
  "from-pink-400 via-pink-500 to-rose-500",
  "from-amber-400 via-amber-500 to-orange-500",
];

// Food icons for restaurants without images
const foodIcons = [
  "restaurant",
  "lunch_dining",
  "local_pizza",
  "ramen_dining",
  "bakery_dining",
  "local_cafe",
];

export function RestaurantCard({
  restaurant,
  onSelect,
  showDeliveryFee = false,
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(restaurant.logoUrl);
  const hasImage = imageUrl && !imageError;

  // Deterministic selection based on restaurant ID
  const hash = restaurant.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = hash % gradients.length;
  const iconIndex = hash % foodIcons.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  return (
    <button
      onClick={() => onSelect(restaurant)}
      className="w-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 text-left group"
    >
      {/* Restaurant Image/Gradient Header */}
      <div className="relative h-32 overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center`}>
            <div className="relative">
              {/* Decorative circles */}
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              {/* Icon */}
              <div className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon name={foodIcons[iconIndex]} size={32} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Restaurant name on image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
            {restaurant.name}
          </h3>
        </div>

        {/* Delivery badge */}
        {showDeliveryFee && restaurant.deliveryEnabled && (
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
              <span className="text-sm font-semibold text-[#0f2c5e]">
                {restaurant.deliveryFee > 0
                  ? `${formatPrice(restaurant.deliveryFee)} TJS`
                  : "Бесплатно"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        {restaurant.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {restaurant.description}
          </p>
        )}

        {restaurant.address && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon name="location_on" size={14} className="text-gray-400" />
            </div>
            <span className="truncate">{restaurant.address}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {restaurant.deliveryEnabled && (
            <Badge variant="default" size="sm" className="bg-purple-50 text-purple-600 border-purple-100">
              <Icon name="delivery_dining" size={12} className="mr-1" />
              Доставка
            </Badge>
          )}
          {restaurant.takeawayEnabled && (
            <Badge variant="default" size="sm" className="bg-emerald-50 text-emerald-600 border-emerald-100">
              <Icon name="takeout_dining" size={12} className="mr-1" />
              С собой
            </Badge>
          )}
          {restaurant.onlinePaymentAvailable && (
            <Badge variant="success" size="sm" className="bg-blue-50 text-blue-600 border-blue-100">
              <Icon name="credit_card" size={12} className="mr-1" />
              Онлайн
            </Badge>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="flex items-center justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm text-orange-500 font-medium mr-1">Открыть меню</span>
          <Icon name="arrow_forward" size={16} className="text-orange-500" />
        </div>
      </div>
    </button>
  );
}
