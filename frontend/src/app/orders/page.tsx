"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/stores/authStore";
import { useTableStore } from "@/stores/tableStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useOrderStore } from "@/stores/orderStore";
import { getOrders, cancelOrderItem, requestCashPayment, getMySessionInfo, payForTable, getSignalRUrl } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import type { OrderStatus, OrderItemStatus, Order, GuestSessionInfo, OrderType } from "@/types";
import { normalizeOrderStatus, normalizeItemStatus, normalizeOrderType } from "@/types";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "primary"; icon: string; color: string }
> = {
  Pending: { label: "Ожидает подтверждения", variant: "warning", icon: "schedule", color: "orange" },
  Confirmed: { label: "Готовится", variant: "primary", icon: "restaurant", color: "blue" },
  Completed: { label: "Завершён", variant: "success", icon: "check_circle", color: "green" },
  Cancelled: { label: "Отменён", variant: "error", icon: "cancel", color: "red" },
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
  const { isAuthenticated, userId } = useAuthStore();
  const { onlinePaymentAvailable: tableOnlinePayment } = useTableStore();
  const { clearCart } = useCartStore();
  const { clearMode } = useOrderModeStore();
  const { setPendingCount } = useOrderStore();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [sessionInfo, setSessionInfo] = useState<GuestSessionInfo | null>(null);
  const [loadingSessionInfo, setLoadingSessionInfo] = useState(false);

  // Clear cart when order is completed (but keep table info for QR mode)
  const clearOrderData = useCallback((orderType?: OrderType) => {
    clearCart();
    // Only clear mode/table for delivery/takeaway orders
    const normalizedType = orderType ? normalizeOrderType(orderType) : "DineIn";
    if (normalizedType === "Delivery" || normalizedType === "Takeaway") {
      clearMode();
    }
    // Never clear table info - user might still be at the table
  }, [clearCart, clearMode]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Auto-refresh every 30 seconds as backup
  });

  // Update pending orders count - use ref to avoid infinite loop
  const prevPendingCountRef = useRef<number>(-1);
  useEffect(() => {
    const newPendingCount = orders.filter(
      (o) => normalizeOrderStatus(o.status) === "Pending" || normalizeOrderStatus(o.status) === "Confirmed"
    ).length;
    // Only update if the count actually changed
    if (prevPendingCountRef.current !== newPendingCount) {
      prevPendingCountRef.current = newPendingCount;
      setPendingCount(newPendingCount);
    }
  }, [orders, setPendingCount]);

  // SignalR connection for real-time updates
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(getSignalRUrl(), {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    // Handle order status updates
    connection.on("MyOrderStatusUpdated", (updatedOrder: Order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      const normalizedStatus = normalizeOrderStatus(updatedOrder.status);
      showToast(`Статус заказа обновлён: ${statusConfig[normalizedStatus]?.label}`, "success");

      // Clear cart when order is completed
      if (normalizedStatus === "Completed") {
        clearOrderData(updatedOrder.orderType);
      }
    });

    // Handle order updates
    connection.on("MyOrderUpdated", () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });

    connection.start()
      .then(() => {
        connection.invoke("JoinCustomerGroup", userId);
      })
      .catch((err) => console.error("SignalR connection error:", err));

    return () => {
      connection.invoke("LeaveCustomerGroup", userId).catch(() => {});
      connection.stop();
    };
  }, [isAuthenticated, userId, queryClient, showToast, clearOrderData]);

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

  // Handle cash payment
  const handleCashPayment = async (order: Order) => {
    setProcessingPayment(order.id);
    try {
      await requestCashPayment(order.id);
      showToast("Официант скоро подойдёт для оплаты", "success");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error) {
      showToast("Ошибка запроса оплаты", "error");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Fetch session info when opening payment modal
  const openPaymentModal = async (order: Order) => {
    setPaymentModalOrder(order);
    if (order.tableId) {
      setLoadingSessionInfo(true);
      try {
        const info = await getMySessionInfo(order.tableId);
        setSessionInfo(info);
      } catch {
        setSessionInfo(null);
      } finally {
        setLoadingSessionInfo(false);
      }
    }
  };

  // Handle pay for table (cash)
  const handlePayForTableCash = async () => {
    if (!sessionInfo || !paymentModalOrder) return;
    setProcessingPayment('table-cash');
    try {
      await payForTable(sessionInfo.sessionId, 'cash');
      showToast("Официант скоро подойдёт для оплаты за весь стол", "success");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setPaymentModalOrder(null);
      setSessionInfo(null);
    } catch (error) {
      showToast("Ошибка запроса оплаты", "error");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle pay for table (online)
  const handlePayForTableOnline = async () => {
    if (!sessionInfo || !paymentModalOrder) return;
    setProcessingPayment('table-online');
    try {
      const result = await payForTable(sessionInfo.sessionId, 'online');
      if (result.paymentLink) {
        window.location.href = result.paymentLink;
      } else {
        showToast("Онлайн оплата недоступна", "error");
      }
    } catch (error) {
      showToast("Ошибка создания платежа", "error");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle DC card payment using paymentLink
  const handleDcPayment = (order: Order) => {
    if (order.paymentLink) {
      const finalLink = order.paymentLink.replace('{amount}', order.total.toString());
      window.location.href = finalLink;
    } else {
      showToast("Онлайн оплата недоступна", "error");
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/30 pb-20">
        <Header title="Мои заказы" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
            <Icon name="lock" size={48} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Требуется авторизация
          </h2>
          <p className="text-gray-500 text-center mb-6">
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/30 pb-20">
        <Header title="Мои заказы" />
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-gray-100 shadow-sm">
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/30 pb-20">
        <Header title="Мои заказы" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
            <Icon name="receipt_long" size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Нет заказов</h2>
          <p className="text-gray-500 text-center mb-6">
            Ваши заказы появятся здесь после оформления
          </p>
          <Button onClick={() => router.push("/menu")}>Перейти в меню</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/30 pb-20">
      <Header title="Мои заказы" />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {orders.map((order) => {
          if (!order) return null;
          const normalizedStatus = normalizeOrderStatus(order.status);
          const status = statusConfig[normalizedStatus] || { label: String(order.status) || "Неизвестно", variant: "default" as const, icon: "help", color: "gray" };
          const showPaymentButtons = !order.isPaid && normalizedStatus !== "Cancelled";
          const hasOnlinePayment = order.onlinePaymentAvailable || tableOnlinePayment;

          const orderType = order.orderType ? normalizeOrderType(order.orderType) : "DineIn";
          const isDelivery = orderType === "Delivery";
          const isTakeaway = orderType === "Takeaway";

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Status header with gradient */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                normalizedStatus === "Pending" ? "bg-gradient-to-r from-orange-50 to-amber-50" :
                normalizedStatus === "Confirmed" ? "bg-gradient-to-r from-blue-50 to-indigo-50" :
                normalizedStatus === "Completed" ? "bg-gradient-to-r from-green-50 to-emerald-50" :
                "bg-gradient-to-r from-red-50 to-rose-50"
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    normalizedStatus === "Pending" ? "bg-orange-100" :
                    normalizedStatus === "Confirmed" ? "bg-blue-100" :
                    normalizedStatus === "Completed" ? "bg-green-100" :
                    "bg-red-100"
                  }`}>
                    <Icon name={status.icon} size={18} className={
                      normalizedStatus === "Pending" ? "text-orange-500" :
                      normalizedStatus === "Confirmed" ? "text-blue-500" :
                      normalizedStatus === "Completed" ? "text-green-500" :
                      "text-red-500"
                    } />
                  </div>
                  <span className={`font-medium text-sm ${
                    normalizedStatus === "Pending" ? "text-orange-700" :
                    normalizedStatus === "Confirmed" ? "text-blue-700" :
                    normalizedStatus === "Completed" ? "text-green-700" :
                    "text-red-700"
                  }`}>
                    {status.label}
                  </span>
                </div>
                {order.isPaid && (
                  <Badge variant="success" size="sm">
                    <Icon name="check" size={12} className="mr-1" />
                    Оплачено
                  </Badge>
                )}
              </div>

              {/* Order content */}
              <div className="p-4 space-y-3" onClick={() => setSelectedOrder(order)}>
                {/* Order type and location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDelivery && (
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Icon name="delivery_dining" size={20} className="text-purple-500" />
                      </div>
                    )}
                    {isTakeaway && (
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Icon name="takeout_dining" size={20} className="text-emerald-500" />
                      </div>
                    )}
                    {!isDelivery && !isTakeaway && (
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Icon name="restaurant" size={20} className="text-orange-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {isDelivery ? "Доставка" : isTakeaway ? "Самовывоз" : order.tableName || `Стол #${order.tableNumber}`}
                      </p>
                      {order.restaurantName && (
                        <p className="text-xs text-orange-500">{order.restaurantName}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                </div>

                {/* Delivery/Takeaway details */}
                {isDelivery && order.deliveryAddress && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-purple-50 rounded-lg p-2">
                    <Icon name="location_on" size={16} className="text-purple-400" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                )}
                {(isDelivery || isTakeaway) && order.customerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon name="person" size={16} className="text-gray-400" />
                    <span>{order.customerName}</span>
                  </div>
                )}

                {/* Order items preview */}
                <div className="space-y-1">
                  {(order.items || []).slice(0, 3).map((item) => {
                    if (!item) return null;
                    const normalizedItemStatus = normalizeItemStatus(item.status);
                    const isCancelled = normalizedItemStatus === "Cancelled";
                    return (
                      <div
                        key={item.id}
                        className={`flex justify-between text-sm ${isCancelled ? "opacity-50" : ""}`}
                      >
                        <span className={`text-gray-600 ${isCancelled ? "line-through" : ""}`}>
                          {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                        </span>
                        <span className={`text-gray-800 font-medium ${isCancelled ? "line-through" : ""}`}>
                          {formatPrice(item.totalPrice)} TJS
                        </span>
                      </div>
                    );
                  })}
                  {(order.items || []).length > 3 && (
                    <p className="text-sm text-gray-400">+{order.items.length - 3} ещё...</p>
                  )}
                </div>

                {/* Divider and total */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span>Итого</span>
                    {isDelivery && order.deliveryFee && order.deliveryFee > 0 && (
                      <span className="text-xs">(+{formatPrice(order.deliveryFee)} доставка)</span>
                    )}
                  </div>
                  <span className="text-xl font-bold text-orange-500">
                    {formatPrice(order.total)} TJS
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {showPaymentButtons && (
                <div className="px-4 pb-4 grid gap-2 grid-cols-2">
                  {!isDelivery && !isTakeaway && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/menu")}
                    >
                      <Icon name="add" size={18} className="mr-1" />
                      Добавить
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className={!isDelivery && !isTakeaway ? "" : "col-span-2"}
                    onClick={() => openPaymentModal(order)}
                    disabled={processingPayment === order.id}
                  >
                    <Icon name="payments" size={18} className="mr-1" />
                    Оплатить
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment method modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setPaymentModalOrder(null); setSessionInfo(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Способ оплаты</h3>
              <button
                onClick={() => { setPaymentModalOrder(null); setSessionInfo(null); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Icon name="close" size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Session info for table orders */}
            {loadingSessionInfo ? (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : sessionInfo && sessionInfo.guestCount > 1 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="group" size={18} className="text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    {sessionInfo.guestCount} гостей за столом
                  </span>
                </div>
                <div className="text-sm text-blue-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Итого за стол:</span>
                    <span className="font-semibold">{formatPrice(sessionInfo.tableTotal)} TJS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Мой итого:</span>
                    <span className="font-semibold">{formatPrice(sessionInfo.myTotal)} TJS</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment buttons */}
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium">Мой заказ</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Cash payment */}
                <button
                  onClick={() => {
                    handleCashPayment(paymentModalOrder);
                    setPaymentModalOrder(null);
                    setSessionInfo(null);
                  }}
                  disabled={!!processingPayment}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 hover:border-orange-400 transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2">
                    <Icon name="payments" size={24} className="text-orange-500" />
                  </div>
                  <span className="font-semibold text-orange-700">Наличными</span>
                  <span className="text-xs text-orange-500">
                    {sessionInfo && sessionInfo.guestCount > 1
                      ? formatPrice(sessionInfo.myTotal)
                      : formatPrice(paymentModalOrder.total)} TJS
                  </span>
                </button>

                {/* Online payment */}
                {(paymentModalOrder.onlinePaymentAvailable || tableOnlinePayment) && (
                  <button
                    onClick={() => handleDcPayment(paymentModalOrder)}
                    disabled={!!processingPayment}
                    className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 transition-all disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2">
                      <Icon name="credit_card" size={24} className="text-green-500" />
                    </div>
                    <span className="font-semibold text-green-700">Картой DC</span>
                    <span className="text-xs text-green-500">
                      {sessionInfo && sessionInfo.guestCount > 1
                        ? formatPrice(sessionInfo.myTotal)
                        : formatPrice(paymentModalOrder.total)} TJS
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Pay for table */}
            {sessionInfo && sessionInfo.guestCount > 1 && sessionInfo.tableUnpaidAmount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-3">Оплатить за весь стол</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePayForTableCash}
                    disabled={!!processingPayment}
                    className="flex flex-col items-center p-3 rounded-xl bg-purple-50 border-2 border-purple-200 hover:border-purple-400 transition-all disabled:opacity-50"
                  >
                    <Icon name="groups" size={24} className="text-purple-500 mb-1" />
                    <span className="text-sm font-semibold text-purple-700">Наличными</span>
                    <span className="text-xs text-purple-500">{formatPrice(sessionInfo.tableUnpaidAmount)} TJS</span>
                  </button>

                  {(paymentModalOrder.onlinePaymentAvailable || tableOnlinePayment) && (
                    <button
                      onClick={handlePayForTableOnline}
                      disabled={!!processingPayment}
                      className="flex flex-col items-center p-3 rounded-xl bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 transition-all disabled:opacity-50"
                    >
                      <Icon name="credit_score" size={24} className="text-indigo-500 mb-1" />
                      <span className="text-sm font-semibold text-indigo-700">Картой DC</span>
                      <span className="text-xs text-indigo-500">{formatPrice(sessionInfo.tableUnpaidAmount)} TJS</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {selectedOrder.tableName || `Стол #${selectedOrder.tableNumber}`}
                  </h2>
                  {selectedOrder.restaurantName && (
                    <p className="text-sm text-orange-500">{selectedOrder.restaurantName}</p>
                  )}
                  <p className="text-sm text-gray-400">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={statusConfig[normalizeOrderStatus(selectedOrder.status)]?.variant || "default"}>
                    {statusConfig[normalizeOrderStatus(selectedOrder.status)]?.label || String(selectedOrder.status)}
                  </Badge>
                  {selectedOrder.isPaid && (
                    <Badge variant="success" size="sm">Оплачено</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-800">Позиции заказа</h3>
              {(selectedOrder.items || []).map((item) => {
                if (!item) return null;
                const normalizedItemStatus = normalizeItemStatus(item.status);
                const normalizedOrderStatus = normalizeOrderStatus(selectedOrder.status);
                const isCancelled = normalizedItemStatus === "Cancelled";
                const isPending = normalizedItemStatus === "Pending";
                const canCancel = (isPending || normalizedOrderStatus === "Pending") && !isCancelled;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${
                      isCancelled ? "bg-red-50 border-red-100 opacity-60" :
                      isPending ? "bg-orange-50 border-orange-100" :
                      "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${isCancelled ? "line-through text-gray-400" : "text-gray-800"}`}>
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
                          <p className="text-sm text-gray-500">{item.sizeName}</p>
                        )}
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <p className="text-sm text-gray-500">+ {item.selectedAddons.join(", ")}</p>
                        )}
                        {item.note && (
                          <p className="text-sm text-gray-400 italic flex items-center gap-1 mt-1">
                            <Icon name="comment" size={14} />
                            {item.note}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          {formatPrice(item.unitPrice)} TJS x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isCancelled ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {formatPrice(item.totalPrice)} TJS
                        </span>
                        {canCancel && (
                          <button
                            onClick={() => handleCancelItem(selectedOrder.id, item.id)}
                            disabled={cancellingItemId === item.id}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors"
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
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Подитог</span>
                  <span>{formatPrice(selectedOrder.subtotal)} TJS</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Обслуживание</span>
                  <span>{formatPrice(selectedOrder.serviceFee)} TJS</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-gray-200">
                  <span>Итого</span>
                  <span className="text-orange-500">{formatPrice(selectedOrder.total)} TJS</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {normalizeOrderStatus(selectedOrder.status) !== "Completed" && normalizeOrderStatus(selectedOrder.status) !== "Cancelled" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => router.push("/menu")} variant="outline">
                      <Icon name="add" size={18} className="mr-1" />
                      Добавить
                    </Button>
                    {!selectedOrder.isPaid && (
                      <Button
                        onClick={() => {
                          openPaymentModal(selectedOrder);
                          setSelectedOrder(null);
                        }}
                        disabled={processingPayment === selectedOrder.id}
                      >
                        <Icon name="payments" size={18} className="mr-1" />
                        Оплатить
                      </Button>
                    )}
                  </div>
                )}
                <Button onClick={() => setSelectedOrder(null)} variant="secondary" className="w-full">
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
