"use client";

import { Icon } from "@/components/ui/Icon";

export function PaymentInfoLocked() {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Способ оплаты</div>
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-primary/30 bg-primary/5">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
          <Icon name="card" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Оплата картой онлайн</div>
          <div className="text-[11px] text-muted">
            Доставка оплачивается только онлайн
          </div>
        </div>
        <Icon name="lock" size={16} className="text-muted" />
      </div>
    </div>
  );
}
