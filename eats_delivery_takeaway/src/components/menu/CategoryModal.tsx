"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { MenuCategory } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  categories,
  selectedId,
  onSelect,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (id: string | null) => {
    onSelect(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl max-h-[80vh] overflow-hidden animate-slide-up-footer">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-foreground">Категории</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Icon name="close" size={20} className="text-gray-500" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="overflow-y-auto max-h-[calc(80vh-80px)] py-3 px-3 overscroll-contain"
        >
          <div className="grid grid-cols-3 gap-2">
            <CategoryTile
              active={selectedId === null}
              label="Все"
              onClick={() => handleSelect(null)}
              fallbackIcon="all"
              isAll
            />
            {categories.map((c) => {
              const active = selectedId === c.id;
              const img = c.iconUrl ? getImageUrl(c.iconUrl) : null;
              return (
                <CategoryTile
                  key={c.id}
                  active={active}
                  label={c.name}
                  imgUrl={img}
                  fallbackIcon={c.icon || "category"}
                  onClick={() => handleSelect(c.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryTile({
  active,
  label,
  imgUrl,
  fallbackIcon,
  onClick,
  isAll,
}: {
  active: boolean;
  label: string;
  imgUrl?: string | null;
  fallbackIcon: string;
  onClick: () => void;
  isAll?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col bg-white rounded-2xl overflow-hidden transition-all",
        active
          ? "ring-2 ring-primary border border-transparent shadow-md"
          : "border border-gray-100 shadow-sm hover:border-primary/40",
      ].join(" ")}
    >
      <span
        className={[
          "relative w-full aspect-square overflow-hidden flex items-center justify-center",
          isAll ? "bg-primary/5 text-primary" : "bg-gray-50 text-foreground/50",
        ].join(" ")}
      >
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={label}
            fill
            sizes="120px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <Icon name={fallbackIcon} size={44} />
        )}
      </span>
      <span
        className={[
          "px-2 py-2 text-xs font-semibold text-center leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center transition-colors",
          active ? "text-primary" : "text-foreground",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}
