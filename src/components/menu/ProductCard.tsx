"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/api";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const isInactive = !product.isAvailable;

  const handleClick = (e: React.MouseEvent) => {
    if (isInactive) {
      e.preventDefault();
    }
  };

  return (
    <Link
      href={isInactive ? "#" : `/menu/${product.id}`}
      onClick={handleClick}
      className={`block bg-white rounded-xl overflow-hidden shadow-sm border border-border transition-transform ${
        isInactive
          ? 'cursor-not-allowed'
          : 'hover:scale-[1.02] hover:shadow-md active:scale-[0.98]'
      }`}
    >
      <div className="relative aspect-square bg-surface-light">
        {getImageUrl(product.imageUrl) ? (
          <Image
            src={getImageUrl(product.imageUrl)!}
            alt={product.name}
            fill
            className={`object-cover ${isInactive ? 'blur-sm' : ''}`}
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${isInactive ? 'blur-sm' : ''}`}>
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
        {product.rating > 0 && !isInactive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Icon name="star" size={14} className="text-orange-400" filled />
            <span className="text-xs font-medium text-foreground">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 ${isInactive ? 'opacity-60' : ''}`}>
        <h3 className="font-semibold text-foreground text-sm line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted text-xs mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className={`font-bold ${isInactive ? 'text-muted line-through' : 'text-primary'}`}>
            {formatPrice(product.basePrice)} ₽
          </span>
          <div className="flex items-center gap-1 text-muted text-xs">
            <Icon name="schedule" size={14} />
            <span>{product.prepTimeMinutes} мин</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
