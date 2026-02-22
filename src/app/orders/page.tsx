"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getOrders, cancelOrderItem } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import type { OrderStatus, OrderItemStatus, Order } from "@/types";
import { normalizeOrderStatus, normalizeItemStatus } from "@/types";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "primary" }
> = {
  Pending: { label: "Ожидает", variant: "warning" },
  Confirmed: { label: "Подтверждён", variant: "primary" },
  Preparing: { label: "Готовится", variant: "primary" },
  Ready: { label: "Готов", variant: "success" },
  Delivered: { label: "Доставлен", variant: "success" },
  Completed: { label: "Завершён", variant: "default" },
  Cancelled: { label: "Отменён", variant: "error" },
};

const itemStatusConfig: Record<
  OrderItemStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "primary" }
> = {
  Pending: { label: "Новое", variant: "warning" },
  Active: { label: "Принято", variant: "success" },
  Cancelled: { label: "Отменено", variant: "error" },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: isAuthenticated,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const cancelItemMutation = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      cancelOrderItem(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder(null);
    },
    onSettled: () => {
      setCancellingItemId(null);
    },
  });

  const handleCancelItem = (orderId: string, itemId: string) => {
    if (confirm("Вы уверены, что хотите отменить это блюдо?")) {
      setCancellingItemId(itemId);
      cancelItemMutation.mutate({ orderId, itemId });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Мои заказы" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
            <Icon name="lock" size={48} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Требуется авторизация
          </h2>
          <p className="text-muted text-center mb-6">
            Чтобы просмотреть историю заказов, оформите заказ
          </p>
          <Button onClick={() => router.push("/menu")}>Перейти в меню</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Мои заказы" />
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse border border-border">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Мои заказы" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
            <Icon name="receipt_long" size={48} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Нет заказов</h2>
          <p className="text-muted text-center mb-6">
            Ваши заказы появятся здесь после оформления
          </p>
          <Button onClick={() => router.push("/menu")}>Перейти в меню</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Мои заказы" />

      <div className="p-4 space-y-4">
        {orders.map((order) => {
          const normalizedStatus = normalizeOrderStatus(order.status);
          const status = statusConfig[normalizedStatus] || { label: String(order.status) || "Неизвестно", variant: "default" as const };
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl p-4 space-y-3 border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-foreground font-semibold">
                    {order.tableName || `Стол #${order.tableNumber}`}
                  </p>
                  {order.restaurantName && (
                    <p className="text-xs text-primary">{order.restaurantName}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={status.variant} size="md">
                    {status.label}
                  </Badge>
                  {order.hasPendingItems && (
                    <Badge variant="warning" size="sm">
                      Новые блюда
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                {order.items.slice(0, 3).map((item) => {
                  const normalizedItemStatus = normalizeItemStatus(item.status);
                  const itemStatus = itemStatusConfig[normalizedItemStatus] || { label: "Активно", variant: "success" as const };
                  const isCancelled = normalizedItemStatus === "Cancelled";
                  return (
                    <div
                      key={item.id}
                      className={`flex justify-between text-sm ${isCancelled ? "opacity-50" : ""}`}
                    >
                      <span className={`text-muted ${isCancelled ? "line-through" : ""}`}>
                        {item.productName} x{item.quantity}
                        <span className={`ml-2 text-xs px-1 rounded ${
                          normalizedItemStatus === "Pending" ? "bg-orange-100 text-orange-600" :
                          normalizedItemStatus === "Cancelled" ? "bg-red-100 text-red-600" :
                          "bg-green-100 text-green-600"
                        }`}>
                          {itemStatus.label}
                        </span>
                      </span>
                      <span className={`text-foreground ${isCancelled ? "line-through" : ""}`}>
                        {formatPrice(item.totalPrice)} TJS
                      </span>
                    </div>
                  );
                })}
                {order.items.length > 3 && (
                  <p className="text-sm text-muted">+{order.items.length - 3} ещё...</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted">Итого</span>
                <span className="text-orange-500 font-bold text-lg">
                  {formatPrice(order.total)} TJS
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-border">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedOrder.tableName || `Стол #${selectedOrder.tableNumber}`}
                  </h2>
                  {selectedOrder.restaurantName && (
                    <p className="text-sm text-primary">{selectedOrder.restaurantName}</p>
                  )}
                  <p className="text-sm text-muted">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <Badge variant={statusConfig[normalizeOrderStatus(selectedOrder.status)]?.variant || "default"}>
                  {statusConfig[normalizeOrderStatus(selectedOrder.status)]?.label || String(selectedOrder.status)}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Позиции заказа</h3>
              {selectedOrder.items.map((item) => {
                const normalizedItemStatus = normalizeItemStatus(item.status);
                const normalizedOrderStatus = normalizeOrderStatus(selectedOrder.status);
                const isCancelled = normalizedItemStatus === "Cancelled";
                const isPending = normalizedItemStatus === "Pending";
                const canCancel = (isPending || normalizedOrderStatus === "Pending") && !isCancelled;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${
                      isCancelled ? "bg-red-50 border-red-200 opacity-60" :
                      isPending ? "bg-orange-50 border-orange-200" :
                      "bg-white border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${isCancelled ? "line-through text-gray-400" : "text-foreground"}`}>
                            {item.productName}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isCancelled ? "bg-red-100 text-red-600" :
                            isPending ? "bg-orange-100 text-orange-600" :
                            "bg-green-100 text-green-600"
                          }`}>
                            {itemStatusConfig[normalizedItemStatus]?.label || "Активно"}
                          </span>
                        </div>
                        {item.sizeName && (
                          <p className="text-sm text-muted">{item.sizeName}</p>
                        )}
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <p className="text-sm text-muted">+ {item.selectedAddons.join(", ")}</p>
                        )}
                        <p className="text-sm text-muted">
                          {formatPrice(item.unitPrice)} TJS x {item.quantity}
                        </p>
                        {item.cancelReason && (
                          <p className="text-xs text-red-500 mt-1">Причина: {item.cancelReason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isCancelled ? "line-through text-gray-400" : "text-foreground"}`}>
                          {formatPrice(item.totalPrice)} TJS
                        </span>
                        {canCancel && (
                          <button
                            onClick={() => handleCancelItem(selectedOrder.id, item.id)}
                            disabled={cancellingItemId === item.id}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg disabled:opacity-50"
                          >
                            <Icon name="close" size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Order totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-muted">
                  <span>Подитог</span>
                  <span>{formatPrice(selectedOrder.subtotal)} TJS</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Обслуживание (10%)</span>
                  <span>{formatPrice(selectedOrder.serviceFee)} TJS</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-foreground">
                  <span>Итого</span>
                  <span className="text-orange-500">{formatPrice(selectedOrder.total)} TJS</span>
                </div>
              </div>

              {/* Add more items button */}
              {normalizeOrderStatus(selectedOrder.status) !== "Completed" && normalizeOrderStatus(selectedOrder.status) !== "Cancelled" && (
                <Button
                  onClick={() => router.push("/menu")}
                  variant="outline"
                  className="w-full"
                >
                  <Icon name="add" size={20} className="mr-2" />
                  Добавить ещё блюда
                </Button>
              )}

              <Button
                onClick={() => setSelectedOrder(null)}
                variant="secondary"
                className="w-full"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
