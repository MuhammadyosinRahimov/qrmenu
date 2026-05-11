"use client";

import { useQuery } from "@tanstack/react-query";
import { getJuraTariffs } from "@/lib/api";
import { formatTJS } from "@/lib/format";

export function TariffSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (tariffId: number) => void;
}) {
  const { data: tariffs, isLoading } = useQuery({
    queryKey: ["jura-tariffs"],
    queryFn: getJuraTariffs,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="text-sm text-muted px-4 py-3 bg-white rounded-2xl border border-border">
        Загрузка тарифов...
      </div>
    );
  }

  if (!tariffs || tariffs.length === 0) {
    return (
      <div className="text-sm text-red-500 px-4 py-3 bg-white rounded-2xl border border-border">
        Нет доступных тарифов
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Тариф доставки</div>
      <div className="grid gap-2">
        {tariffs.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  {t.description && (
                    <div className="text-xs text-muted mt-0.5">{t.description}</div>
                  )}
                </div>
                {typeof t.basePrice === "number" && (
                  <div className="text-sm font-semibold">{formatTJS(t.basePrice)}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
