"use client";

import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/types";

interface CategoryListProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryList({
  categories,
  selectedId,
  onSelect,
}: CategoryListProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3">
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
          selectedId === null
            ? "bg-orange-500 text-white shadow-sm"
            : "bg-white text-muted border border-border hover:border-orange-300 hover:text-orange-500"
        }`}
      >
        <Icon name="grid_view" size={18} />
        <span className="text-sm font-medium">Все</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            selectedId === category.id
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-white text-muted border border-border hover:border-orange-300 hover:text-orange-500"
          }`}
        >
          <Icon name={category.icon} size={18} />
          <span className="text-sm font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  );
}
