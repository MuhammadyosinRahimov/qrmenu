"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl, getRestaurantMenu } from "@/lib/api";
import { formatTJS } from "@/lib/format";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import type { MenuProduct } from "@/types";

const MAX_ITEMS = 6;

export function CrossSell() {
  const restaurantId = useCartStore((s) => s.restaurantId);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const { showToast } = useToast();

  const { data: menu } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => getRestaurantMenu(restaurantId!),
    enabled: !!restaurantId,
  });

  const inCartIds = useMemo(() => new Set(items.map((i) => i.productId)), [items]);

  const suggestions = useMemo(() => {
    if (!menu) return [];
    const all: MenuProduct[] = [];
    for (const c of menu.categories) {
      for (const p of c.products) {
        if (!p.isAvailable) continue;
        if (inCartIds.has(p.id)) continue;
        all.push(p);
      }
    }
    return all.slice(0, MAX_ITEMS);
  }, [menu, inCartIds]);

  if (!restaurantId || suggestions.length === 0) return null;

  const handleAdd = (p: MenuProduct) => {
    // Просто добавляем в корзину с базовой ценой — без редиректа на меню,
    // чтобы юзер не терял контекст текущего заказа. Если у товара есть
    // размеры/добавки и нужны они — пусть открывает карточку отдельно.
    const defaultSize = p.sizes.find((s) => s.isDefault) ?? p.sizes[0];
    const unitPrice = p.basePrice + (defaultSize?.priceModifier ?? 0);
    addItem({
      productId: p.id,
      restaurantId,
      productName: p.name,
      imageUrl: p.imageUrl,
      sizeId: defaultSize?.id,
      sizeName: defaultSize?.name,
      addonIds: [],
      addonNames: [],
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
    });
    showToast(`${p.name} добавлен в корзину`);
  };

  return (
    <div className="mt-4">
      <h3 className="px-4 text-sm font-semibold text-foreground mb-2">
        Добавить к заказу
      </h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {suggestions.map((p) => {
          const img = getImageUrl(p.imageUrl);
          return (
            <div
              key={p.id}
              className="flex-shrink-0 w-36 bg-white border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="relative w-full aspect-square bg-gray-100">
                {img ? (
                  <Image src={img} alt={p.name} fill sizes="144px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted">
                    <Icon name="food" size={32} />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold leading-tight line-clamp-2 min-h-[2.25rem]">
                  {p.name}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {formatTJS(p.basePrice)}
                  </span>
                  <button
                    onClick={() => handleAdd(p)}
                    className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition"
                    aria-label="Добавить"
                  >
                    <Icon name="add" size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
