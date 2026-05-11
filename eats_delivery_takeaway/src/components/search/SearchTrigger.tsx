"use client";

import { Icon } from "@/components/ui/Icon";

interface SearchTriggerProps {
  placeholder?: string;
  onClick: () => void;
}

export function SearchTrigger({ placeholder = "Поиск", onClick }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 rounded-2xl bg-white border border-border px-4 flex items-center gap-3 text-left active:scale-[0.99] transition shadow-sm hover:shadow-md"
    >
      <Icon name="search" size={20} className="text-muted flex-shrink-0" />
      <span className="text-muted text-sm truncate">{placeholder}</span>
    </button>
  );
}
