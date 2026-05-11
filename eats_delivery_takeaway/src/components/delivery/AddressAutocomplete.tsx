"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import type { JuraAddress } from "@/types/jura";

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Город, улица, дом",
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (addr: JuraAddress) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value);
  const { results, loading, error } = useAddressSearch(query);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Input
        label="Адрес"
        placeholder={placeholder}
        value={query}
        leftIcon={<Icon name="location" size={18} />}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-border rounded-2xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {loading && <div className="px-4 py-3 text-sm text-muted">Поиск...</div>}
          {error && <div className="px-4 py-3 text-sm text-red-500">{error}</div>}
          {!loading && !error && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted">Ничего не найдено</div>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setQuery(r.name);
                  onChange(r.name);
                  onSelect(r);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-border last:border-b-0 flex items-start gap-2"
              >
                <Icon name="location" size={16} className="mt-0.5 text-muted shrink-0" />
                <span className="text-sm">{r.name}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
