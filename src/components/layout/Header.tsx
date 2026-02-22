"use client";

import { useState, useEffect } from "react";
import { useTableStore } from "@/stores/tableStore";

interface HeaderProps {
  title?: string;
  showTable?: boolean;
}

export function Header({ title, showTable = true }: HeaderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const tableNumber = useTableStore((state) => state.tableNumber);
  const restaurantName = useTableStore((state) => state.restaurantName);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // До гидрации показываем fallback title чтобы избежать мигания
  const displayName = isHydrated ? (restaurantName || title || "QR Menu") : (title || "QR Menu");
  const displayTable = isHydrated ? tableNumber : null;

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border z-40 safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-foreground">
          {displayName}
        </h1>
        {showTable && displayTable && (
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            <span className="text-muted text-sm">Стол</span>
            <span className="text-primary font-bold">{displayTable}</span>
          </div>
        )}
      </div>
    </header>
  );
}
