"use client";

import { useRef, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  categories,
  selectedId,
  onSelect,
}: CategoryModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to selected category when modal opens
  useEffect(() => {
    if (isOpen && selectedRef.current && scrollRef.current) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (id: string | null) => {
    onSelect(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl max-h-[70vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-800">Категории</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Icon name="close" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Category list with smooth scroll */}
        <div className="relative">
          {/* Top fade gradient */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="overflow-y-auto max-h-[calc(70vh-80px)] pb-6 pt-2 scroll-smooth overscroll-contain"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(251, 146, 60, 0.3) transparent"
            }}
          >
            {/* All categories button */}
            <button
              ref={selectedId === null ? selectedRef : null}
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 mx-2 my-1 rounded-2xl transition-all duration-200 ${
                selectedId === null
                  ? "bg-gradient-to-r from-orange-50 to-orange-100 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
              style={{ width: "calc(100% - 16px)" }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                selectedId === null
                  ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-gray-100 text-gray-500"
              }`}>
                <Icon name="grid_view" size={24} />
              </div>
              <span className={`font-semibold text-base ${
                selectedId === null ? "text-orange-600" : "text-gray-700"
              }`}>
                Все категории
              </span>
              {selectedId === null && (
                <div className="ml-auto w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <Icon name="check" size={16} className="text-white" />
                </div>
              )}
            </button>

            {/* Individual categories */}
            {categories.map((category, index) => (
              <button
                key={category.id}
                ref={selectedId === category.id ? selectedRef : null}
                onClick={() => handleSelect(category.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 mx-2 my-1 rounded-2xl transition-all duration-200 ${
                  selectedId === category.id
                    ? "bg-gradient-to-r from-orange-50 to-orange-100 shadow-sm"
                    : "hover:bg-gray-50"
                }`}
                style={{
                  width: "calc(100% - 16px)",
                  animationDelay: `${index * 30}ms`
                }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  selectedId === category.id
                    ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <Icon name={category.icon} size={24} />
                </div>
                <span className={`font-semibold text-base ${
                  selectedId === category.id ? "text-orange-600" : "text-gray-700"
                }`}>
                  {category.name}
                </span>
                {selectedId === category.id && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <Icon name="check" size={16} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
