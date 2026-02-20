"use client";

import { useTableStore } from "@/stores/tableStore";

interface HeaderProps {
  title?: string;
  showTable?: boolean;
}

export function Header({ title = "QR Menu", showTable = true }: HeaderProps) {
  const tableNumber = useTableStore((state) => state.tableNumber);

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border z-40 safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {showTable && tableNumber && (
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            <span className="text-muted text-sm">Стол</span>
            <span className="text-primary font-bold">{tableNumber}</span>
          </div>
        )}
      </div>
    </header>
  );
}
