"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";

interface TableNumberInputProps {
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function TableNumberInput({ onSubmit, onBack, isSubmitting, submitError }: TableNumberInputProps) {
  const { tableNumber, setTableNumber, selectedRestaurantName } =
    useOrderModeStore();

  const [inputValue, setInputValue] = useState(
    tableNumber ? String(tableNumber) : ""
  );
  const [error, setError] = useState<string | null>(null);

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
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Номер стола
        </h2>
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
        />
      </div>

      {error && <p className="text-error text-sm text-center">{error}</p>}
      {submitError && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
          <Icon name="error" size={20} className="text-red-500" />
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={!inputValue}
          isLoading={isSubmitting}
        >
          <Icon name="check_circle" size={22} className="mr-2" />
          Подтвердить заказ
        </Button>
        <Button onClick={onBack} variant="ghost" className="w-full" disabled={isSubmitting}>
          <Icon name="arrow_back" size={18} className="mr-2" />
          Назад
        </Button>
      </div>
    </div>
  );
}
