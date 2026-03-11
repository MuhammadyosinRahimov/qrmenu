"use client";

import { Icon } from "@/components/ui/Icon";

type GridView = "1x1" | "2x2";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showViewToggle?: boolean;
  gridView?: GridView;
  onViewChange?: (view: GridView) => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Поиск...",
  showViewToggle = false,
  gridView = "2x2",
  onViewChange,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 px-4">
      <div className="relative flex-1">
        <Icon
          name="search"
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </div>

      {showViewToggle && onViewChange && (
        <div className="flex gap-1">
          <button
            onClick={() => onViewChange("1x1")}
            className={`p-2.5 rounded-lg transition-all ${
              gridView === "1x1"
                ? "bg-[ #f7df00] text-white shadow-sm"
                : "bg-white text-gray-500 border border-border hover:bg-gray-50"
            }`}
          >
            <Icon name="view_list" size={20} />
          </button>
          <button
            onClick={() => onViewChange("2x2")}
            className={`p-2.5 rounded-lg transition-all ${
              gridView === "2x2"
                ? "bg-[ #f7df00] text-white shadow-sm"
                : "bg-white text-gray-500 border border-border hover:bg-gray-50"
            }`}
          >
            <Icon name="grid_view" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
