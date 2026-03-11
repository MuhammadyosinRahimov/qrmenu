"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";

interface DeliveryFormProps {
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function DeliveryForm({ onSubmit, onBack, isSubmitting = false, submitError }: DeliveryFormProps) {
  const {
    mode,
    setMode,
    deliveryAddress,
    setDeliveryAddress,
    customerName,
    setCustomerName,
    deliveryFee,
    selectedRestaurantName,
  } = useOrderModeStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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
      default: return "delivery_dining";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "delivery": return "Доставка";
      case "dinein": return "В ресторане";
      case "takeaway": return "Самовывоз";
      default: return "Доставка";
    }
  };

  // Get user's location and reverse geocode to address
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается вашим браузером");
      return;
    }

    setIsLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
          );
          const data = await response.json();

          if (data.display_name) {
            // Extract relevant parts of address
            const address = data.address;
            let formattedAddress = "";

            if (address.road) formattedAddress += address.road;
            if (address.house_number) formattedAddress += `, ${address.house_number}`;
            if (address.suburb) formattedAddress += `, ${address.suburb}`;
            if (address.city || address.town || address.village) {
              formattedAddress += `, ${address.city || address.town || address.village}`;
            }

            setDeliveryAddress(formattedAddress || data.display_name);
          } else {
            setDeliveryAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch {
          // If geocoding fails, just use coordinates
          setDeliveryAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        setIsLoadingLocation(false);
      },
      (err) => {
        setIsLoadingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Доступ к геолокации запрещён");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Местоположение недоступно");
        } else {
          setError("Не удалось определить местоположение");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
      <div className="bg-primary-light rounded-xl p-4 border border-primary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="delivery_dining" size={20} className="text-primary" />
            <span className="text-sm text-foreground">Стоимость доставки</span>
          </div>
          <span className="font-bold text-primary-dark">
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
          disabled={isSubmitting}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-muted">
              Адрес доставки
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoadingLocation || isSubmitting}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingLocation ? (
                <>
                  <Icon name="progress_activity" size={16} className="animate-spin" />
                  <span>Определение...</span>
                </>
              ) : (
                <>
                  <Icon name="my_location" size={16} />
                  <span>Мое местоположение</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Улица, дом, квартира, подъезд, этаж..."
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {error && <p className="text-error text-sm text-center">{error}</p>}
      {submitError && <p className="text-error text-sm text-center">{submitError}</p>}

      {/* Compact mode selector */}
      <button
        onClick={cycleMode}
        className="w-full h-10 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon name={getModeIcon()} size={16} className="text-[#f7df00]" />
          <span className="text-sm font-medium text-gray-700">{getModeLabel()}</span>
        </div>
        <Icon name="chevron_right" size={18} className="text-gray-400" />
      </button>

      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          className="w-full"
          variant="navy"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon name="progress_activity" size={18} className="mr-2 animate-spin text-[#f7df00]" />
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
