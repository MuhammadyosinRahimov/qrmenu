"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ModeButtons } from "@/components/layout/ModeButtons";
import { Icon } from "@/components/ui/Icon";
import { CartItem } from "@/components/cart/CartItem";
import { CartTotals } from "@/components/cart/CartTotals";
import { CrossSell } from "@/components/cart/CrossSell";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { CartRestaurantHeader } from "@/components/cart/CartRestaurantHeader";
import { CartFooter } from "@/components/cart/CartFooter";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useUIStore } from "@/stores/uiStore";
import { addItemsToOrder, getRestaurant, getRestaurantMenu } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { MenuProduct } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const toast = useToast();
  const items = useCartStore((s) => s.items);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const clear = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.getTotal());
  const itemsCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const addingToOrderId = useCartStore((s) => s.addingToOrderId);
  const mode = useOrderModeStore((s) => s.mode);
  const deliveryAddress = useOrderModeStore((s) => s.deliveryAddress);
  const openAddressModal = useUIStore((s) => s.openAddressModal);

  const [submitting, setSubmitting] = useState(false);
  const [productMap, setProductMap] = useState<Record<string, MenuProduct>>({});

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => getRestaurant(restaurantId as string),
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (!restaurantId || items.length === 0) {
      setProductMap({});
      return;
    }
    let cancelled = false;
    getRestaurantMenu(restaurantId)
      .then((menu) => {
        if (cancelled) return;
        const map: Record<string, MenuProduct> = {};
        for (const cat of menu.categories) {
          for (const p of cat.products) map[p.id] = p;
        }
        setProductMap(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [restaurantId, items.length]);

  const isEmpty = items.length === 0;
  const canCheckout = !isEmpty && (mode === "takeaway" || !!deliveryAddress);

  const onCheckout = async () => {
    if (addingToOrderId) {
      setSubmitting(true);
      try {
        await addItemsToOrder(addingToOrderId, {
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            sizeId: i.sizeId,
            addonIds: i.addonIds,
            note: i.note,
          })),
        });
        const orderId = addingToOrderId;
        clear();
        toast.show("Позиции добавлены в заказ", "success");
        router.replace(`/orders/${orderId}`);
      } catch (e: unknown) {
        toast.show(
          e instanceof Error ? e.message : "Не удалось добавить позиции",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (mode === "delivery" && !deliveryAddress) {
      openAddressModal();
      return;
    }
    router.push("/checkout");
  };

  const ctaLabel = addingToOrderId
    ? "Добавить в заказ"
    : mode === "delivery" && !deliveryAddress
    ? "Указать адрес"
    : "Оформить заказ";
  const showPrice = !addingToOrderId && (mode !== "delivery" || !!deliveryAddress);
  const ctaDisabled = !addingToOrderId && !canCheckout && mode === "takeaway";

  return (
    <div className="min-h-dvh pb-32 bg-surface">
      <Header
        title={addingToOrderId ? "Добавление к заказу" : "Корзина"}
        right={
          !isEmpty ? (
            <button onClick={clear} className="text-xs text-red-500" aria-label="Очистить">
              Очистить
            </button>
          ) : undefined
        }
      />

      {!addingToOrderId && (
        <div className="px-4 pt-3 max-w-lg mx-auto">
          <ModeButtons />
        </div>
      )}

      {addingToOrderId && !isEmpty && (
        <div className="mx-4 mt-3 rounded-xl bg-primary/10 border border-primary/30 px-3 py-2 text-xs text-primary">
          Эти позиции будут добавлены в существующий заказ № {addingToOrderId.slice(0, 8).toUpperCase()}
        </div>
      )}

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          {restaurantId && <CartRestaurantHeader restaurantId={restaurantId} />}

          <div className="p-4 space-y-3">
            {items.map((it) => (
              <CartItem key={it.id} item={it} product={productMap[it.productId]} />
            ))}
          </div>

          <CrossSell />

          {restaurant?.prepTimeMinutes != null && (
            <div className="px-4 mt-4">
              <div className="flex items-center gap-2 rounded-2xl bg-primary/5 border border-primary/15 px-4 py-3 text-sm">
                <Icon name="bolt" size={18} className="text-primary" />
                <span className="text-foreground/80">Время готовности</span>
                <span className="ml-auto font-semibold text-primary">
                  ~{restaurant.prepTimeMinutes} мин
                </span>
              </div>
            </div>
          )}

          <div className="px-4 mt-4">
            <CartTotals />
          </div>

          <CartFooter
            label={ctaLabel}
            itemsCount={itemsCount}
            total={total}
            showPrice={showPrice}
            onClick={onCheckout}
            isLoading={submitting}
            disabled={ctaDisabled}
          />
        </>
      )}
    </div>
  );
}
