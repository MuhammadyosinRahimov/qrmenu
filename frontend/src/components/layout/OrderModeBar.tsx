"use client";

import { useState, useEffect } from "react";
import { useOrderModeStore, OrderMode } from "@/stores/orderModeStore";
import { useTableStore } from "@/stores/tableStore";

export function OrderModeBar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { mode, setMode } = useOrderModeStore();
  const tableNumber = useTableStore((state) => state.tableNumber);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Скрыть если QR режим или есть номер стола
  if (!isHydrated || mode === "qr" || tableNumber) {
    return null;
  }

  const modes: { value: OrderMode; label: string }[] = [
    { value: "delivery", label: "Доставка" },
    { value: "dinein", label: "В ресторане" },
    { value: "takeaway", label: "С собой" },
  ];

  return (
    <div className="sticky top-14 bg-white/95 backdrop-blur-sm border-b border-border z-30 safe-area-inset-top">
      <div className="flex items-center gap-2 h-12 px-4 max-w-lg mx-auto">
        <span className="text-sm text-muted whitespace-nowrap">Способ заказа:</span>
        <div className="flex flex-1 gap-1 bg-gray-100 p-1 rounded-lg">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`flex-1 px-2 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === m.value
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
