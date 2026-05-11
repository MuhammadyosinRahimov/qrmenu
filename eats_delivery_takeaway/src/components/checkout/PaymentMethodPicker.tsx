"use client";

import { useEffect, useMemo } from "react";
import { PaymentMethod } from "@/types/enums";
import { Icon } from "@/components/ui/Icon";

const OPTIONS: Array<{ value: PaymentMethod; label: string; icon: string }> = [
  { value: PaymentMethod.cash, label: "Наличные", icon: "cash" },
  { value: PaymentMethod.card, label: "Банковская карта", icon: "card" },
];

export function PaymentMethodPicker({
  value,
  onChange,
  allowed,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
  allowed?: PaymentMethod[];
}) {
  const visible = useMemo(
    () => (allowed && allowed.length > 0 ? OPTIONS.filter((o) => allowed.includes(o.value)) : OPTIONS),
    [allowed]
  );

  // If the current selection becomes disallowed (e.g. switch from takeaway
  // to delivery where only card is allowed), fall back to the first allowed
  // option so the user is never stuck on an invisible choice.
  useEffect(() => {
    if (visible.length === 0) return;
    if (!visible.some((o) => o.value === value)) {
      onChange(visible[0].value);
    }
  }, [visible, value, onChange]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Способ оплаты</div>
      <div className="grid gap-2">
        {visible.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition ${
                active ? "border-primary bg-primary/5" : "border-border bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  active ? "bg-primary text-white" : "bg-gray-100 text-muted"
                }`}
              >
                <Icon name={opt.icon} size={20} />
              </div>
              <span className="font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
