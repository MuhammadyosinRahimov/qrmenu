"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { Icon } from "@/components/ui/Icon";

export function FloatingCart() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  if (itemCount === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  return (
    <Link
      href="/cart"
      className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-5 py-3 shadow-lg shadow-orange-200 flex items-center gap-3 hover:shadow-xl hover:scale-105 transition-all duration-200">
        <div className="relative">
          <Icon name="shopping_cart" size={22} className="text-white" />
          <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {itemCount}
          </span>
        </div>
        <span className="font-semibold">{formatPrice(total)} TJS</span>
      </div>
    </Link>
  );
}
