"use client";

import { useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { ProductListCard } from "./ProductListCard";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/stores/uiStore";
import type { Product, Category } from "@/types";

interface ProductGridProps {
  products: Product[];
  categories?: Category[];
  categoryRefs?: React.MutableRefObject<Map<string, HTMLDivElement>>;
  isLoading?: boolean;
  cartItems?: Map<string, number>; // productId -> quantity
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
}

export function ProductGrid({
  products,
  categories,
  categoryRefs,
  isLoading,
  cartItems,
  onAdd,
  onRemove,
}: ProductGridProps) {
  const { gridView } = useUIStore();

  // Группировка по категориям
  const groupedProducts = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [{ category: null as Category | null, products }];
    }

    const groups: { category: Category | null; products: Product[] }[] = [];
    const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

    sortedCategories.forEach(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      if (categoryProducts.length > 0) {
        groups.push({ category, products: categoryProducts });
      }
    });

    // Товары без категории
    const uncategorizedProducts = products.filter(
      p => !categories.some(c => c.id === p.categoryId)
    );
    if (uncategorizedProducts.length > 0) {
      groups.push({ category: null, products: uncategorizedProducts });
    }

    return groups;
  }, [categories, products]);

  if (isLoading) {
    return (
      <div className="px-4">
        <div className={gridView === "2x2" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden animate-pulse border border-border"
            >
              <div className={gridView === "2x2" ? "aspect-square bg-gray-100" : "h-24 bg-gray-100"} />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-muted text-4xl mb-4">
          <Icon name="restaurant" size={48} className="text-gray-300" />
        </div>
        <p className="text-muted">Нет доступных блюд</p>
      </div>
    );
  }

  // Рендер с группировкой по категориям
  return (
    <div className="space-y-6">
      {groupedProducts.map((group, idx) => (
        <div
          key={group.category?.id || `uncategorized-${idx}`}
          ref={(el) => {
            if (group.category && el && categoryRefs?.current) {
              categoryRefs.current.set(group.category.id, el);
            }
          }}
        >
          {/* Заголовок категории */}
          {group.category && (
            <div className="px-4 mb-3 flex items-center gap-2">
              {group.category.icon && (
                <span className="text-xl">{group.category.icon}</span>
              )}
              <h2 className="text-lg font-bold text-gray-800">
                {group.category.name}
              </h2>
            </div>
          )}

          {/* Товары категории */}
          <div className="px-4">
            <div className={gridView === "2x2" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
              {group.products.map((product) => {
                const quantity = cartItems?.get(product.id) || 0;

                if (gridView === "1x1") {
                  return (
                    <ProductListCard
                      key={product.id}
                      product={product}
                      isInCart={quantity > 0}
                      quantity={quantity}
                      onAdd={onAdd}
                      onRemove={onRemove}
                    />
                  );
                }

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInCart={quantity > 0}
                    quantity={quantity}
                    onAdd={onAdd}
                    onRemove={onRemove}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
