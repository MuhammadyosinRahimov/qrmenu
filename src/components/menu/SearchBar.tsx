"use client";

import { Icon } from "@/components/ui/Icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Поиск...",
}: SearchBarProps) {
  return (
    <div className="relative px-4">
      <Icon
        name="search"
        size={20}
        className="absolute left-7 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-7 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
        >
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
