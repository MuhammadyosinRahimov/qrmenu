"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getImageUrl, getPublicTableOrders, PublicTableOrders } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useTableStore } from "@/stores/tableStore";
import { Header } from "@/components/layout/Header";
import { useCallback } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, updateItemNote, removeItem, getSubtotal, getTax, getTotal } =
    useCartStore();
  const { mode, deliveryFee } = useOrderModeStore();
  const { tableId, tableNumber, menuId } = useTableStore();

  // Navigate to menu with QR params preserved
  const navigateToMenu = useCallback(() => {
    // Try zustand store first, fallback to sessionStorage for hydration edge cases
    let effectiveTableNumber = tableNumber;
    let effectiveTableId = tableId;
    let effectiveMenuId = menuId;
    let effectiveMode = mode;

    // Always check sessionStorage as fallback for any missing value
    if (typeof window !== "undefined") {
      try {
        // Read table data from sessionStorage
        const tableStorage = sessionStorage.getItem("table-storage-v2");
        if (tableStorage) {
          const parsed = JSON.parse(tableStorage);
          if (parsed.state) {
            if (!effectiveTableNumber) {
              effectiveTableNumber = parsed.state.tableNumber;
            }
            if (!effectiveTableId) {
              effectiveTableId = parsed.state.tableId;
            }
            if (!effectiveMenuId) {
              effectiveMenuId = parsed.state.menuId;
            }
          }
        }
        // Read mode from sessionStorage
        const modeStorage = sessionStorage.getItem("order-mode-storage-v2");
        if (modeStorage) {
          const parsed = JSON.parse(modeStorage);
          if (parsed.state && parsed.state.mode) {
            effectiveMode = parsed.state.mode;
          }
        }
      } catch (e) {
        console.warn("Failed to read from sessionStorage:", e);
      }
    }

    // Navigate with table params if in QR mode with table info
    if (effectiveMode === "qr" && effectiveTableNumber) {
      router.push(`/menu?table=${effectiveTableNumber}${effectiveMenuId ? `&menu=${effectiveMenuId}` : ''}`);
    } else if (effectiveTableNumber) {
      // Fallback: even if mode is not "qr", include table params if we have them
      router.push(`/menu?table=${effectiveTableNumber}${effectiveMenuId ? `&menu=${effectiveMenuId}` : ''}`);
    } else {
      router.push("/menu");
    }
  }, [mode, tableNumber, tableId, menuId, router]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [tableOrders, setTableOrders] = useState<PublicTableOrders | null>(null);
  const [loadingTableOrders, setLoadingTableOrders] = useState(false);

  const isDelivery = mode === "delivery";
  const isQrMode = mode === "qr";

  // Load table orders in QR mode
  useEffect(() => {
    if (isQrMode && tableId) {
      setLoadingTableOrders(true);
      getPublicTableOrders(tableId)
        .then(setTableOrders)
        .finally(() => setLoadingTableOrders(false));
    }
  }, [isQrMode, tableId]);

  // Calculate service fee - use session data if available, otherwise use local calculation
  const sessionServiceFeePercent = tableOrders?.serviceFeePercent ?? 10;
  const serviceFee = isQrMode ? Math.round(getSubtotal() * sessionServiceFeePercent / 100) : 0;
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

  // Empty cart but table has orders - show table orders
  if (items.length === 0 && (!tableOrders || tableOrders.orders.length === 0)) {
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
          <Button onClick={navigateToMenu}>Перейти в меню</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-56">
      <Header title="Корзина" />

      <div className="p-4 space-y-4">
        {/* Table Orders Section - shows orders from other guests as cards */}
        {isQrMode && tableOrders?.hasActiveSession && tableOrders.orders.length > 0 && (
          <div className="mb-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Icon name="group" size={16} />
              Заказы стола ({tableOrders.guestCount} {tableOrders.guestCount === 1 ? 'гость' : tableOrders.guestCount < 5 ? 'гостя' : 'гостей'})
            </h3>
            {tableOrders.orders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {/* Status header with gradient */}
                <div className={`px-4 py-2 flex items-center justify-between ${
                  order.isPaid
                    ? "bg-gradient-to-r from-green-50 to-emerald-50"
                    : "bg-gradient-to-r from-primary-light to-primary-50"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      order.isPaid ? "bg-green-100" : "bg-primary-50"
                    }`}>
                      <Icon
                        name={order.isPaid ? "check_circle" : "schedule"}
                        size={14}
                        className={order.isPaid ? "text-green-500" : "text-primary-dark"}
                      />
                    </div>
                    <span className={`font-medium text-sm ${
                      order.isPaid ? "text-green-700" : "text-primary-dark"
                    }`}>
                      {order.isPaid ? "Оплачено" : "Ожидает оплаты"}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-gray-600 font-medium">
                    Гость {idx + 1}
                  </span>
                </div>

                {/* Order content */}
                <div className="p-3 space-y-2">
                  {/* Guest phone */}
                  <div className="flex items-center gap-2">
                    <Icon name="person" size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {order.maskedPhone || `Гость ${idx + 1}`}
                    </span>
                  </div>

                  {/* Order items */}
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.productName}
                        {item.sizeName && <span className="text-gray-400 text-xs"> ({item.sizeName})</span>}
                        <span className="text-gray-400"> x{item.quantity}</span>
                      </span>
                      <span className="text-gray-700 font-medium">{formatPrice(item.totalPrice)} TJS</span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="text-sm text-gray-500">Итого</span>
                    <span className="font-bold text-primary">{formatPrice(order.subtotal)} TJS</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Table total summary */}
            <div className="bg-gradient-to-r from-primary-light to-primary-50 rounded-2xl p-4 border border-primary-200">
              <div className="flex justify-between font-medium text-primary-dark">
                <span>Общая сумма стола</span>
                <span className="text-lg font-bold">{formatPrice(tableOrders.tableTotal)} TJS</span>
              </div>
              <p className="text-xs text-primary-600 mt-1">
                Включает обслуживание {tableOrders.serviceFeePercent}%
              </p>
            </div>
          </div>
        )}

        {/* My Cart Items */}
        {items.length > 0 && isQrMode && (tableOrders?.orders?.length ?? 0) > 0 && (
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Icon name="person" size={16} />
            Мои новые блюда
          </h3>
        )}

        {items.map((item) => {
          const isNoteExpanded = expandedNotes.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-3"
            >
              {/* Изображение слева - квадратное */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {getImageUrl(item.imageUrl) ? (
                  <img
                    src={getImageUrl(item.imageUrl)!}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="restaurant" size={24} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Контент справа */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-1">
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
                  {/* Комментарий */}
                  {item.note && !isNoteExpanded && (
                    <p className="text-xs text-gray-400 italic line-clamp-1 mt-0.5">
                      {item.note}
                    </p>
                  )}
                </div>

                {/* Цена и управление количеством */}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary">
                    {formatPrice(item.totalPrice)} TJS
                  </span>

                  {/* Кнопки +/- */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Icon name="remove" size={16} className="text-gray-600" />
                    </button>
                    <span className="w-6 text-center font-medium text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Icon name="add" size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Кнопка комментария */}
                <button
                  onClick={() => toggleNoteExpanded(item.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
                >
                  <Icon name="edit_note" size={14} />
                  <span>{item.note ? "Изменить" : "Добавить комментарий"}</span>
                </button>

                {isNoteExpanded && (
                  <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                    <textarea
                      value={item.note || ""}
                      onChange={(e) => updateItemNote(item.id, e.target.value)}
                      placeholder="Комментарий к блюду..."
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                      rows={2}
                    />
                  </div>
                )}
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
                <span>Обслуживание ({sessionServiceFeePercent}%)</span>
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
            <Icon name="shopping_cart_checkout" size={22} className="mr-2 text-[#40916c]" />
            Оформить заказ
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
