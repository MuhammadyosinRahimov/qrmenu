"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
            <Icon name="shopping_cart" size={48} className="text-orange-400" />
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
     

      <div className="p-4 space-y-4">
        {items.map((item) => {
          const isNoteExpanded = expandedNotes.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border"
            >
              {/* Main item content */}
              <div className="p-4 flex gap-4">
                {/* Image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {getImageUrl(item.imageUrl) ? (
                    <Image
                      src={getImageUrl(item.imageUrl)!}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="restaurant" size={28} className="text-muted" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-lg leading-tight">
                    {item.productName}
                  </h3>
                  {item.sizeName && (
                    <p className="text-sm text-muted mt-0.5">{item.sizeName}</p>
                  )}
                  {item.addonNames.length > 0 && (
                    <p className="text-sm text-muted mt-0.5 line-clamp-1">
                      + {item.addonNames.join(", ")}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-primary font-bold text-lg">
                      {formatPrice(item.totalPrice)} TJS
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-colors"
                      >
                        <Icon name="remove" size={20} />
                      </button>
                      <span className="w-10 text-center font-bold text-lg text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-colors"
                      >
                        <Icon name="add" size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note section */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => toggleNoteExpanded(item.id)}
                  className="w-full flex items-center justify-between py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="edit_note" size={18} />
                    <span>{item.note ? "Изменить комментарий" : "Добавить комментарий"}</span>
                  </div>
                  <Icon
                    name={isNoteExpanded ? "expand_less" : "expand_more"}
                    size={20}
                  />
                </button>

                {isNoteExpanded && (
                  <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                    <textarea
                      value={item.note || ""}
                      onChange={(e) => updateItemNote(item.id, e.target.value)}
                      placeholder="Например: без лука, острый соус отдельно..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-all"
                      rows={2}
                    />
                  </div>
                )}

                {item.note && !isNoteExpanded && (
                  <p className="text-sm text-gray-500 italic line-clamp-1 mt-1">
                    <Icon name="comment" size={14} className="inline mr-1" />
                    {item.note}
                  </p>
                )}
              </div>

              {/* Delete button */}
              <div className="px-4 pb-4 flex justify-end">
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm"
                >
                  <Icon name="delete" size={18} />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          );
        })}
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
            <span className="text-orange-500">{formatPrice(finalTotal)} TJS</span>
          </div>
        </div>

        <Button
          onClick={() => router.push("/checkout")}
          className="w-full"
          size="lg"
        >
          <Icon name="shopping_cart_checkout" size={22} className="mr-2" />
          Оформить заказ
        </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
