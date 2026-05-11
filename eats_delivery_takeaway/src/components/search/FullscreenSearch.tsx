"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl, getRestaurants } from "@/lib/api";
import { useOrderModeStore } from "@/stores/orderModeStore";
import type { Restaurant, MenuCategory, MenuProduct } from "@/types";
import { formatTJS } from "@/lib/format";

const RECENT_KEY_PREFIX = "search_recent_";
const RECENT_LIMIT = 8;

type Scope = "restaurants" | "menu";

interface FullscreenSearchProps {
  scope: Scope;
  onClose: () => void;
  /** When scope = menu */
  menuCategories?: MenuCategory[];
  /** Optional: callback to scroll/select category */
  onCategorySelect?: (categoryId: string) => void;
  /** Optional: callback when product picked */
  onProductSelect?: (product: MenuProduct) => void;
  /** When scope = restaurants */
  initialQuery?: string;
}

function getRecent(scope: Scope): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY_PREFIX + scope);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

function pushRecent(scope: Scope, q: string) {
  if (typeof window === "undefined") return;
  const trimmed = q.trim();
  if (!trimmed) return;
  const cur = getRecent(scope).filter((x) => x.toLowerCase() !== trimmed.toLowerCase());
  cur.unshift(trimmed);
  window.localStorage.setItem(RECENT_KEY_PREFIX + scope, JSON.stringify(cur.slice(0, RECENT_LIMIT)));
}

export function FullscreenSearch({
  scope,
  onClose,
  menuCategories = [],
  onCategorySelect,
  onProductSelect,
  initialQuery = "",
}: FullscreenSearchProps) {
  const [q, setQ] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecent(scope));
    inputRef.current?.focus();
  }, [scope]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trimmed = q.trim().toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[60] bg-white flex flex-col"
    >
      <div className="pt-[env(safe-area-inset-top)] border-b border-border">
        <div className="flex items-center gap-2 px-2 h-14 max-w-lg mx-auto w-full">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Закрыть"
          >
            <Icon name="back" size={22} />
          </button>
          <div className="flex-1 relative">
            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => trimmed && pushRecent(scope, q)}
              placeholder={scope === "restaurants" ? "Поиск ресторанов и блюд" : "Поиск по меню"}
              className="w-full h-10 pl-10 pr-10 rounded-2xl bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted"
                aria-label="Очистить"
              >
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto w-full">
          {scope === "restaurants" ? (
            <RestaurantsScope
              query={trimmed}
              recent={recent}
              onPickRecent={(r) => setQ(r)}
              onClose={onClose}
            />
          ) : (
            <MenuScope
              query={trimmed}
              categories={menuCategories}
              onCategorySelect={(id) => {
                onCategorySelect?.(id);
                onClose();
              }}
              onProductSelect={(p) => {
                onProductSelect?.(p);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function RestaurantsScope({
  query,
  recent,
  onPickRecent,
  onClose,
}: {
  query: string;
  recent: string[];
  onPickRecent: (q: string) => void;
  onClose: () => void;
}) {
  const mode = useOrderModeStore((s) => s.mode);
  const { data } = useQuery({
    queryKey: ["restaurants", mode],
    queryFn: () => getRestaurants(mode),
  });

  const filtered = useMemo<Restaurant[]>(() => {
    if (!data || !query) return [];
    return data.filter((r) => {
      const haystack = `${r.name} ${r.description ?? ""} ${r.address ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [data, query]);

  if (!query) {
    return (
      <div className="p-4 space-y-6">
        {recent.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted mb-3">Недавние</h3>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => onPickRecent(r)}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border text-sm hover:bg-gray-100"
                >
                  {r}
                </button>
              ))}
            </div>
          </section>
        )}
        <section>
          <h3 className="text-sm font-semibold text-muted mb-3">Популярные категории</h3>
          <div className="grid grid-cols-2 gap-2">
            {["Пицца", "Бургеры", "Суши", "Шашлык", "Десерты", "Кофе"].map((c) => (
              <button
                key={c}
                onClick={() => onPickRecent(c)}
                className="px-3 py-3 rounded-2xl bg-surface border border-border text-sm font-medium text-left hover:bg-gray-100"
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (filtered.length === 0) {
    return <div className="p-8 text-center text-muted text-sm">Ничего не найдено</div>;
  }

  return (
    <div className="p-4 space-y-2">
      {filtered.map((r) => {
        const logo = getImageUrl(r.logoUrl);
        return (
          <Link
            key={r.id}
            href={`/restaurants/${r.id}`}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-border hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative flex-shrink-0">
              {logo ? (
                <Image src={logo} alt={r.name} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <Icon name="restaurant" size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{r.name}</div>
              {r.description && (
                <div className="text-xs text-muted truncate">{r.description}</div>
              )}
            </div>
            <Icon name="chevron-right" size={18} className="text-muted" />
          </Link>
        );
      })}
    </div>
  );
}

function MenuScope({
  query,
  categories,
  onCategorySelect,
  onProductSelect,
}: {
  query: string;
  categories: MenuCategory[];
  onCategorySelect: (id: string) => void;
  onProductSelect: (p: MenuProduct) => void;
}) {
  const flatProducts = useMemo<MenuProduct[]>(() => {
    return categories.flatMap((c) => c.products);
  }, [categories]);

  const filtered = useMemo<MenuProduct[]>(() => {
    if (!query) return [];
    return flatProducts.filter((p) => {
      const haystack = `${p.name} ${p.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [flatProducts, query]);

  if (!query) {
    return (
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-muted">Категории</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategorySelect(c.id)}
              className="px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium hover:bg-gray-100"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return <div className="p-8 text-center text-muted text-sm">Ничего не найдено</div>;
  }

  return (
    <div className="p-4 space-y-2">
      {filtered.map((p) => {
        const img = getImageUrl(p.imageUrl);
        return (
          <button
            key={p.id}
            onClick={() => onProductSelect(p)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-border hover:shadow-md transition text-left"
          >
            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden relative flex-shrink-0">
              {img ? (
                <Image src={img} alt={p.name} fill sizes="56px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <Icon name="restaurant" size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{p.name}</div>
              {p.description && (
                <div className="text-xs text-muted line-clamp-1">{p.description}</div>
              )}
              <div className="text-sm text-primary font-semibold mt-0.5">
                {formatTJS(p.basePrice)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
