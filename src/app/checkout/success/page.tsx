"use client";

import { useRouter } from "next/navigation";
import { useTableStore } from "@/stores/tableStore";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const tableNumber = useTableStore((state) => state.tableNumber);

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
            Заказ принят!
          </h1>
          <p className="text-muted">
            Ваш заказ успешно создан и отправлен на кухню
          </p>
        </div>

        {/* Table info */}
        {tableNumber && (
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-muted text-sm mb-1">Номер стола</p>
            <p className="text-3xl font-bold text-orange-500">{tableNumber}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-white rounded-xl p-4 text-left space-y-3 border border-border shadow-sm">
          <div className="flex items-start gap-3">
            <Icon name="schedule" size={20} className="text-orange-400 mt-0.5" />
            <div>
              <p className="text-foreground font-medium">Время ожидания</p>
              <p className="text-muted text-sm">
                Приблизительно 15-25 минут
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="notifications" size={20} className="text-orange-400 mt-0.5" />
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
