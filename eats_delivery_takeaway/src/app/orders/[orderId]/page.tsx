"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { DriverCard } from "@/components/orders/DriverCard";
import { JuraStatusBadge } from "@/components/orders/JuraStatusBadge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { getOrder, createPayment } from "@/lib/api";
import { useState } from "react";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { formatTJS, formatDateTime } from "@/lib/format";
import { OrderStatus, orderStatusLabel, normalizeOrderStatus } from "@/types/enums";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/components/ui/Toast";

const STATUS_GRADIENT: Record<string, string> = {
  Pending: "from-primary-light to-primary-50",
  Confirmed: "from-green-50 to-emerald-50",
  Preparing: "from-amber-50 to-yellow-50",
  Cooking: "from-amber-50 to-yellow-50",
  WaitingPayment: "from-yellow-50 to-amber-50",
  Ready: "from-blue-50 to-cyan-50",
  DeliveryJura: "from-indigo-50 to-blue-50",
  OnRoute: "from-indigo-50 to-blue-50",
  Completed: "from-emerald-50 to-green-50",
  Cancelled: "from-red-50 to-rose-50",
};
const STATUS_ICON_BG: Record<string, string> = {
  Pending: "bg-primary-50",
  Confirmed: "bg-green-100",
  Preparing: "bg-amber-100",
  Cooking: "bg-amber-100",
  WaitingPayment: "bg-yellow-100",
  Ready: "bg-blue-100",
  DeliveryJura: "bg-indigo-100",
  OnRoute: "bg-indigo-100",
  Completed: "bg-emerald-100",
  Cancelled: "bg-red-100",
};
const STATUS_ICON_COLOR: Record<string, string> = {
  Pending: "text-primary-dark",
  Confirmed: "text-green-700",
  Preparing: "text-amber-700",
  Cooking: "text-amber-700",
  WaitingPayment: "text-yellow-800",
  Ready: "text-blue-700",
  DeliveryJura: "text-indigo-700",
  OnRoute: "text-indigo-700",
  Completed: "text-emerald-700",
  Cancelled: "text-red-700",
};
const STATUS_ICON: Record<string, string> = {
  Pending: "clock",
  Confirmed: "check",
  Preparing: "clock",
  Cooking: "clock",
  WaitingPayment: "payments",
  Ready: "check",
  DeliveryJura: "delivery",
  OnRoute: "delivery",
  Completed: "check",
  Cancelled: "close",
};

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const startAddingToOrder = useCartStore((s) => s.startAddingToOrder);
  const [paying, setPaying] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    refetchInterval: 15000,
  });

  useOrderTracking(orderId);

  const handleRepeat = () => {
    if (!order || !order.restaurantId) return;
    clearCart();
    for (const it of order.items ?? []) {
      addItem({
        productId: it.productId,
        restaurantId: order.restaurantId,
        productName: it.productName,
        addonIds: [],
        addonNames: it.selectedAddons ?? [],
        sizeName: it.sizeName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.unitPrice * it.quantity,
        note: it.note,
      });
    }
    toast.show("Товары добавлены в корзину", "success");
    router.push("/cart");
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
        <Header title="Заказ" />
        <div className="p-8 text-center text-sm text-muted">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
        <Header title="Заказ" />
        <div className="p-8 text-center text-sm text-muted">Заказ не найден</div>
      </div>
    );
  }

  const normalized = normalizeOrderStatus(order.status as unknown as number | string);
  const statusGradient = STATUS_GRADIENT[normalized] ?? "from-primary-light to-primary-50";
  const statusIconBg = STATUS_ICON_BG[normalized] ?? "bg-primary-50";
  const statusIconColor = STATUS_ICON_COLOR[normalized] ?? "text-primary-dark";
  const statusIconName = STATUS_ICON[normalized] ?? "clock";

  const isDelivery = !!order.deliveryAddress || order.orderType === "Delivery";
  const mode: "delivery" | "takeaway" = isDelivery ? "delivery" : "takeaway";
  const canReview = order.status === OrderStatus.Completed;
  const canRepeat =
    order.status === OrderStatus.Completed || order.status === OrderStatus.Cancelled;
  const isCardUnpaid =
    order.paymentMethod === "card" && !order.isPaid && order.status === OrderStatus.WaitingPayment;
  const isCashAwaitingMark =
    order.paymentMethod === "cash" && !order.isPaid && order.status === OrderStatus.WaitingPayment;
  const canAddItems =
    !isDelivery &&
    (order.status === OrderStatus.Pending ||
      order.status === OrderStatus.WaitingPayment);

  const retryPayment = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const pay = await createPayment({
        orderId: order.id,
        approveUrl: `${origin}/payment/callback?orderId=${order.id}&result=success`,
        declineUrl: `${origin}/payment/callback?orderId=${order.id}&result=failed`,
        cancelUrl: `${origin}/payment/callback?orderId=${order.id}&result=cancelled`,
      });
      if (pay.formUrl) {
        window.location.href = pay.formUrl;
        return;
      }
      toast.show("Не удалось создать платёж", "error");
    } catch {
      toast.show("Ошибка повторной оплаты", "error");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-24">
      <Header title={`Заказ № ${order.id.slice(0, 8).toUpperCase()}`} />

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className={`bg-gradient-to-r ${statusGradient} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${statusIconBg} flex items-center justify-center`}>
                <Icon name={statusIconName} size={16} className={statusIconColor} />
              </div>
              <span className={`font-medium text-sm ${statusIconColor}`}>
                {orderStatusLabel(normalized)}
              </span>
            </div>
            <JuraStatusBadge juraStatusId={order.juraStatusId ?? null} />
          </div>
          <div className="p-4">
            <div className="text-xs text-muted">Ресторан</div>
            <div className="font-semibold">{order.restaurantName}</div>
            <div className="text-xs text-muted mt-1">{formatDateTime(order.createdAt)}</div>
          </div>
        </div>

        {isCashAwaitingMark && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Icon name="info" size={18} className="text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                Ожидает подтверждения оплаты
              </div>
            </div>
          </div>
        )}

        {isCardUnpaid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Icon name="info" size={18} className="text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                Завершите оплату, чтобы заказ был передан ресторану.
              </div>
            </div>
            <Button fullWidth isLoading={paying} onClick={retryPayment}>
              Оплатить
            </Button>
          </div>
        )}

        <OrderStatusTimeline current={order.status} mode={mode} />

        {isDelivery && (
          <DriverCard name={order.performerName} phone={order.performerPhone} eta={order.eta} />
        )}

        {isDelivery && (order.driverLat != null || order.performerName) && (
          <Link href={`/orders/${order.id}/tracking`}>
            <Button variant="secondary" fullWidth>
              <Icon name="location" size={18} className="mr-2" />
              Открыть карту курьера
            </Button>
          </Link>
        )}

        {isDelivery && order.deliveryAddress && (
          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Icon name="location" size={18} className="text-primary mt-0.5" />
              <div>
                <div className="text-xs text-muted">Адрес доставки</div>
                <div className="text-sm">{order.deliveryAddress}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-border rounded-2xl p-4 space-y-3">
          <div className="text-sm font-semibold">Состав заказа</div>
          {order.items?.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="truncate">
                  {it.productName} <span className="text-muted">×{it.quantity}</span>
                </div>
                {it.note && <div className="text-xs text-muted italic">«{it.note}»</div>}
              </div>
              <span className="font-medium">{formatTJS(it.totalPrice)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-border space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Сумма</span>
              <span>{formatTJS(order.subtotal ?? order.total ?? 0)}</span>
            </div>
            {order.deliveryFee != null && order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Доставка</span>
                <span>{formatTJS(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border font-semibold">
              <span>Итого</span>
              <span className="text-primary">{formatTJS(order.total ?? order.totalAmount ?? 0)}</span>
            </div>
          </div>
        </div>

        {order.status === OrderStatus.Cancelled && order.cancelReason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Icon name="error" size={18} className="text-red-500 mt-0.5" />
              <div>
                <div className="font-semibold text-red-600">Причина отмены</div>
                <div className="text-sm text-red-600 mt-1">{order.cancelReason}</div>
              </div>
            </div>
          </div>
        )}

        {!isDelivery && order.status === OrderStatus.Ready && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Icon name="success" size={20} className="text-primary mt-0.5" />
              <div>
                <div className="font-semibold text-primary">Заказ готов к выдаче</div>
                <div className="text-sm mt-1">Можно забирать в ресторане</div>
              </div>
            </div>
          </div>
        )}

        {canReview && (
          <Link href={`/orders/${order.id}/review`}>
            <Button fullWidth>
              <Icon name="star" size={18} className="mr-2" />
              Оставить отзыв
            </Button>
          </Link>
        )}

        {canAddItems && order.restaurantId && (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              startAddingToOrder(order.id, order.restaurantId!);
              router.push(`/restaurants/${order.restaurantId}`);
            }}
          >
            <Icon name="add" size={18} className="mr-2" />
            Добавить позиции
          </Button>
        )}

        {canRepeat && order.restaurantId && (
          <Button variant="secondary" fullWidth onClick={handleRepeat}>
            <Icon name="cart" size={18} className="mr-2" />
            Повторить заказ
          </Button>
        )}

        <Badge variant="default">Оплата: {paymentLabel(order.paymentMethod)}</Badge>
      </div>

    </div>
  );
}

function paymentLabel(m: string | undefined | null): string {
  switch (m) {
    case "cash":
      return "Наличные";
    case "card":
      return "Карта";
    default:
      return "—";
  }
}
