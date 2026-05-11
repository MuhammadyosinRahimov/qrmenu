"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl, getRestaurant } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

interface Props {
  restaurantId: string;
}

export function CartRestaurantHeader({ restaurantId }: Props) {
  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  });

  if (!restaurant) return null;

  const logo = getImageUrl(restaurant.logoUrl);

  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="mx-4 mt-3 flex items-center gap-3 bg-white border border-border rounded-2xl px-3 py-2.5 hover:shadow-sm transition"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative flex-shrink-0">
        {logo ? (
          <Image src={logo} alt={restaurant.name} fill sizes="48px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Icon name="restaurant" size={20} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-xs truncate">{restaurant.name}</div>
        {restaurant.address && (
          <div className="text-[10px] text-muted truncate">{restaurant.address}</div>
        )}
      </div>
      <Icon name="chevron-right" size={18} className="text-muted flex-shrink-0" />
    </Link>
  );
}
