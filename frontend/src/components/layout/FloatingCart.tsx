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
        <div className="w-full bg-gradient-to-r from-[#00b867] to-[#009e58] text-white rounded-2xl px-6 py-4 shadow-lg shadow-[#00b867]/30 flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon name="shopping_cart" size={22} className="text-white" />
            </div>
            <span className="absolute -top-1 -left-1 bg-[#dda15e] text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-md">
              {itemCount}
            </span>
          </div>
          <span className="font-bold text-lg">Корзина · {formatPrice(total)} TJS</span>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon name="arrow_forward" size={22} className="text-white" />
          </div>
        </div>
      </Link>
    </div>
  );
}
