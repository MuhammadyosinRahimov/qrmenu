"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Icon } from "@/components/ui/Icon";
import { formatTJS } from "@/lib/format";

export function FloatingCart() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const pathname = usePathname();

  if (!hydrated) return null;
  if (items.length === 0) return null;

  const hideOn = ["/cart", "/checkout", "/checkout/success"];
  if (hideOn.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4 animate-slide-up">
      <Link href="/cart" className="w-full max-w-md">
        <div className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-full px-5 py-3 shadow-lg shadow-primary/30 flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
          <div className="relative flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="cart" size={20} className="text-white" />
            </div>
            <span className="absolute -top-1 -left-1 bg-secondary text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
              {count}
            </span>
          </div>
          <span className="font-semibold text-base">Корзина · {formatTJS(subtotal)}</span>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Icon name="chevron-right" size={20} className="text-white" />
          </div>
        </div>
      </Link>
    </div>
  );
}
