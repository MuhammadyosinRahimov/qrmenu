"use client";

import { formatTJS, formatDistance, formatDuration } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

export function DeliveryCostBox({
  loading,
  error,
  price,
  distance,
  duration,
}: {
  loading?: boolean;
  error?: string | null;
  price?: number | null;
  distance?: number | null;
  duration?: number | null;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-4 text-sm text-muted">
        Рассчитываем стоимость доставки...
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }
  if (price == null) return null;

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Доставка JURA</span>
        <span className="text-lg font-bold text-primary">{formatTJS(price)}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted">
        {distance != null && (
          <div className="flex items-center gap-1">
            <Icon name="delivery" size={14} />
            <span>{formatDistance(distance)}</span>
          </div>
        )}
        {duration != null && (
          <div className="flex items-center gap-1">
            <Icon name="clock" size={14} />
            <span>{formatDuration(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
