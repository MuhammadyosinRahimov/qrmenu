"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl, getProduct, getPublicTableOrders } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useTableStore } from "@/stores/tableStore";
import { Header } from "@/components/layout/Header";
import type { ProductSize } from "@/types";

import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, updateItemNote, updateItemSize, removeItem, getSubtotal, getTax, getTotal } =
    useCartStore();
  const { mode, deliveryFee } = useOrderModeStore();
  const { tableId, tableNumber, menuId } = useTableStore();
  const [expandedSizeSelector, setExpandedSizeSelector] = useState<string | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [productSizes, setProductSizes] = useState<Record<string, ProductSize[]>>({});

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

  const isDelivery = mode === "delivery";
  const isQrMode = mode === "qr";

  // Service fee percent from restaurant settings
  const [sessionServiceFeePercent, setSessionServiceFeePercent] = useState(0);

  // Fetch service fee percent from API
  useEffect(() => {
    if (isQrMode && tableId) {
      getPublicTableOrders(tableId).then(data => {
        if (data) {
          setSessionServiceFeePercent(data.serviceFeePercent);
        }
      });
    }
  }, [isQrMode, tableId]);

  // Calculate service fee with proper decimal rounding (2 decimal places)
  const serviceFee = isQrMode
    ? Math.round(getSubtotal() * sessionServiceFeePercent) / 100
    : 0;
  const finalTotal = getSubtotal() + serviceFee + (isDelivery ? deliveryFee : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
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

  // Auto-load sizes for all products in cart
  useEffect(() => {
    const loadAllSizes = async () => {
      const productIds = [...new Set(items.map(item => item.productId))];
      for (const productId of productIds) {
        if (!productSizes[productId]) {
          try {
            const product = await getProduct(productId);
            if (product && product.sizes && product.sizes.length > 0) {
              setProductSizes(prev => ({ ...prev, [productId]: product.sizes }));
            }
          } catch (error) {
            console.error("Failed to load product sizes:", error);
          }
        }
      }
    };
    if (items.length > 0) {
      loadAllSizes();
    }
  }, [items]);

  // Handle size change - size price REPLACES base price completely
  const handleSizeChange = (itemId: string, item: typeof items[0], sizeId: string) => {
    const sizes = productSizes[item.productId];
    if (!sizes) return;

    const newSize = sizes.find(s => s.id === sizeId);
    if (!newSize) return;

    // Size price REPLACES the base price completely
    const newUnitPrice = newSize.priceModifier > 0
      ? newSize.priceModifier
      : item.unitPrice;

    updateItemSize(itemId, sizeId, newSize.name, newUnitPrice);
    setExpandedSizeSelector(null);
  };

  // Empty cart
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
        {items.map((item) => {
          const isNoteExpanded = expandedNotes.has(item.id);
          const sizes = productSizes[item.productId] || [];
          const hasSizes = sizes.length > 1;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Top section: Image + Details */}
              <div className="p-3 flex gap-3">
                {/* Image */}
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

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {item.productName}
                    </h3>
                    {item.addonNames.length > 0 && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                        + {item.addonNames.join(", ")}
                      </p>
                    )}
                    {item.note && !isNoteExpanded && (
                      <p className="text-xs text-gray-400 italic line-clamp-1 mt-0.5">
                        {item.note}
                      </p>
                    )}
                  </div>

                  {/* Price and quantity */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary text-lg">
                      {formatPrice(item.totalPrice)} TJS
                    </span>

                    {/* Quantity buttons */}
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
                </div>
              </div>

              {/* Size selection - Professional pill buttons */}
              {hasSizes && (
                <div className="px-3 pb-3">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon name="straighten" size={14} className="text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Размер</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const isSelected = item.sizeId === size.id;
                        return (
                          <button
                            key={size.id}
                            onClick={() => handleSizeChange(item.id, item, size.id)}
                            className={`
                              relative flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm
                              transition-all duration-200 ease-out
                              ${isSelected
                                ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-[1.02]"
                                : "bg-white text-gray-700 border border-gray-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                              }
                            `}
                          >
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Icon name="check" size={10} className="text-primary" />
                              </span>
                            )}
                            <span className={isSelected ? "text-white" : "text-gray-800"}>
                              {size.name}
                            </span>
                            {size.priceModifier > 0 && (
                              <span className={`text-xs ${isSelected ? "text-white/80" : "text-primary font-semibold"}`}>
                                {formatPrice(size.priceModifier)} TJS
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Comment section */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => toggleNoteExpanded(item.id)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon name="edit_note" size={14} />
                  <span>{item.note ? "Изменить комментарий" : "Добавить комментарий"}</span>
                </button>

                {isNoteExpanded && (
                  <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                    <textarea
                      value={item.note || ""}
                      onChange={(e) => updateItemNote(item.id, e.target.value)}
                      placeholder="Комментарий к блюду..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
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
            size="md"
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
