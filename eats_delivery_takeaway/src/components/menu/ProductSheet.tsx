"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { MenuProduct } from "@/types";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/api";
import { formatTJS } from "@/lib/format";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/components/ui/Toast";

interface Props {
  product: MenuProduct | null;
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductSheet({ product, restaurantId, isOpen, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { showToast } = useToast();

  const defaultSize = useMemo(
    () => product?.sizes.find((s) => s.isDefault) ?? product?.sizes[0] ?? null,
    [product]
  );
  const [sizeId, setSizeId] = useState<string | null>(defaultSize?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // Reset when product changes
  useMemo(() => {
    if (product) {
      const d = product.sizes.find((s) => s.isDefault) ?? product.sizes[0] ?? null;
      setSizeId(d?.id ?? null);
      setQuantity(1);
      setNote("");
    }
  }, [product]);

  if (!product) return null;

  const selectedSize = product.sizes.find((s) => s.id === sizeId);
  const sizeModifier = selectedSize?.priceModifier ?? 0;
  const unitPrice = product.basePrice + sizeModifier;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      restaurantId,
      productName: product.name,
      imageUrl: product.imageUrl,
      sizeId: selectedSize?.id,
      sizeName: selectedSize?.name,
      addonIds: [],
      addonNames: [],
      quantity,
      unitPrice,
      totalPrice,
      note: note.trim() || undefined,
    });
    showToast(`${product.name} добавлен в корзину`);
    onClose();
  };

  const img = getImageUrl(product.imageUrl);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} maxHeight="92vh">
      <div className="relative w-full h-56 bg-gray-100">
        {img ? (
          <Image src={img} alt={product.name} fill sizes="100vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Icon name="food" size={48} />
          </div>
        )}
      </div>
      <div className="px-5 py-4 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          {product.description && <p className="text-sm text-muted mt-1">{product.description}</p>}
        </div>

        {product.sizes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Размер</h4>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const active = sizeId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${
                      active
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border bg-white text-foreground"
                    }`}
                  >
                    {s.name}
                    {s.priceModifier !== 0 && (
                      <span className="ml-1 text-xs text-muted">
                        {s.priceModifier > 0 ? "+" : ""}
                        {s.priceModifier}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Комментарий к блюду</h4>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Например: без лука"
            rows={2}
            className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white"
            >
              <Icon name="minus" size={18} />
            </button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
          <Button onClick={handleAdd} size="lg">
            В корзину · {formatTJS(totalPrice)}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
