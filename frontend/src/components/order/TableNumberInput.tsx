"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";

interface TableNumberInputProps {
  onSubmit: (tableNumber: number) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function TableNumberInput({ onSubmit, onBack, isSubmitting = false, submitError }: TableNumberInputProps) {
  const { mode, setMode, tableNumber, setTableNumber, selectedRestaurantName } =
    useOrderModeStore();

  const [inputValue, setInputValue] = useState(
    tableNumber ? String(tableNumber) : ""
  );
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
      default: return "restaurant";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "delivery": return "Доставка";
      case "dinein": return "В ресторане";
      case "takeaway": return "Самовывоз";
      default: return "В ресторане";
    }
  };

  const handleInputChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "");
    setInputValue(digits);
    setError(null);
  };

  const handleSubmit = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num <= 0) {
      setError("Введите корректный номер стола");
      return;
    }
    setTableNumber(num);
    onSubmit(num);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Номер стола</h2>
        {selectedRestaurantName && (
          <p className="text-muted">{selectedRestaurantName}</p>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Icon name="info" size={20} className="text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-700">
            Введите номер стола, за которым вы сидите. Номер обычно указан на
            табличке на столе.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="flex justify-center">
        <Input
          id="tableNumber"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="0"
          className="text-center text-4xl font-bold w-32 h-20"
          maxLength={3}
          inputMode="numeric"
          error={error || undefined}
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="text-error text-sm text-center">{error}</p>}
      {submitError && (
        <p className="text-error text-sm text-center">{submitError}</p>
      )}

      {/* Compact mode selector */}
      <button
        onClick={cycleMode}
        className="w-full h-10 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon name={getModeIcon()} size={16} className="text-primary" />
          <span className="text-sm font-medium text-gray-700">
            {getModeLabel()}
          </span>
        </div>
        <Icon name="chevron_right" size={18} className="text-gray-400" />
      </button>

      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={!inputValue || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon
                name="progress_activity"
                size={18}
                className="mr-2 animate-spin"
              />
              Оформление...
            </>
          ) : (
            "Подтвердить заказ"
          )}
        </Button>
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full"
          disabled={isSubmitting}
        >
          <Icon name="arrow_back" size={18} className="mr-2" />
          Назад
        </Button>
      </div>
    </div>
  );
}
