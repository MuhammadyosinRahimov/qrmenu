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
      <div className="sticky top-14 z-30 relative bg-white border-b border-gray-100 shadow-sm">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          className="flex gap-1 overflow-x-auto no-scrollbar px-4 scroll-smooth"
        >
          {/* Burger menu button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 my-1 rounded-xl bg-gradient-to-r from-[#00b867] to-[#009e58] text-white hover:shadow-md transition-all duration-200 flex-shrink-0"
          >
            <Icon name="menu" size={20} />
          </button>

          <button
            ref={(el) => { if (el) categoryRefs.current.set(null, el); }}
            onClick={() => handleSelect(null)}
            className={`relative flex items-center gap-1.5 px-4 py-3 whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              selectedId === null
                ? "text-[#00b867] font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className="text-sm">{selectedId === null ? "Все" : "Все"}</span>
            {selectedId === null && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-[#00b867] to-[#dda15e] rounded-full" />
            )}
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              ref={(el) => { if (el) categoryRefs.current.set(category.id, el); }}
              onClick={() => handleSelect(category.id)}
              className={`relative flex items-center gap-1.5 px-4 py-3 whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                selectedId === category.id
                  ? "text-[#00b867] font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="text-sm">{category.name}</span>
              {selectedId === category.id && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-[#00b867] to-[#dda15e] rounded-full" />
              )}
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
