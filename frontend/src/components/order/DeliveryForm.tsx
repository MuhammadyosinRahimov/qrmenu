"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";

interface DeliveryFormProps {
  onSubmit: () => void;
  onBack: () => void;
}

export function DeliveryForm({ onSubmit, onBack }: DeliveryFormProps) {
  const {
    deliveryAddress,
    setDeliveryAddress,
    customerName,
    setCustomerName,
    deliveryFee,
    selectedRestaurantName,
  } = useOrderModeStore();

  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const handleSubmit = () => {
    if (!deliveryAddress.trim()) {
      setError("Укажите адрес доставки");
      return;
    }
    if (!customerName.trim()) {
      setError("Укажите ваше имя");
      return;
    }
    setError(null);
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Данные доставки
        </h2>
        {selectedRestaurantName && (
          <p className="text-muted">{selectedRestaurantName}</p>
        )}
      </div>

      {/* Delivery fee info */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="delivery_dining" size={20} className="text-orange-500" />
            <span className="text-sm text-orange-700">Стоимость доставки</span>
          </div>
          <span className="font-bold text-orange-600">
            {deliveryFee > 0 ? `${formatPrice(deliveryFee)} TJS` : "Бесплатно"}
          </span>
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
        />

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Адрес доставки
          </label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Улица, дом, квартира, подъезд, этаж..."
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none shadow-sm"
            rows={3}
            required
          />
        </div>
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
