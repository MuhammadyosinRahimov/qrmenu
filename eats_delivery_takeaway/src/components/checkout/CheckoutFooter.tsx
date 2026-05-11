"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { formatTJS } from "@/lib/format";

interface Props {
  subtotal?: number;
  total: number;
  ctaLabel?: string;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  extra?: ReactNode;
}

export function CheckoutFooter({
  subtotal,
  total,
  ctaLabel = "Подтвердить заказ",
  onSubmit,
  disabled,
  isLoading,
  extra,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-border px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.05)] space-y-2">
      {subtotal != null && (
        <div className="flex justify-between text-sm">
          <span className="text-muted">Сумма заказа</span>
          <span>{formatTJS(subtotal)}</span>
        </div>
      )}
      {extra}
      <div className="flex justify-between items-center">
        <span className="font-semibold">К оплате</span>
        <span className="text-lg font-bold text-primary">{formatTJS(total)}</span>
      </div>
      <Button fullWidth disabled={disabled} isLoading={isLoading} onClick={onSubmit}>
        {ctaLabel}
      </Button>
    </div>
  );
}
