"use client";

import Image from "next/image";
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

  const handleCardClick = () => {
    if (isInactive || isInCart) return;
    onAdd?.(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`block bg-white rounded-xl overflow-hidden shadow-sm border-2 transition-all relative cursor-pointer ${
        isInactive
          ? "cursor-not-allowed border-border"
          : isInCart
          ? "border-orange-500 bg-orange-50/30 shadow-md"
          : "border-border hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
      }`}
    >
      {/* In cart checkmark */}
      {isInCart && !isInactive && (
        <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center animate-scale-in shadow-md">
          <Icon name="check" size={16} className="text-white" />
        </div>
      )}

      {/* Quantity badge */}
      {isInCart && quantity > 0 && !isInactive && (
        <div className="absolute top-2 right-2 z-20 min-w-6 h-6 px-1.5 rounded-full bg-orange-500 flex items-center justify-center animate-scale-in shadow-md">
          <span className="text-white text-xs font-bold">{quantity}</span>
        </div>
      )}

      <div className="relative aspect-square bg-surface-light">
        {getImageUrl(product.imageUrl) ? (
          <Image
            src={getImageUrl(product.imageUrl)!}
            alt={product.name}
            fill
            className={`object-cover ${isInactive ? "blur-sm" : ""}`}
            sizes="(max-width: 768px) 50vw, 200px"
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
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="text-white font-semibold text-sm bg-orange-500 px-3 py-1.5 rounded-full shadow-md">
              Недоступно
            </span>
          </div>
        )}
        {product.rating > 0 && !isInactive && !isInCart && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Icon name="star" size={14} className="text-orange-400" filled />
            <span className="text-xs font-medium text-foreground">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 ${isInactive ? "opacity-60" : ""}`}>
        <h3 className="font-semibold text-foreground text-sm line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted text-xs mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span
            className={`font-bold ${
              isInactive ? "text-muted line-through" : "text-primary"
            }`}
          >
            {formatPrice(product.basePrice)} TJS
          </span>
        </div>

        {/* Increment/decrement control when in cart */}
        {isInCart && !isInactive && (
          <div className="flex items-center justify-between mt-3 bg-orange-50 rounded-lg p-1">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.(product); }}
              className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
            >
              <Icon name="remove" size={20} className="text-white" />
            </button>
            <span className="font-bold text-primary">{formatPrice(product.basePrice)} TJS</span>
            <button
              onClick={(e) => { e.stopPropagation(); onAdd?.(product); }}
              className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
            >
              <Icon name="add" size={20} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Add button when not in cart */}
      {!isInCart && !isInactive && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd?.(product); }}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 hover:scale-110 shadow-lg flex items-center justify-center z-10 transition-all duration-150 active:scale-95"
        >
          <Icon name="add" size={24} className="text-white" />
        </button>
      )}
    </div>
  );
}
