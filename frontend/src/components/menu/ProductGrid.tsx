"use client";

import { ProductCard } from "./ProductCard";
import { ProductListCard } from "./ProductListCard";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  cartItems?: Map<string, number>; // productId -> quantity
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
  showViewToggle?: boolean;
}

export function ProductGrid({
  products,
  isLoading,
  cartItems,
  onAdd,
  onRemove,
  showViewToggle = true,
}: ProductGridProps) {
  const { gridView, setGridView } = useUIStore();

  if (isLoading) {
    return (
      <div className="px-4">
        {showViewToggle && (
          <div className="flex justify-end gap-2 mb-4">
            <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        )}
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

  return (
    <div className="px-4">
      {/* View toggle */}
      {showViewToggle && (
        <div className="flex justify-end gap-1 mb-4">
          <button
            onClick={() => setGridView("1x1")}
            className={`p-2 rounded-lg transition-all ${
              gridView === "1x1"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Icon name="view_list" size={20} />
          </button>
          <button
            onClick={() => setGridView("2x2")}
            className={`p-2 rounded-lg transition-all ${
              gridView === "2x2"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Icon name="grid_view" size={20} />
          </button>
        </div>
      )}

      {/* Products grid */}
      <div className={gridView === "2x2" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
        {products.map((product) => {
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
  );
}
