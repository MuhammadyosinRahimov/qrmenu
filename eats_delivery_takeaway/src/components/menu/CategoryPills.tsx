"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuCategory } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { CategoryModal } from "./CategoryModal";

interface Props {
  categories: MenuCategory[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryPills({ categories, activeId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!activeId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLButtonElement>(`[data-cid="${activeId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <>
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100">
        <div className="relative flex items-stretch">
          <div
            ref={scrollRef}
            className="flex items-center gap-1 overflow-x-auto no-scrollbar px-4 scroll-smooth flex-1"
          >
            {categories.map((c) => {
              const active = activeId === c.id;
              return (
                <button
                  key={c.id}
                  data-cid={c.id}
                  onClick={() => onSelect(c.id)}
                  className="relative flex-shrink-0 px-3 py-3"
                >
                  <span
                    className={[
                      "text-sm whitespace-nowrap transition-colors",
                      active ? "font-bold text-foreground" : "font-medium text-foreground/50",
                    ].join(" ")}
                  >
                    {c.name}
                  </span>
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-foreground rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Все категории"
            className="flex-shrink-0 px-3 border-l border-gray-100 text-foreground/60 hover:text-primary transition-colors"
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        selectedId={activeId}
        onSelect={(id) => {
          if (id) onSelect(id);
        }}
      />
    </>
  );
}
