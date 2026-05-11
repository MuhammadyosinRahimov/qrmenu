"use client";

import { Icon } from "@/components/ui/Icon";
import { formatPhone } from "@/lib/format";

export function DriverCard({
  name,
  phone,
  eta,
}: {
  name?: string | null;
  phone?: string | null;
  eta?: string | number | null;
}) {
  if (!name && !phone) return null;
  const etaLabel = eta == null ? null : typeof eta === "number" ? `${eta} мин` : eta;
  return (
    <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon name="delivery" size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted">Курьер</div>
        <div className="font-semibold truncate">{name ?? "Назначается"}</div>
        {etaLabel && <div className="text-xs text-muted mt-0.5">Примерное прибытие: {etaLabel}</div>}
      </div>
      {phone && (
        <a
          href={`tel:${phone}`}
          className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0"
          aria-label="Позвонить"
        >
          <Icon name="phone" size={20} />
        </a>
      )}
      {phone && <div className="sr-only">{formatPhone(phone.replace(/^\+?992/, ""))}</div>}
    </div>
  );
}
