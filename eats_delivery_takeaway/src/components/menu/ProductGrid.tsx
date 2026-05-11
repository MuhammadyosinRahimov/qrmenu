"use client";

import type { MenuCategory, MenuProduct } from "@/types";
import { ProductCard } from "./ProductCard";

interface Props {
  categories: MenuCategory[];
  query: string;
  cartItems: Map<string, number>;
  onAdd: (product: MenuProduct) => void;
  onRemove: (product: MenuProduct) => void;
  onOpen: (product: MenuProduct) => void;
}

export function ProductGrid({ categories, query, cartItems, onAdd, onRemove, onOpen }: Props) {
  const q = query.trim().toLowerCase();

  return (
    <div className="px-4 pb-24 space-y-6">
      {categories.map((c) => {
        const products = q
          ? c.products.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            )
          : c.products;
        if (q && products.length === 0) return null;
        return (
          <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-28">
            <h3 className="text-lg font-semibold mb-2">{c.name}</h3>
            {products.length === 0 ? (
              <div className="text-muted text-sm py-4">В этой категории пока нет блюд</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantity={cartItems.get(p.id) || 0}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onOpen={onOpen}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
