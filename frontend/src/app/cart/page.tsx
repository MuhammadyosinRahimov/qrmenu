"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { Header } from "@/components/layout/Header";

import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, updateItemNote, removeItem, getSubtotal, getTax, getTotal } =
    useCartStore();
  const { mode, deliveryFee } = useOrderModeStore();
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const isDelivery = mode === "delivery";
  const isQrMode = mode === "qr";
  // Service fee only for QR/dine-in mode
  const serviceFee = isQrMode ? getTax() : 0;
  const finalTotal = getSubtotal() + serviceFee + (isDelivery ? deliveryFee : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const toggleNoteExpanded = (itemId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Корзина" />

        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-6">
            <Icon name="shopping_cart" size={48} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Корзина пуста
          </h2>
          <p className="text-muted text-center mb-6">
            Добавьте блюда из меню, чтобы сделать заказ
          </p>
          <Button onClick={() => router.push("/menu")}>Перейти в меню</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-56">
      <Header title="Корзина" />

      <div className="p-4">
        {/* Grid layout - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const isNoteExpanded = expandedNotes.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                {/* Image with quantity badge */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {getImageUrl(item.imageUrl) ? (
                    <img
                      src={getImageUrl(item.imageUrl)!}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon
                        name="restaurant"
                        size={32}
                        className="text-muted"
                      />
                    </div>
                  )}
                  {/* Quantity badge */}
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{item.quantity}</span>
                  </div>
                </div>

                {/* Name and size */}
                <div className="p-2">
                  <h3 className="font-bold text-sm text-foreground line-clamp-1">
                    {item.productName}
                  </h3>
                  {item.sizeName && (
                    <p className="text-xs text-gray-400">{item.sizeName}</p>
                  )}
                  {item.addonNames.length > 0 && (
                    <p className="text-xs text-gray-400 line-clamp-1">
                      + {item.addonNames.join(", ")}
                    </p>
                  )}
                </div>

                {/* Pill-bar selector */}
                <div className="px-2 pb-2">
                  <div className="flex items-center justify-between rounded-full h-10 bg-gray-100">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Icon name="remove" size={18} className="text-gray-700" />
                    </button>
                    <span className="font-bold text-sm text-foreground">
                      {formatPrice(item.totalPrice)} TJS
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Icon name="add" size={18} className="text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Note toggle - compact */}
                <div className="px-2 pb-2">
                  <button
                    onClick={() => toggleNoteExpanded(item.id)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon name="edit_note" size={14} />
                    <span>{item.note ? "Комментарий" : "Добавить"}</span>
                  </button>

                  {isNoteExpanded && (
                    <div className="mt-1 animate-in slide-in-from-top-2 duration-200">
                      <textarea
                        value={item.note || ""}
                        onChange={(e) => updateItemNote(item.id, e.target.value)}
                        placeholder="Комментарий..."
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                        rows={2}
                      />
                    </div>
                  )}

                  {item.note && !isNoteExpanded && (
                    <p className="text-xs text-gray-400 italic line-clamp-1 text-center">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="p-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-muted">
              <span>Подитог</span>
              <span>{formatPrice(getSubtotal())} TJS</span>
            </div>
            {isQrMode && (
              <div className="flex justify-between text-muted">
                <span>Обслуживание (10%)</span>
                <span>{formatPrice(serviceFee)} TJS</span>
              </div>
            )}
            {isDelivery && deliveryFee > 0 && (
              <div className="flex justify-between text-muted">
                <span>Доставка</span>
                <span>{formatPrice(deliveryFee)} TJS</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-gray-100">
              <span>Итого</span>
              <span className="text-[#1b4332]">
                {formatPrice(finalTotal)} TJS
              </span>
            </div>
          </div>

          <Button
            onClick={() => router.push("/checkout")}
            className="w-full"
            variant="navy"
            size="lg"
          >
            <Icon name="shopping_cart_checkout" size={22} className="mr-2 text-[#dda15e]" />
            Оформить заказ
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
