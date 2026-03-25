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
        <div className="w-full bg-gradient-to-r from-[#00b867] to-[#009e58] text-white rounded-xl px-4 py-2 shadow-lg shadow-[#00b867]/30 flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
          <div className="relative flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon name="shopping_cart" size={18} className="text-white" />
            </div>
            <span className="absolute -top-1 -left-1 bg-[#dda15e] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
              {itemCount}
            </span>
          </div>
          <span className="font-semibold text-base">Корзина · {formatPrice(total)} TJS</span>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon name="arrow_forward" size={18} className="text-white" />
          </div>
        </div>
      </Link>
    </div>
  );
}
