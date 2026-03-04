"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/api";
import type { Product } from "@/types";

interface ProductListCardProps {
  product: Product;
  isInCart?: boolean;
  quantity?: number;
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
}

export function ProductListCard({
  product,
  isInCart = false,
  quantity = 0,
  onAdd,
  onRemove,
}: ProductListCardProps) {
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
      className={`flex bg-white rounded-xl overflow-hidden shadow-sm border-2 transition-all relative cursor-pointer ${
        isInactive
          ? "cursor-not-allowed border-border"
          : isInCart
          ? "border-orange-500 bg-orange-50/30 shadow-md"
          : "border-border hover:shadow-md active:scale-[0.99]"
      }`}
    >
      {/* Image */}
      <div className="relative w-28 h-28 flex-shrink-0 bg-surface-light">
        {getImageUrl(product.imageUrl) ? (
          <Image
            src={getImageUrl(product.imageUrl)!}
            alt={product.name}
            fill
            className={`object-cover ${isInactive ? "blur-sm" : ""}`}
            sizes="112px"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              isInactive ? "blur-sm" : ""
            }`}
          >
            <Icon name="restaurant" size={32} className="text-muted" />
          </div>
        )}
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="text-white font-semibold text-xs bg-orange-500 px-2 py-1 rounded-full shadow-md">
              Недоступно
            </span>
          </div>
        )}
        {/* In cart badge */}
        {isInCart && !isInactive && (
          <div className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
            <Icon name="check" size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 p-3 flex flex-col justify-between ${isInactive ? "opacity-60" : ""}`}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
              {product.name}
            </h3>
            {product.rating > 0 && !isInactive && (
              <div className="flex items-center gap-0.5 text-xs text-gray-500 flex-shrink-0">
                <Icon name="star" size={12} className="text-orange-400" filled />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-muted text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span
            className={`font-bold text-lg ${
              isInactive ? "text-muted line-through" : "text-primary"
            }`}
          >
            {formatPrice(product.basePrice)} TJS
          </span>

          {/* Quantity controls when in cart */}
          {isInCart && !isInactive ? (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onRemove?.(product); }}
                className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
              >
                <Icon name="remove" size={18} className="text-white" />
              </button>
              <span className="font-bold text-orange-500 min-w-[24px] text-center">{quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdd?.(product); }}
                className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
              >
                <Icon name="add" size={18} className="text-white" />
              </button>
            </div>
          ) : !isInactive ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd?.(product); }}
              className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <Icon name="add" size={22} className="text-white" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
