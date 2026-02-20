"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getOrders } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import type { OrderStatus } from "@/types";

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

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: isAuthenticated,
  });

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
          const status = statusConfig[order.status];
          return (
            <div key={order.id} className="bg-white rounded-xl p-4 space-y-3 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-foreground font-semibold">
                    Стол #{order.tableNumber}
                  </p>
                </div>
                <Badge variant={status.variant} size="md">
                  {status.label}
                </Badge>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted">
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="text-foreground">
                      {formatPrice(item.totalPrice)} ₽
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted">Итого</span>
                <span className="text-orange-500 font-bold text-lg">
                  {formatPrice(order.total)} ₽
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
