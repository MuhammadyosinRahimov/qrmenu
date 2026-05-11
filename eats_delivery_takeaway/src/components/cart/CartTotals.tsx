"use client";

import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { formatTJS } from "@/lib/format";

export function CartTotals() {
  const subtotal = useCartStore((s) => s.getSubtotal());
  const deliveryFee = useCartStore((s) => s.getDeliveryFee());
  const total = useCartStore((s) => s.getTotal());
  const mode = useOrderModeStore((s) => s.mode);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-3 space-y-1.5 text-xs">
      <div className="flex justify-between">
        <span className="text-muted">Сумма заказа</span>
        <span className="font-medium">{formatTJS(subtotal)}</span>
      </div>
      {mode === "delivery" && (
        <div className="flex justify-between">
          <span className="text-muted">Доставка</span>
          <span className="font-medium">{deliveryFee > 0 ? formatTJS(deliveryFee) : "—"}</span>
        </div>
      )}
      <div className="border-t border-border pt-2 mt-1 flex justify-between items-center">
        <span className="font-semibold text-sm">Итого</span>
        <span className="text-base font-bold text-primary">{formatTJS(total)}</span>
      </div>
    </div>
  );
}
