"use client";

import { useOrderModeStore } from "@/stores/orderModeStore";
import { Icon } from "@/components/ui/Icon";

export function ModeSwitcher({ className = "" }: { className?: string }) {
  const mode = useOrderModeStore((s) => s.mode);
  const setMode = useOrderModeStore((s) => s.setMode);

  const pill = (active: boolean) =>
    [
      "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition",
      active
        ? "bg-white text-primary border-2 border-primary shadow-sm"
        : "text-foreground/70 border-2 border-transparent hover:text-foreground",
    ].join(" ");

  return (
    <div className={`inline-flex items-center bg-gray-100 rounded-full p-1 ${className}`}>
      <button
        type="button"
        onClick={() => setMode("delivery")}
        aria-pressed={mode === "delivery"}
        className={pill(mode === "delivery")}
      >
        <Icon name="delivery" size={18} />
        Доставка
      </button>
      <button
        type="button"
        onClick={() => setMode("takeaway")}
        aria-pressed={mode === "takeaway"}
        className={pill(mode === "takeaway")}
      >
        <Icon name="takeaway" size={18} />
        Самовывоз
      </button>
    </div>
  );
}
