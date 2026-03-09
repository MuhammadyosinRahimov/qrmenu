"use client";

import { useQuery } from "@tanstack/react-query";
import { getRestaurants, PublicRestaurant } from "@/lib/api";
import { RestaurantCard } from "./RestaurantCard";
import { Icon } from "@/components/ui/Icon";
import { OrderMode } from "@/stores/orderModeStore";

interface RestaurantListProps {
  mode: OrderMode;
  onSelectRestaurant: (restaurant: PublicRestaurant) => void;
  searchQuery?: string;
}

export function RestaurantList({ mode, onSelectRestaurant, searchQuery = "" }: RestaurantListProps) {
  const apiMode = mode === "delivery" ? "delivery" : mode === "takeaway" ? "takeaway" : undefined;

  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ["restaurants", apiMode],
    queryFn: () => getRestaurants(apiMode),
  });

  // Filter restaurants by search query
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.address?.toLowerCase().includes(query) ||
      restaurant.description?.toLowerCase().includes(query)
    );
  });

  const getModeTitle = () => {
    switch (mode) {
      case "delivery":
        return "Рестораны с доставкой";
      case "takeaway":
        return "Рестораны с самовывозом";
      case "dinein":
        return "Выберите ресторан";
      default:
        return "Рестораны";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "delivery":
        return "delivery_dining";
      case "takeaway":
        return "takeout_dining";
      case "dinein":
        return "restaurant";
      default:
        return "store";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
          >
            <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-20" />
                <div className="h-6 bg-gray-200 rounded-full w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="error" size={32} className="text-red-400" />
        </div>
        <p className="text-gray-600 font-medium mb-1">Ошибка загрузки</p>
        <p className="text-gray-400 text-sm">Не удалось загрузить рестораны</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="store" size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium mb-1">
          {mode === "delivery"
            ? "Нет ресторанов с доставкой"
            : mode === "takeaway"
            ? "Нет ресторанов с самовывозом"
            : "Нет доступных ресторанов"}
        </p>
        <p className="text-gray-400 text-sm">Попробуйте выбрать другой способ заказа</p>
      </div>
    );
  }

  if (filteredRestaurants.length === 0 && searchQuery.trim()) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
          <Icon name="search_off" size={32} className="text-orange-400" />
        </div>
        <p className="text-gray-600 font-medium mb-1">
          Ничего не найдено
        </p>
        <p className="text-gray-400 text-sm">Попробуйте изменить поисковый запрос</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Restaurant cards */}
      {filteredRestaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onSelect={onSelectRestaurant}
          showDeliveryFee={mode === "delivery"}
        />
      ))}
    </div>
  );
}
