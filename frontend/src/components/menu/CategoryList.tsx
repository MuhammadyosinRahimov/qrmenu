"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { CategoryModal } from "./CategoryModal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Map<string | null, HTMLButtonElement>>(new Map());

  // Auto-scroll to selected category
  useEffect(() => {
    const selectedButton = categoryRefs.current.get(selectedId);
    const container = scrollContainerRef.current;

    if (selectedButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();

      // Calculate scroll position to center the button
      const scrollLeft = selectedButton.offsetLeft - container.offsetWidth / 2 + selectedButton.offsetWidth / 2;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth"
      });
    }
  }, [selectedId]);

  const handleSelect = (id: string | null) => {
    onSelect(id);
  };

  return (
    <>
      {/* Gradient fade edges for scroll indication */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-orange-50 to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-orange-50 to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 scroll-smooth"
        >
          {/* Burger menu button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            <Icon name="menu" size={20} />
          </button>

          <button
            ref={(el) => { if (el) categoryRefs.current.set(null, el); }}
            onClick={() => handleSelect(null)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
              selectedId === null
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200 scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500 hover:shadow-sm"
            }`}
          >
            <Icon name="grid_view" size={18} />
            <span className="text-sm font-semibold">Все</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              ref={(el) => { if (el) categoryRefs.current.set(category.id, el); }}
              onClick={() => handleSelect(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                selectedId === category.id
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200 scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500 hover:shadow-sm"
              }`}
            >
              <Icon name={category.icon} size={18} />
              <span className="text-sm font-semibold">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </>
  );
}
