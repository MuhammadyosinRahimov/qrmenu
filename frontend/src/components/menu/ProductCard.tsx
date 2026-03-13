"use client";

import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/api";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  isInCart?: boolean;
  quantity?: number;
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
}

export function ProductCard({
  product,
  isInCart = false,
  quantity = 0,
  onAdd,
  onRemove,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const isInactive = !product.isAvailable;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {getImageUrl(product.imageUrl) ? (
          <img
            src={getImageUrl(product.imageUrl)!}
            alt={product.name}
            className={`w-full h-full object-cover ${isInactive ? "blur-sm" : ""}`}
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              isInactive ? "blur-sm" : ""
            }`}
          >
            <Icon name="restaurant" size={48} className="text-muted" />
          </div>
        )}

        {/* Unavailable overlay */}
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="text-white font-semibold text-sm bg-gray-800 px-3 py-1.5 rounded-full shadow-md">
              Недоступно
            </span>
          </div>
        )}

        {/* Quantity badge on image */}
        {quantity > 0 && !isInactive && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold">{quantity}</span>
          </div>
        )}

        {/* Rating badge */}
        {product.rating > 0 && !isInactive && quantity === 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Icon name="star" size={14} className="text-yellow-500" filled />
            <span className="text-xs font-medium text-foreground">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Name and description */}
      <div className={`p-3 ${isInactive ? "opacity-60" : ""}`}>
        <h3 className="font-bold text-foreground text-sm line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Pill-bar selector */}
      {!isInactive && (
        <div className="px-3 pb-3">
          <div
            className={`flex items-center justify-between rounded-full h-12 transition-colors ${
              quantity > 0
                ? "bg-gray-100"
                : "bg-white border border-gray-200"
            }`}
          >
            {quantity > 0 ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(product);
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Icon name="remove" size={22} className="text-gray-700" />
                </button>
                <span className="font-bold text-foreground">
                  {formatPrice(product.basePrice)} TJS
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd?.(product);
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Icon name="add" size={22} className="text-gray-700" />
                </button>
              </>
            ) : (
              <>
                <span className="font-bold text-foreground pl-4">
                  {formatPrice(product.basePrice)} TJS
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd?.(product);
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Icon name="add" size={22} className="text-gray-700" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Inactive price display */}
      {isInactive && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-center rounded-full h-12 bg-gray-100">
            <span className="font-bold text-muted line-through">
              {formatPrice(product.basePrice)} TJS
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
