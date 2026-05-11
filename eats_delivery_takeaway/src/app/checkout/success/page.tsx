"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function SuccessContent() {
  const sp = useSearchParams();
  const orderId = sp.get("orderId");

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Icon name="success" size={56} />
        </div>
        <h2 className="text-2xl font-bold">Заказ оформлен</h2>
        <p className="text-muted mt-2 max-w-sm">
          Мы передали ваш заказ ресторану. Вы можете отслеживать его статус в разделе «Заказы».
        </p>
        {orderId && (
          <div className="mt-6 px-4 py-3 bg-white border border-border rounded-2xl text-sm">
            <span className="text-muted">Номер заказа: </span>
            <span className="font-semibold">{orderId.slice(0, 8).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {orderId && (
          <Link href={`/orders/${orderId}`}>
            <Button fullWidth>Отследить заказ</Button>
          </Link>
        )}
        <Link href="/restaurants">
          <Button variant="ghost" fullWidth>
            На главную
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
