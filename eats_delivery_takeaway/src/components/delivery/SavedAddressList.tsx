"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomerAddresses } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Icon } from "@/components/ui/Icon";
import type { UserAddress } from "@/types";

export function SavedAddressList({ onSelect }: { onSelect: (a: UserAddress) => void }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const { data } = useQuery({
    queryKey: ["customer-addresses"],
    queryFn: getCustomerAddresses,
    enabled: isAuth,
  });

  if (!isAuth || !data || data.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Сохранённые адреса</div>
      <div className="grid gap-2">
        {data.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="w-full text-left px-4 py-3 rounded-2xl border border-border bg-white flex items-start gap-2"
          >
            <Icon name="location" size={18} className="text-muted mt-0.5" />
            <div className="flex-1 min-w-0">
              {a.label && <div className="text-sm font-semibold">{a.label}</div>}
              <div className="text-sm truncate">{a.address}</div>
              {a.entrance && (
                <div className="text-xs text-muted mt-0.5">подъезд {a.entrance}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
