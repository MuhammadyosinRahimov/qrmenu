"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/stores/authStore";
import { useTableStore } from "@/stores/tableStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useOrderStore } from "@/stores/orderStore";
import { getOrders, cancelOrderItem, requestCashPayment, getMySessionInfo, payForTable, getSignalRUrl, getPublicTableOrders, getTableByNumber, type PublicTableOrders } from "@/lib/api";
import { Header } from "@/components/layout/Header";

import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import type { OrderStatus, OrderItemStatus, Order, GuestSessionInfo, OrderType, GuestOrderItem } from "@/types";
import { normalizeOrderStatus, normalizeItemStatus, normalizeOrderType } from "@/types";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "primary"; icon: string; color: string }
> = {
  Pending: { label: "Ожидает подтверждения", variant: "warning", icon: "schedule", color: "orange" },
  Confirmed: { label: "Подтверждён", variant: "success", icon: "check_circle", color: "green" },
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

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, userId } = useAuthStore();
  const { onlinePaymentAvailable: tableOnlinePayment, tableId, tableNumber, menuId, setTable } = useTableStore();
  const { mode, setMode } = useOrderModeStore();
  const { clearCart } = useCartStore();
  const { clearMode } = useOrderModeStore();
  const { setPendingCount } = useOrderStore();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [sessionInfo, setSessionInfo] = useState<GuestSessionInfo | null>(null);
  const [loadingSessionInfo, setLoadingSessionInfo] = useState(false);
  const [publicOrders, setPublicOrders] = useState<PublicTableOrders | null>(null);
  const [loadingPublicOrders, setLoadingPublicOrders] = useState(false);
  const [loadingTableFromUrl, setLoadingTableFromUrl] = useState(false);

  // Read URL params
  const urlTableParam = searchParams.get("table");
  const urlMenuParam = searchParams.get("menu");

  // Determine if we're in QR context (from URL or store)
  const isQrContext = mode === "qr" || !!urlTableParam;
  const effectiveTableId = tableId;

  // Populate store from URL params if needed (for direct navigation or refresh)
  useEffect(() => {
    const loadTableFromUrl = async () => {
      // If we have URL params but no tableId in store, load from API
      if (urlTableParam && !tableId) {
        setLoadingTableFromUrl(true);
        try {
          const table = await getTableByNumber(parseInt(urlTableParam, 10));
          setTable({
            id: table.id,
            number: table.number,
            restaurantId: table.restaurantId,
            restaurantName: table.restaurantName,
            menuId: urlMenuParam || table.menuId,
            menuName: table.menuName,
            restaurantPhone: table.restaurantPhone,
            onlinePaymentAvailable: table.onlinePaymentAvailable,
          });
          setMode("qr");
        } catch (error) {
          console.error("Failed to load table from URL params:", error);
        } finally {
          setLoadingTableFromUrl(false);
        }
      }
    };
    loadTableFromUrl();
  }, [urlTableParam, urlMenuParam, tableId, setTable, setMode]);

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

  // Helper function to navigate to menu preserving QR params
  const navigateToMenu = useCallback(() => {
    if (mode === "qr" && tableNumber) {
      router.push(`/menu?table=${tableNumber}${menuId ? `&menu=${menuId}` : ''}`);
    } else {
      router.push("/menu");
    }
  }, [mode, tableNumber, menuId, router]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Auto-refresh every 30 seconds as backup
  });

  // Callback to load session info - used by initial load and SignalR updates
  const loadSessionInfo = useCallback(async () => {
    // Use isQrContext to also consider URL params
    if ((mode === "qr" || isQrContext) && tableId && isAuthenticated) {
      setLoadingSessionInfo(true);
      try {
        const info = await getMySessionInfo(tableId);
        setSessionInfo(info);
      } catch {
        setSessionInfo(null);
      } finally {
        setLoadingSessionInfo(false);
      }
    }
  }, [mode, tableId, isAuthenticated, isQrContext]);

  // Load session info for QR mode to show other guests' orders
  useEffect(() => {
    loadSessionInfo();
  }, [loadSessionInfo, orders, tableId]); // Added tableId as direct dependency

  // Additional effect to ensure sessionInfo loads when tableId becomes available from URL
  // This handles the case where tableId is loaded asynchronously via loadTableFromUrl
  useEffect(() => {
    if (tableId && isQrContext && isAuthenticated && !sessionInfo && !loadingSessionInfo) {
      loadSessionInfo();
    }
  }, [tableId, isQrContext, isAuthenticated, sessionInfo, loadingSessionInfo, loadSessionInfo]);

  // Load public orders when not authenticated but in QR mode
  useEffect(() => {
    const loadPublicOrders = async () => {
      if (!isAuthenticated && mode === "qr" && tableId) {
        setLoadingPublicOrders(true);
        try {
          const data = await getPublicTableOrders(tableId);
          setPublicOrders(data);
        } catch {
          setPublicOrders(null);
        } finally {
          setLoadingPublicOrders(false);
        }
      }
    };
    loadPublicOrders();
  }, [isAuthenticated, mode, tableId]);

  // Ref for SignalR connection to share across useEffects
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Update pending orders count - use ref to avoid infinite loop
  // Only count active orders (Pending/Confirmed AND not paid)
  const prevPendingCountRef = useRef<number>(-1);
  useEffect(() => {
    const newPendingCount = orders.filter((o) => {
      const status = normalizeOrderStatus(o.status);
      const isActive = (status === "Pending" || status === "Confirmed") && !o.isPaid;
      return isActive;
    }).length;
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

    // Save to ref for use in other effects
    connectionRef.current = connection;

    // Handle order status updates
    connection.on("MyOrderStatusUpdated", (updatedOrder: Order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      const normalizedStatus = normalizeOrderStatus(updatedOrder.status);
      showToast(`Статус заказа обновлён: ${statusConfig[normalizedStatus]?.label}`, "success");
    });

    // Handle order updates
    connection.on("MyOrderUpdated", () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      loadSessionInfo();
    });

    // Handle order item cancellation
    connection.on("OrderItemCancelled", () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      loadSessionInfo();
    });

    // Handle table order updates (for shared table orders)
    connection.on("TableOrderUpdated", () => {
      // Refresh orders and session info when another guest updates the table order
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      loadSessionInfo();
    });

    connection.start()
      .then(() => {
        connection.invoke("JoinCustomerGroup", userId);
        // Table group join is handled in a separate useEffect that watches tableId
      })
      .catch((err) => console.error("SignalR connection error:", err));

    return () => {
      connection.invoke("LeaveCustomerGroup", userId).catch(() => {});
      connectionRef.current = null;
      connection.stop();
    };
  }, [isAuthenticated, userId, queryClient, showToast, loadSessionInfo]);

  // Separate effect for joining Table group - fires when tableId becomes available
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection) return;

    const joinTableGroup = () => {
      if (connection.state === signalR.HubConnectionState.Connected && tableId && isQrContext) {
        connection.invoke("JoinTableGroup", tableId).catch(console.error);
      }
    };

    // Try to join immediately if already connected
    joinTableGroup();

    // Also subscribe to reconnect events
    const onReconnected = () => joinTableGroup();
    connection.onreconnected(onReconnected);

    return () => {
      // Leave table group when tableId changes or component unmounts
      if (connection.state === signalR.HubConnectionState.Connected && tableId) {
        connection.invoke("LeaveTableGroup", tableId).catch(() => {});
      }
    };
  }, [tableId, isQrContext]);

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

  // Handle table payment (cash) - for guests without personal orders
  const handleTableCashPayment = async () => {
    if (!sessionInfo) return;
    setProcessingPayment('table-cash');
    try {
      await payForTable(sessionInfo.sessionId, 'cash');
      showToast("Официант скоро подойдёт для оплаты за стол", "success");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      loadSessionInfo(); // Refresh session info
    } catch (error) {
      showToast("Ошибка запроса оплаты", "error");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle table payment (online) - for guests without personal orders
  const handleTableOnlinePayment = async () => {
    if (!sessionInfo) return;
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

  // Sort orders: active (Pending/Confirmed + not paid) first, then inactive
  const sortedOrders = [...orders].sort((a, b) => {
    const statusA = normalizeOrderStatus(a.status);
    const statusB = normalizeOrderStatus(b.status);
    const isActiveA = (statusA === "Pending" || statusA === "Confirmed") && !a.isPaid;
    const isActiveB = (statusB === "Pending" || statusB === "Confirmed") && !b.isPaid;

    if (isActiveA && !isActiveB) return -1;
    if (!isActiveA && isActiveB) return 1;
    // If both same priority, sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter orders by tab
  const filteredOrders = sortedOrders.filter((order) => {
    const status = normalizeOrderStatus(order.status);
    const isActive = (status === "Pending" || status === "Confirmed") && !order.isPaid;

    if (activeTab === 'active') {
      return isActive;
    } else {
      // История: отменённые или оплаченные
      return !isActive;
    }
  });

  if (!isAuthenticated) {
    // If QR mode and has table orders - show them
    if (isQrContext && (loadingTableFromUrl || (tableId && (loadingPublicOrders || publicOrders?.hasActiveSession)))) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
          <Header title="Заказы стола" />

          {/* Auth banner */}
          <div className="p-4 bg-gradient-to-r from-primary-light to-primary-50 border-b border-primary-100">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
                  <Icon name="person_add" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary-dark">Войдите, чтобы сделать заказ</p>
                  <p className="text-sm text-primary">Добавьте блюда к общему счёту</p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/checkout")}
                size="sm"
              >
                Войти
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto">
            {(loadingTableFromUrl || loadingPublicOrders) ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-gray-100 shadow-sm">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : publicOrders?.hasActiveSession && (
              <>
                {/* Guest count info */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Icon name="group" size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">
                        {publicOrders.guestCount} {publicOrders.guestCount === 1 ? "гость" : publicOrders.guestCount < 5 ? "гостя" : "гостей"} за столом
                      </p>
                      <p className="text-sm text-blue-600">
                        Общий счёт: {formatPrice(publicOrders.tableTotal)} TJS
                      </p>
                    </div>
                  </div>
                </div>

                {/* Orders list */}
                <div className="space-y-3">
                  {publicOrders.orders.map((order, idx) => (
                    <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <div className={`px-4 py-2 flex items-center justify-between ${
                        order.isPaid
                          ? "bg-gradient-to-r from-green-50 to-emerald-50"
                          : "bg-gradient-to-r from-primary-light to-primary-50"
                      }`}>
                        <div className="flex items-center gap-2">
                          <Icon
                            name={order.isPaid ? "check_circle" : "schedule"}
                            size={16}
                            className={order.isPaid ? "text-green-500" : "text-primary"}
                          />
                          <span className={`text-sm font-medium ${
                            order.isPaid ? "text-green-700" : "text-primary-dark"
                          }`}>
                            {order.maskedPhone || `Гость ${idx + 1}`}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.isPaid
                            ? "bg-green-100 text-green-700"
                            : "bg-primary-100 text-primary-dark"
                        }`}>
                          {order.isPaid ? "Оплачено" : "Не оплачено"}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.productName}
                              {item.sizeName && <span className="text-gray-400"> ({item.sizeName})</span>}
                            </span>
                            <span className="text-gray-800 font-medium">{formatPrice(item.totalPrice)} TJS</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Итого:</span>
                          <span className="font-semibold text-gray-800">{formatPrice(order.subtotal)} TJS</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total and service fee info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Обслуживание ({publicOrders.serviceFeePercent}%)</span>
                    <span>включено</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-gray-200">
                    <span>Итого за стол</span>
                    <span className="text-primary">{formatPrice(publicOrders.tableTotal)} TJS</span>
                  </div>
                </div>

                {/* CTA to add order */}
                <Button onClick={navigateToMenu} className="w-full" size="lg">
                  <Icon name="add" size={20} className="mr-2" />
                  Добавить свой заказ
                </Button>
              </>
            )}
          </div>
          <BottomNav />
        </div>
      );
    }

    // Standard not authenticated view
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
        <Header title="Мои заказы" />

        <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-300 to-primary flex items-center justify-center mb-6 shadow-lg shadow-primary-200">
            <Icon name="receipt_long" size={48} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Войдите для просмотра заказов
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Зарегистрируйтесь, чтобы видеть историю заказов и отслеживать их статус
          </p>

          {/* Registration button */}
          <button
            onClick={() => router.push("/checkout")}
            className="w-full bg-gradient-to-r from-primary-300 to-primary text-white rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-primary-200/50 hover:shadow-xl hover:scale-[1.02] transition-all mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon name="person_add" size={26} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Регистрация</p>
                <p className="text-sm text-white/80">Войдите по номеру телефона</p>
              </div>
            </div>
            <Icon name="arrow_forward" size={24} className="text-white" />
          </button>

          <Button onClick={navigateToMenu} variant="outline" className="w-full">
            <Icon name="restaurant_menu" size={20} className="mr-2" />
            Перейти в меню
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
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
      <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
        <Header title="Мои заказы" />
       
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
            <Icon name="receipt_long" size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Нет заказов</h2>
          <p className="text-gray-500 text-center mb-6">
            Ваши заказы появятся здесь после оформления
          </p>
          <Button onClick={navigateToMenu}>Перейти в меню</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
      <Header title="Мои заказы" />

      {/* Tab buttons */}
      <div className="flex gap-2 p-4 bg-white border-b">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Активные заказы
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          История
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Loading state for session info */}
        {isQrContext && loadingSessionInfo && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 rounded-lg" />
            </div>
          </div>
        )}

        {/* Other guests' orders section */}
        {isQrContext && sessionInfo && sessionInfo.otherOrders.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="group" size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Заказы за столом ({sessionInfo.guestCount} гостей)
              </span>
            </div>
            <div className="space-y-3">
              {sessionInfo.otherOrders.map((guestOrder) => (
                <div key={guestOrder.orderId} className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {guestOrder.maskedPhone || "Гость"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      guestOrder.isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-primary-light text-primary-dark"
                    }`}>
                      {guestOrder.isPaid ? "Оплачено" : "Не оплачено"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {guestOrder.items.map((item: GuestOrderItem, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.productName}
                          {item.sizeName && <span className="text-gray-400"> ({item.sizeName})</span>}
                        </span>
                        <span className="text-gray-500">{formatPrice(item.totalPrice)} TJS</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium">Итого:</span>
                    <span className="text-sm font-semibold">{formatPrice(guestOrder.total)} TJS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for current tab */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Icon name={activeTab === 'active' ? "receipt_long" : "history"} size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-center mb-4">
              {activeTab === 'active'
                ? (isQrContext ? "У вас нет заказов" : "Нет активных заказов")
                : "История заказов пуста"}
            </p>
            {activeTab === 'active' && isQrContext && (
              <Button onClick={navigateToMenu} size="sm">
                <Icon name="add" size={18} className="mr-2" />
                Добавить заказ
              </Button>
            )}
          </div>
        )}

        {/* Table bill section - show for ALL guests in QR mode when there are unpaid orders */}
        {isQrContext && sessionInfo && sessionInfo.guestCount > 0 && (
          <div className="bg-gradient-to-br from-primary-light to-primary-50 rounded-2xl p-4 border border-primary-200 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Icon name="receipt_long" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-dark">Счёт стола</h3>
                <p className="text-sm text-primary">
                  {sessionInfo.guestCount} {sessionInfo.guestCount === 1 ? "гость" : sessionInfo.guestCount < 5 ? "гостя" : "гостей"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Подитог:</span>
                <span className="font-medium">{formatPrice(sessionInfo.tableSubtotal)} TJS</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Обслуживание ({sessionInfo.serviceFeePercent}%):</span>
                <span className="font-medium">{formatPrice(sessionInfo.tableServiceFee)} TJS</span>
              </div>
              {sessionInfo.tablePaidAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Уже оплачено:</span>
                  <span className="font-medium">{formatPrice(sessionInfo.tablePaidAmount)} TJS</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                <span>К оплате:</span>
                <span className="text-primary">{formatPrice(sessionInfo.tableUnpaidAmount)} TJS</span>
              </div>
            </div>

            {sessionInfo.tableUnpaidAmount > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleTableCashPayment()}
                  variant="outline"
                  className="w-full"
                  disabled={!!processingPayment}
                >
                  <Icon name="payments" size={18} className="mr-2" />
                  Наличными
                </Button>
                {tableOnlinePayment && (
                  <Button
                    onClick={() => handleTableOnlinePayment()}
                    className="w-full"
                    disabled={!!processingPayment}
                  >
                    <Icon name="credit_card" size={18} className="mr-2" />
                    Картой
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {filteredOrders.map((order) => {
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
                normalizedStatus === "Pending" ? "bg-gradient-to-r from-primary-light to-primary-50" :
                normalizedStatus === "Confirmed" ? "bg-gradient-to-r from-green-50 to-emerald-50" :
                "bg-gradient-to-r from-red-50 to-rose-50"
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    normalizedStatus === "Pending" ? "bg-primary-50" :
                    normalizedStatus === "Confirmed" ? "bg-green-100" :
                    "bg-red-100"
                  }`}>
                    <Icon name={status.icon} size={18} className={
                      normalizedStatus === "Pending" ? "text-primary-dark" :
                      normalizedStatus === "Confirmed" ? "text-green-500" :
                      "text-red-500"
                    } />
                  </div>
                  <span className={`font-medium text-sm ${
                    normalizedStatus === "Pending" ? "text-primary-dark" :
                    normalizedStatus === "Confirmed" ? "text-green-700" :
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
                      <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                        <Icon name="restaurant" size={20} className="text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {isDelivery ? "Доставка" : isTakeaway ? "Самовывоз" : order.tableName || `Стол #${order.tableNumber}`}
                      </p>
                      {order.restaurantName && (
                        <p className="text-xs text-primary">{order.restaurantName}</p>
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
                  <span className="text-xl font-bold text-primary">
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
                      onClick={navigateToMenu}
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

                {/* Other guests' orders in payment modal */}
                {sessionInfo.otherOrders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-2">Заказы других гостей:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {sessionInfo.otherOrders.map((guestOrder) => (
                        <div key={guestOrder.orderId} className="flex justify-between items-center text-xs">
                          <span className="text-blue-600">
                            {guestOrder.maskedPhone || "Гость"} ({guestOrder.itemCount} поз.)
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-700">{formatPrice(guestOrder.total)} TJS</span>
                            <span className={`px-1.5 py-0.5 rounded ${
                              guestOrder.isPaid ? "bg-green-100 text-green-600" : "bg-primary-light text-primary-dark"
                            }`}>
                              {guestOrder.isPaid ? "оплачено" : "не оплачено"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-primary-light to-primary-50 border-2 border-primary-200 hover:border-primary-300 transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2">
                    <Icon name="payments" size={24} className="text-primary" />
                  </div>
                  <span className="font-semibold text-primary-dark">Наличными</span>
                  <span className="text-xs text-primary">
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

                  {/* Online payment for table */}
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
                    <p className="text-sm text-primary">{selectedOrder.restaurantName}</p>
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
                      isPending ? "bg-primary-light border-primary-50" :
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
                            isPending ? "bg-primary-light text-primary-dark" :
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
                  <span className="text-primary">{formatPrice(selectedOrder.total)} TJS</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {normalizeOrderStatus(selectedOrder.status) !== "Cancelled" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={navigateToMenu} variant="outline">
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <OrdersPageContent />
    </Suspense>
  );
}
