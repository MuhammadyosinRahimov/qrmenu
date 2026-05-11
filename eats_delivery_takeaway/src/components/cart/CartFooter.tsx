"use client";

import { Button } from "@/components/ui/Button";
import { formatTJS } from "@/lib/format";

interface Props {
  label: string;
  itemsCount?: number;
  total?: number;
  showPrice?: boolean;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CartFooter({
  label,
  itemsCount,
  total,
  showPrice = true,
  onClick,
  isLoading,
  disabled,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-5 py-3 rounded-full pb-[max(1rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <Button
        fullWidth
        onClick={onClick}
        isLoading={isLoading}
        disabled={disabled}
      >
        <span className="flex items-center   justify-between w-full text-sm">
          <span>{label}</span>
          {showPrice && total != null && (
            <span className="text-xs font-semibold opacity-90">
              {itemsCount != null ? `${itemsCount} шт · ` : ""}
              {formatTJS(total)}
            </span>
          )}
        </span>
      </Button>
    </div>
  );
}
