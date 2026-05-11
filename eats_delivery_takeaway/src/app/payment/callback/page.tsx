"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkPaymentStatus } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

function PaymentCallbackInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get("orderId");
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    const run = async () => {
      try {
        const res = await checkPaymentStatus(orderId);
        if (res.status === "paid" || res.status === "success") {
          setStatus("success");
          setTimeout(() => router.replace(`/orders/${orderId}`), 1000);
          return;
        }
        if (res.status === "failed" || res.status === "cancelled") {
          setStatus("failed");
          setMessage(res.message ?? "Оплата не прошла");
          return;
        }
        attempts += 1;
        if (attempts < 10) setTimeout(run, 1500);
        else {
          setStatus("failed");
          setMessage("Не удалось подтвердить оплату");
        }
      } catch (e: unknown) {
        setStatus("failed");
        setMessage(e instanceof Error ? e.message : "Ошибка проверки оплаты");
      }
    };
    run();
  }, [orderId, router]);

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center p-6 text-center">
      {status === "checking" && (
        <>
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center animate-pulse">
            <Icon name="clock" size={36} className="text-muted" />
          </div>
          <h3 className="mt-4 font-semibold">Проверяем оплату...</h3>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="success" size={36} />
          </div>
          <h3 className="mt-4 font-semibold">Оплата прошла успешно</h3>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
            <Icon name="error" size={36} />
          </div>
          <h3 className="mt-4 font-semibold">Оплата не прошла</h3>
          {message && <p className="text-sm text-muted mt-2">{message}</p>}
          <Button className="mt-4" onClick={() => router.replace(orderId ? `/orders/${orderId}` : "/orders")}>
            К заказу
          </Button>
        </>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackInner />
    </Suspense>
  );
}
