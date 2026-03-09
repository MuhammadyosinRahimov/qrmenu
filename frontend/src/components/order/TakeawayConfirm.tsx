"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";

interface TakeawayConfirmProps {
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function TakeawayConfirm({ onSubmit, onBack, isSubmitting = false, submitError }: TakeawayConfirmProps) {
  const { mode, setMode, customerName, setCustomerName, selectedRestaurantName } =
    useOrderModeStore();

  const [error, setError] = useState<string | null>(null);

  // Mode cycle: delivery -> dinein -> takeaway -> delivery
  const cycleMode = () => {
    if (mode === "delivery") {
      setMode("dinein");
    } else if (mode === "dinein") {
      setMode("takeaway");
    } else if (mode === "takeaway") {
      setMode("delivery");
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "delivery": return "delivery_dining";
      case "dinein": return "restaurant";
      case "takeaway": return "takeout_dining";
      default: return "takeout_dining";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "delivery": return "Доставка";
      case "dinein": return "В ресторане";
      case "takeaway": return "Самовывоз";
      default: return "Самовывоз";
    }
  };

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
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted">
          Имя нужно для идентификации при получении заказа
        </p>
      </div>

      {error && <p className="text-error text-sm text-center">{error}</p>}
      {submitError && <p className="text-error text-sm text-center">{submitError}</p>}

      {/* Compact mode selector */}
      <button
        onClick={cycleMode}
        className="w-full h-10 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon name={getModeIcon()} size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-gray-700">{getModeLabel()}</span>
        </div>
        <Icon name="chevron_right" size={18} className="text-gray-400" />
      </button>

      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon name="progress_activity" size={18} className="mr-2 animate-spin" />
              Оформление...
            </>
          ) : (
            "Оплатить и заказать"
          )}
        </Button>
        <Button onClick={onBack} variant="ghost" className="w-full" disabled={isSubmitting}>
          <Icon name="arrow_back" size={18} className="mr-2" />
          Назад
        </Button>
      </div>
    </div>
  );
}
