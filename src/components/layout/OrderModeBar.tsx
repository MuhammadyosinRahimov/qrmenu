"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore, OrderMode } from "@/stores/orderModeStore";
import { useTableStore } from "@/stores/tableStore";

export function OrderModeBar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { mode, setMode } = useOrderModeStore();
  const tableNumber = useTableStore((state) => state.tableNumber);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't show if in QR mode (scanned QR code)
  if (!isHydrated || mode === "qr" || tableNumber) {
    return null;
  }

  const handleModeChange = (newMode: OrderMode) => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  return (
    <div className="sticky top-14 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-30">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <span className="text-sm text-gray-500 font-medium">Способ заказа</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange("delivery")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              mode === "delivery"
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon name="delivery_dining" size={18} />
            <span>Доставка</span>
          </button>
          <button
            onClick={() => handleModeChange("takeaway")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              mode === "takeaway"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon name="takeout_dining" size={18} />
            <span>С собой</span>
          </button>
        </div>
      </div>
    </div>
  );
}
