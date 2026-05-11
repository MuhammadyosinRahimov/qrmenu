"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getMyOrders } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

type Tab = "active" | "history";

function OrderSkeleton() {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 animate-pulse">
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-gray-100 rounded" />
          <div className="h-4 w-44 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3 bg-gray-100 rounded mt-3 w-3/4" />
      <div className="flex justify-between mt-3">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function EmptyOrdersState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
        <Icon name="orders" size={48} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        {tab === "active" ? "Нет активных заказов" : "История пуста"}
      </h2>
      <p className="text-gray-500 max-w-xs mx-auto mb-6">
        {tab === "active"
          ? "Когда оформите заказ — он появится здесь, чтобы вы могли отследить статус."
          : "Здесь будут заказы, которые вы уже получили или отменили."}
      </p>
      <Link href="/">
        <Button>Перейти в меню</Button>
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>("active");
  const isAuth = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", tab],
    queryFn: () => getMyOrders(tab),
    enabled: isAuth,
  });

  if (!isAuth) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
        <Header title="Мои заказы" />
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-300 to-primary flex items-center justify-center mb-6 shadow-lg shadow-primary-200">
            <Icon name="orders" size={48} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Войдите в аккаунт</h2>
          <p className="text-gray-500 max-w-xs mx-auto mb-6">
            Чтобы увидеть свои заказы, подтвердите номер телефона
          </p>
          <Link
            href="/login?redirect=/orders"
            className="w-full max-w-xs bg-gradient-to-r from-primary-300 to-primary text-white rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-primary-200/50 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <span className="font-semibold">Войти по SMS</span>
            <Icon name="arrow_forward" size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
      <Header title="Мои заказы" />
      <div className="px-4 pt-3 sticky top-14 z-20 bg-white/95 backdrop-blur pb-3">
        <div className="bg-white rounded-full p-1 flex border border-border shadow-sm">
          {(["active", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition ${
                tab === t
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t === "active" ? "Активные" : "История"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading && (
          <>
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </>
        )}
        {!isLoading && data && data.length === 0 && <EmptyOrdersState tab={tab} />}
        {!isLoading && data?.map((o) => <OrderCard key={o.id} order={o} />)}
      </div>
    </div>
  );
}
