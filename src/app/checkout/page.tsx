"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useTableStore } from "@/stores/tableStore";
import { createOrder, getTableByNumber, getRestaurantStatus, getActiveOrder, addItemsToOrder } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import type { Order } from "@/types";

type Step = "phone" | "otp" | "confirm";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, sendOtp, verifyOtp, isLoading, error, clearError } =
    useAuthStore();
  const { tableId, tableNumber, restaurantId } = useTableStore();

  const [step, setStep] = useState<Step>(isAuthenticated ? "confirm" : "phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pause modal state
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMessage, setPauseMessage] = useState("");

  // Check restaurant status
  useEffect(() => {
    const checkRestaurantStatus = async () => {
      if (restaurantId) {
        try {
          const status = await getRestaurantStatus(restaurantId);
          if (!status.acceptingOrders) {
            setShowPauseModal(true);
            setPauseMessage(status.pauseMessage || "");
          }
        } catch (error) {
          console.error("Error checking restaurant status:", error);
        }
      }
    };
    checkRestaurantStatus();
  }, [restaurantId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatPhone = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "");

    // Format as +992 XX XXX-XX-XX
    let formatted = "";
    if (digits.length > 0) {
      formatted = "+992";
      if (digits.length > 3) {
        formatted += " " + digits.slice(3, 5);
        if (digits.length > 5) {
          formatted += " " + digits.slice(5, 8);
          if (digits.length > 8) {
            formatted += "-" + digits.slice(8, 10);
            if (digits.length > 10) {
              formatted += "-" + digits.slice(10, 12);
            }
          }
        }
      }
    }
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 12) {
      setPhone(formatPhone(digits.startsWith("992") ? digits : "992" + digits));
    }
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 12) return;

    clearError();
    try {
      await sendOtp("+" + digits);
      setStep("otp");
    } catch {
      // Error is handled in store
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) return;

    const digits = phone.replace(/\D/g, "");
    clearError();
    try {
      await verifyOtp("+" + digits, otp);
      setStep("confirm");
    } catch {
      // Error is handled in store
    }
  };

  const handleSubmitOrder = async () => {
    if (!tableId && !tableNumber) {
      setSubmitError("Стол не определён. Отсканируйте QR-код.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Resolve real table ID if we have a fallback ID
      let resolvedTableId = tableId;

      if (!tableId || tableId.startsWith("table-")) {
        if (!tableNumber) {
          setSubmitError("Стол не определён. Отсканируйте QR-код.");
          setIsSubmitting(false);
          return;
        }
        // Get real table ID from API
        try {
          const table = await getTableByNumber(tableNumber);
          resolvedTableId = table.id;
        } catch {
          setSubmitError("Не удалось найти стол. Попробуйте отсканировать QR-код снова.");
          setIsSubmitting(false);
          return;
        }
      }

      const orderItems = items.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        addonIds: item.addonIds.length > 0 ? item.addonIds : undefined,
      }));

      // Check for existing active order on this table
      let activeOrder: Order | null = null;
      try {
        activeOrder = await getActiveOrder(resolvedTableId!);
      } catch {
        // No active order or error - will create new
      }

      if (activeOrder && activeOrder.status !== "Completed" && activeOrder.status !== "Cancelled") {
        // Add items to existing order
        await addItemsToOrder(activeOrder.id, orderItems);
      } else {
        // Create new order
        await createOrder({
          tableId: resolvedTableId!,
          specialInstructions: specialInstructions || undefined,
          items: orderItems,
        });
      }

      clearCart();
      router.push("/checkout/success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = error.response?.data?.error || error.message || "Неизвестная ошибка";
      setSubmitError(`Ошибка: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border z-40">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="mr-4">
            <Icon name="arrow_back" size={24} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Оформление заказа</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2">
          {["phone", "otp", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === s
                    ? "bg-orange-500 text-white"
                    : i < ["phone", "otp", "confirm"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-muted"
                }`}
              >
                {i < ["phone", "otp", "confirm"].indexOf(step) ? (
                  <Icon name="check" size={18} />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    i < ["phone", "otp", "confirm"].indexOf(step)
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Phone step */}
        {step === "phone" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Введите номер телефона
              </h2>
              <p className="text-muted">
                Мы отправим SMS с кодом подтверждения
              </p>
            </div>

            <Input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+992 __ ___-__-__"
              className="text-center text-xl"
              error={error || undefined}
            />

            <Button
              onClick={handleSendOtp}
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={phone.replace(/\D/g, "").length !== 12}
            >
              Получить код
            </Button>
          </div>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Введите код из SMS
              </h2>
              <p className="text-muted">
                Код отправлен на {phone}
              </p>
            </div>

            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="____"
              className="text-center text-2xl tracking-[0.5em]"
              error={error || undefined}
              maxLength={4}
            />

            <p className="text-center text-sm text-muted">
              Код придёт по SMS в течение минуты
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyOtp}
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={otp.length !== 4}
              >
                Подтвердить
              </Button>
              <Button
                onClick={() => setStep("phone")}
                variant="ghost"
                className="w-full"
              >
                Изменить номер
              </Button>
            </div>
          </div>
        )}

        {/* Confirm step */}
        {step === "confirm" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Подтверждение заказа
              </h2>
              <p className="text-muted">Проверьте детали и подтвердите</p>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-xl p-4 space-y-4 border border-border shadow-sm">
              <h3 className="font-semibold text-foreground">Ваш заказ</h3>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted">
                    {item.productName} x{item.quantity}
                    {item.sizeName && ` (${item.sizeName})`}
                  </span>
                  <span className="text-foreground">
                    {formatPrice(item.totalPrice)} TJS
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted">
                  <span>Подитог</span>
                  <span>{formatPrice(getSubtotal())} TJS</span>
                </div>
                <div className="flex justify-between text-sm text-muted">
                  <span>Обслуживание (10%)</span>
                  <span>{formatPrice(getTax())} TJS</span>
                </div>
                <div className="flex justify-between font-bold text-foreground">
                  <span>Итого</span>
                  <span className="text-orange-500">{formatPrice(getTotal())} TJS</span>
                </div>
              </div>
            </div>

            {/* Special instructions */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Комментарий к заказу (необязательно)
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Например: без лука, острое соус отдельно..."
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none shadow-sm"
                rows={3}
              />
            </div>

            {submitError && (
              <p className="text-error text-sm text-center">{submitError}</p>
            )}

            <Button
              onClick={handleSubmitOrder}
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Подтвердить заказ
            </Button>
          </div>
        )}
      </div>

      {/* Pause modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="pause_circle" size={40} className="text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Приём заказов приостановлен
            </h2>
            <p className="text-muted mb-4">
              {pauseMessage || "Ресторан временно не принимает заказы. Пожалуйста, попробуйте позже."}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setShowPauseModal(false)}
                variant="outline"
                className="w-full"
              >
                Понятно
              </Button>
              <Button
                onClick={() => router.push("/menu")}
                variant="secondary"
                className="w-full"
              >
                Вернуться в меню
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
