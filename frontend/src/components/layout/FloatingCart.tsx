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
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-bottom-4 duration-300 px-4">
      <Link
        href="/cart"
        className="w-full max-w-md"
      >
        <div className="w-full bg-gradient-to-r from-[#1b4332] to-[#14532d] text-white rounded-full px-5 py-3 shadow-lg shadow-[#1b4332]/30 flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
          <div className="relative">
            <Icon name="shopping_cart" size={22} className="text-white" />
            <span className="absolute -top-2 -right-2 bg-[#dda15e] text-[#1b4332] text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {itemCount}
            </span>
          </div>
          <span className="font-semibold">Смотреть заказы {formatPrice(total)} TJS</span>
          <Icon name="arrow_forward" size={22} className="text-white" />
        </div>
      </Link>
    </div>
  );
}
