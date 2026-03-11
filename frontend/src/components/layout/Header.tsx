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
  const displayName = isHydrated ? (restaurantName || title || "Oson eats") : (title || "Oson eats");
  const displayTable = isHydrated ? tableNumber : null;

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border z-40 safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-bold text-foreground truncate max-w-[180px]">
            {displayName}
          </h1>
        </div>
        {showTable && displayTable && (
          <div className="flex items-center gap-2 bg-primary-light px-3 py-1.5 rounded-full border border-primary-200">
            <span className="text-muted text-sm">Стол</span>
            <span className="text-primary font-bold">{displayTable}</span>
          </div>
        )}
      </div>
    </header>
  );
}
