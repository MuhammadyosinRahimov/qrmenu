"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTableStore } from "@/stores/tableStore";
import { getTableByNumber } from "@/lib/api";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTable = useTableStore((state) => state.setTable);

  useEffect(() => {
    const tableParam = searchParams.get("table");

    if (tableParam) {
      const tableNumber = parseInt(tableParam, 10);
      if (!isNaN(tableNumber)) {
        // Validate table and save to store
        getTableByNumber(tableNumber)
          .then((table) => {
            setTable(table.id, table.number);
            router.replace("/menu");
          })
          .catch(() => {
            // Table not found, redirect to menu anyway
            router.replace("/menu");
          });
        return;
      }
    }

    // No table param, redirect to menu
    router.replace("/menu");
  }, [searchParams, router, setTable]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>
        <p className="text-muted">Загрузка меню...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
            <p className="text-muted">Загрузка...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
