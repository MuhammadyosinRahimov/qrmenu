"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";

interface TakeawayConfirmProps {
  onSubmit: () => void;
  onBack: () => void;
}

export function TakeawayConfirm({ onSubmit, onBack }: TakeawayConfirmProps) {
  const { customerName, setCustomerName, selectedRestaurantName } =
    useOrderModeStore();

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!customerName.trim()) {
      setError("Укажите ваше имя для получения заказа");
      return;
    }
    setError(null);
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Самовывоз</h2>
        {selectedRestaurantName && (
          <p className="text-muted">{selectedRestaurantName}</p>
        )}
      </div>

      {/* Info */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
        <div className="flex items-start gap-3">
          <Icon name="takeout_dining" size={20} className="text-green-500 mt-0.5" />
          <div className="text-sm text-green-700">
            <p className="font-medium mb-1">Как это работает:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Оформите и оплатите заказ</li>
              <li>Дождитесь уведомления о готовности</li>
              <li>Заберите заказ в ресторане</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          id="customerName"
          label="Ваше имя"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Как к вам обращаться?"
          required
          error={error || undefined}
        />
        <p className="text-xs text-muted">
          Имя нужно для идентификации при получении заказа
        </p>
      </div>

      {error && <p className="text-error text-sm text-center">{error}</p>}

      <div className="space-y-3">
        <Button onClick={handleSubmit} className="w-full" size="lg">
          Продолжить
        </Button>
        <Button onClick={onBack} variant="ghost" className="w-full">
          <Icon name="arrow_back" size={18} className="mr-2" />
          Назад
        </Button>
      </div>
    </div>
  );
}
