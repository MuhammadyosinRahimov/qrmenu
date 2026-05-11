"use client";

import Image from "next/image";
import type { MenuProduct } from "@/types";
import { getImageUrl } from "@/lib/api";
import { formatTJS } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

interface Props {
  product: MenuProduct;
  quantity?: number;
  onAdd: (product: MenuProduct) => void;
  onRemove: (product: MenuProduct) => void;
  onOpen: (product: MenuProduct) => void;
}

export function ProductCard({ product, quantity = 0, onAdd, onRemove, onOpen }: Props) {
  const img = getImageUrl(product.imageUrl);
  const isInactive = !product.isAvailable;
  // Products with multiple sizes have a price range — prefix with "от" to
  // signal that the displayed base price is the minimum.
  const hasMultipleSizes = product.sizes.length > 1;
  const priceLabel = hasMultipleSizes
    ? `от ${formatTJS(product.basePrice)}`
    : formatTJS(product.basePrice);

  // Match reference UX: + / − always do quick add/remove with basePrice.
  // Card body click opens the customization sheet (size/addons) when available.
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(product);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(product);
  };

  const handleCardClick = () => {
    if (isInactive) return;
    onOpen(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 ${
        isInactive ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="50vw"
            className={`object-cover ${isInactive ? "blur-sm" : ""}`}
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center text-muted ${
              isInactive ? "blur-sm" : ""
            }`}
          >
            <Icon name="food" size={40} />
          </div>
        )}

        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="text-white font-semibold text-sm bg-gray-800 px-3 py-1.5 rounded-full shadow-md">
              Недоступно
            </span>
          </div>
        )}

        {quantity > 0 && !isInactive && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold">{quantity}</span>
          </div>
        )}
      </div>

      {/* Name and description */}
      <div className={`p-3 ${isInactive ? "opacity-60" : ""}`}>
        <h3 className="font-bold text-foreground text-sm line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-muted text-xs mt-1 line-clamp-2">{product.description}</p>
        )}
      </div>

      {/* Pill-bar selector */}
      {!isInactive && (
        <div className="px-3 pb-3">
          <div
            className={`flex items-center justify-between rounded-full h-12 transition-colors ${
              quantity > 0 ? "bg-gray-100" : "bg-white border border-gray-200"
            }`}
          >
            {quantity > 0 ? (
              <>
                <button
                  onClick={handleRemoveClick}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Icon name="minus" size={22} className="text-gray-700" />
                </button>
                <span className="font-bold text-foreground">{priceLabel}</span>
                <button
                  onClick={handleAddClick}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Icon name="add" size={22} className="text-gray-700" />
                </button>
              </>
            ) : (
              <>
                <span className="font-bold text-foreground pl-4">
                  {priceLabel}
                </span>
                <button
                  onClick={handleAddClick}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Icon name="add" size={22} className="text-gray-700" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isInactive && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-center rounded-full h-12 bg-gray-100">
            <span className="font-bold text-muted line-through">
              {priceLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
