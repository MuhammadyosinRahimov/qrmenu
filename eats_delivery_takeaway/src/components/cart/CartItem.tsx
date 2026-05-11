"use client";

import { useState } from "react";
import Image from "next/image";
import type { CartItem as CartItemType, MenuProduct } from "@/types";
import { getImageUrl } from "@/lib/api";
import { formatTJS } from "@/lib/format";
import { useCartStore } from "@/stores/cartStore";
import { Icon } from "@/components/ui/Icon";

export function CartItem({ item, product }: { item: CartItemType; product?: MenuProduct }) {
  const updateQty = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItemNote = useCartStore((s) => s.updateItemNote);
  const updateItemSize = useCartStore((s) => s.updateItemSize);
  const [noteOpen, setNoteOpen] = useState(false);
  const img = getImageUrl(item.imageUrl);

  const sizes = product?.sizes ?? [];
  const showSizeSelector = sizes.length > 1;
  const handleSize = (size: { id: string; name: string; priceModifier: number }) => {
    if (!product || size.id === item.sizeId) return;
    const addonSum = item.addonIds.reduce(
      (s, id) => s + (product.addons.find((a) => a.id === id)?.price ?? 0),
      0
    );
    const newUnitPrice = product.basePrice + size.priceModifier + addonSum;
    updateItemSize(item.id, size.id, size.name, newUnitPrice);
  };

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {img ? (
            <Image src={img} alt={item.productName} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Icon name="food" size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-xs font-semibold line-clamp-1">{item.productName}</h4>
              {!showSizeSelector && item.sizeName && (
                <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-[9px] font-semibold uppercase tracking-wide">
                  {item.sizeName}
                </span>
              )}
              {item.addonNames.length > 0 && (
                <p className="text-[11px] text-muted line-clamp-1 mt-0.5">+ {item.addonNames.join(", ")}</p>
              )}
              {item.note && !noteOpen && (
                <p className="text-[11px] text-secondary-dark italic mt-0.5 line-clamp-1">«{item.note}»</p>
              )}
            </div>
            <button onClick={() => removeItem(item.id)} className="text-muted hover:text-danger p-1" aria-label="Удалить">
              <Icon name="close" size={18} />
            </button>
          </div>
          {showSizeSelector && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {sizes.map((s) => {
                const active = s.id === item.sizeId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSize(s)}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition ${
                      active
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border bg-white text-foreground"
                    }`}
                  >
                    {s.name}
                    {s.priceModifier !== 0 && (
                      <span className="ml-1 text-[9px] text-muted">
                        {s.priceModifier > 0 ? "+" : ""}
                        {s.priceModifier}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-0.5">
              <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full flex items-center justify-center">
                <Icon name="minus" size={16} />
              </button>
              <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
              <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                <Icon name="plus" size={16} />
              </button>
            </div>
            <span className="font-semibold text-xs">{formatTJS(item.totalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] text-muted hover:text-foreground transition-colors"
        >
          <Icon name="edit" size={14} />
          <span>{item.note ? "Изменить комментарий" : "Добавить комментарий"}</span>
        </button>
        {noteOpen && (
          <div className="mt-2">
            <textarea
              value={item.note || ""}
              onChange={(e) => updateItemNote(item.id, e.target.value)}
              placeholder="Комментарий к блюду..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-xs placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
