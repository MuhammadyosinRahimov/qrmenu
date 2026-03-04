"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTableStore } from "@/stores/tableStore";
import { checkPaymentStatus } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = useTableStore((state) => state.tableNumber);

  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (status === "success" && orderId) {
        try {
          const result = await checkPaymentStatus(orderId);
          setPaymentVerified(result.success);
          if (!result.success) {
            setVerificationError(result.message || "Платёж не подтверждён");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          // If verification fails, still show success (payment might be processing)
          setPaymentVerified(true);
        }
      }
      setIsVerifying(false);
    };

    verifyPayment();
  }, [status, orderId]);

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto animate-pulse">
            <Icon name="sync" size={32} className="text-orange-500 animate-spin" />
          </div>
          <p className="text-muted">Проверяем статус оплаты...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success" && (paymentVerified || !verificationError)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Icon name="check_circle" size={64} className="text-green-500" filled />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Оплата прошла успешно!
            </h1>
            <p className="text-muted">
              Ваш заказ оплачен и отправлен на кухню
            </p>
          </div>

          {/* Table info */}
          {tableNumber && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-muted text-sm mb-1">Номер стола</p>
              <p className="text-3xl font-bold text-green-600">{tableNumber}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-white rounded-xl p-4 text-left space-y-3 border border-border shadow-sm">
            <div className="flex items-start gap-3">
              <Icon name="schedule" size={20} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-foreground font-medium">Время ожидания</p>
                <p className="text-muted text-sm">
                  Приблизительно 15-25 минут
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="notifications" size={20} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-foreground font-medium">Мы вас позовём</p>
                <p className="text-muted text-sm">
                  Когда заказ будет готов
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => router.push("/orders")}
              className="w-full"
              size="lg"
            >
              Мои заказы
            </Button>
            <Button
              onClick={() => router.push("/menu")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Вернуться в меню
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          {/* Error icon */}
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Icon name="error" size={64} className="text-red-500" filled />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Ошибка оплаты
            </h1>
            <p className="text-muted">
              {verificationError || "К сожалению, платёж не был выполнен. Попробуйте ещё раз или выберите другой способ оплаты."}
            </p>
          </div>

          {/* Info */}
          <div className="bg-amber-50 rounded-xl p-4 text-left border border-amber-200">
            <div className="flex items-start gap-3">
              <Icon name="info" size={20} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm">
                  Ваш заказ был создан, но не оплачен. Вы можете оплатить его наличными официанту.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => router.push("/orders")}
              className="w-full"
              size="lg"
            >
              Мои заказы
            </Button>
            <Button
              onClick={() => router.push("/menu")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Вернуться в меню
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled state
  if (status === "cancelled") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          {/* Warning icon */}
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Icon name="cancel" size={64} className="text-amber-500" filled />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Оплата отменена
            </h1>
            <p className="text-muted">
              Вы отменили оплату. Заказ был создан и ожидает оплаты наличными.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => router.push("/orders")}
              className="w-full"
              size="lg"
            >
              Мои заказы
            </Button>
            <Button
              onClick={() => router.push("/menu")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Вернуться в меню
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default/unknown state
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <Icon name="help" size={64} className="text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Неизвестный статус
          </h1>
          <p className="text-muted">
            Не удалось определить статус оплаты
          </p>
        </div>
        <Button
          onClick={() => router.push("/menu")}
          className="w-full"
          size="lg"
        >
          Вернуться в меню
        </Button>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto animate-pulse">
            <Icon name="sync" size={32} className="text-orange-500 animate-spin" />
          </div>
          <p className="text-muted">Загрузка...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
