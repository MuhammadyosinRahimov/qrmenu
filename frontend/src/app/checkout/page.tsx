"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useTableStore } from "@/stores/tableStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useToast } from "@/components/ui/Toast";
import {
  createOrder,
  getTableByNumber,
  getRestaurantStatus,
  getActiveOrder,
  addItemsToOrder,
  createDeliveryOrder,
  createTakeawayOrder,
  createDineInOrder,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { DeliveryForm, TableNumberInput, TakeawayConfirm } from "@/components/order";
import type { Order } from "@/types";

type Step = "phone" | "otp" | "details";

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, sendOtp, verifyOtp, isLoading, error, clearError, phone: authPhone } =
    useAuthStore();
  const { tableId, tableNumber, restaurantId: tableRestaurantId, onlinePaymentAvailable } = useTableStore();
  const {
    mode,
    setMode,
    selectedRestaurantId,
    selectedRestaurantName,
    deliveryAddress,
    tableNumber: modeTableNumber,
    customerName,
    customerPhone,
    deliveryFee,
    setCustomerPhone,
    clearMode,
  } = useOrderModeStore();

  // Mode cycle for non-QR modes: delivery -> dinein -> takeaway -> delivery
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
      default: return "";
    }
  };

  // Determine the effective restaurant ID
  const restaurantId = mode === "qr" ? tableRestaurantId : selectedRestaurantId;

  // Determine initial step based on mode and authentication
  const getInitialStep = (): Step => {
    // If not authenticated, ALWAYS start at phone input
    if (!isAuthenticated) return "phone";
    // QR mode goes directly to OTP step (order will be submitted after)
    if (mode === "qr") return "otp";
    return "details";
  };

  const [step, setStep] = useState<Step>(getInitialStep);
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

  // Update step when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      // If the user loses authentication (e.g. storage cleared) while on the final details screen, 
      // forcefully step back to phone. But do NOT interrupt if they are typing OTP!
      if (step === "details") {
        setStep("phone");
      }
    } else if (isAuthenticated && step === "phone") {
      // QR mode: submit order directly when authenticated
      if (mode === "qr") {
        handleSubmitOrder();
      } else {
        setStep("details");
      }
    }
  }, [isAuthenticated, step, mode]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
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
      setCustomerPhone("+" + digits);

      // For QR mode, submit order directly after OTP verification
      if (mode === "qr") {
        await handleSubmitOrder();
      } else {
        setStep("details");
      }
    } catch {
      // Error is handled in store
    }
  };

  const handleDetailsBack = () => {
    router.push("/");
  };

  // Handle order completion - redirect to payment or orders page
  const handlePaymentRedirect = (order: Order) => {
    // Если есть PaymentLink для takeaway/delivery — редирект на оплату
    if (order.paymentLink && (mode === "takeaway" || mode === "delivery")) {
      // Подставляем сумму в ссылку (формат: {amount})
      const paymentUrl = order.paymentLink.replace("{amount}", String(order.total));
      showToast("Переход к оплате...", "success");
      // Редирект на внешнюю страницу оплаты
      window.location.href = paymentUrl;
      return;
    }

    // Для остальных режимов — на страницу заказов
    showToast("Заказ оформлен!", "success");
    router.push("/orders");
  };

  const handleSubmitOrder = async (dineInTableNumber?: number) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        addonIds: item.addonIds.length > 0 ? item.addonIds : undefined,
        note: item.note || undefined,
      }));

      if (mode === "delivery") {
        if (!selectedRestaurantId) {
          setSubmitError("Ресторан не выбран");
          setIsSubmitting(false);
          return;
        }
        if (!deliveryAddress) {
          setSubmitError("Адрес доставки не указан");
          setIsSubmitting(false);
          return;
        }

        const order = await createDeliveryOrder({
          restaurantId: selectedRestaurantId,
          items: orderItems,
          deliveryAddress,
          customerName: customerName || "Гость",
          customerPhone: customerPhone || authPhone || "",
          specialInstructions: specialInstructions || undefined,
        });

        clearCart();
        clearMode();
        // Redirect to payment for delivery
        handlePaymentRedirect(order);
      } else if (mode === "takeaway") {
        if (!selectedRestaurantId) {
          setSubmitError("Ресторан не выбран");
          setIsSubmitting(false);
          return;
        }

        const order = await createTakeawayOrder({
          restaurantId: selectedRestaurantId,
          items: orderItems,
          customerName: customerName || "Гость",
          customerPhone: customerPhone || authPhone || "",
          specialInstructions: specialInstructions || undefined,
        });

        clearCart();
        clearMode();
        // Redirect to payment for takeaway
        handlePaymentRedirect(order);
      } else if (mode === "dinein" && selectedRestaurantId && (dineInTableNumber || modeTableNumber)) {
        const tableNum = dineInTableNumber || modeTableNumber;
        await createDineInOrder({
          restaurantId: selectedRestaurantId,
          tableNumber: tableNum!,
          items: orderItems,
          specialInstructions: specialInstructions || undefined,
        });

        clearCart();
        clearMode();
        showToast("Заказ успешно оформлен!", "success");
        router.push("/orders");
      } else {
        // QR mode (original flow)
        if (!tableId && !tableNumber) {
          setSubmitError("Стол не определён. Отсканируйте QR-код.");
          setIsSubmitting(false);
          return;
        }

        let resolvedTableId = tableId;

        if (!tableId || tableId.startsWith("table-")) {
          if (!tableNumber) {
            setSubmitError("Стол не определён. Отсканируйте QR-код.");
            setIsSubmitting(false);
            return;
          }
          try {
            const table = await getTableByNumber(tableNumber);
            resolvedTableId = table.id;
          } catch {
            setSubmitError("Не удалось найти стол. Попробуйте отсканировать QR-код снова.");
            setIsSubmitting(false);
            return;
          }
        }

        let activeOrder: Order | null = null;
        try {
          activeOrder = await getActiveOrder(resolvedTableId!);
        } catch {
          // No active order or error - will create new
        }

        if (activeOrder && activeOrder.status !== "Cancelled") {
          await addItemsToOrder(activeOrder.id, orderItems);
        } else {
          await createOrder({
            tableId: resolvedTableId!,
            specialInstructions: specialInstructions || undefined,
            items: orderItems,
          });
        }

        clearCart();
        showToast("Заказ успешно оформлен!", "success");
        router.push("/orders");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = error.response?.data?.error || error.message || "Неизвестная ошибка";
      setSubmitError(`Ошибка: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const getStepTitle = () => {
    switch (step) {
      case "phone": return "Авторизация";
      case "otp": return mode === "qr" ? "Подтверждение заказа" : "Подтверждение";
      case "details": return mode === "delivery" ? "Адрес доставки" : mode === "dinein" ? "Номер стола" : mode === "takeaway" ? "Самовывоз" : "Оформление";
      default: return "Оформление";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <Icon name="arrow_back" size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{getStepTitle()}</h1>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Steps indicator - 2 steps for QR mode, 3 steps for other modes */}
        {(() => {
          // QR mode has only 2 steps (phone, otp), other modes have 3 (phone, otp, details)
          const steps: Step[] = mode === "qr" ? ["phone", "otp"] : ["phone", "otp", "details"];
          const currentIndex = steps.indexOf(step);

          return (
            <div className="flex items-center justify-center gap-2 py-4">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${
                    step === s
                      ? "bg-[#f7df00] text-[#0f2c5e] shadow-[0_4px_10px_rgba(247,223,0,0.3)]"
                      : i < currentIndex
                      ? "bg-gradient-to-br from-[#0f2c5e] to-[#0c244d] text-white shadow-md shadow-[#0f2c5e]/20"
                      : "bg-white text-gray-400 border border-gray-200"
                  }`}>
                    {i < currentIndex ? <Icon name="check" size={18} /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-1 rounded-full ${i < currentIndex ? "bg-[#0f2c5e]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Phone step */}
        {step === "phone" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-300 to-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                <Icon name="phone_iphone" size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Введите номер телефона</h2>
              <p className="text-gray-500">Мы отправим SMS с кодом подтверждения</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+992"
                className="text-center text-xl font-medium"
                error={error || undefined}
              />
            </div>

            <Button
              onClick={handleSendOtp}
              className="w-full"
              variant="navy"
              size="lg"
              isLoading={isLoading}
              disabled={phone.replace(/\D/g, "").length !== 12}
            >
              <Icon name="send" size={20} className="mr-2 text-[#f7df00]" />
              Получить код
            </Button>
          </div>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                mode === "qr"
                  ? "bg-gradient-to-br from-[#0f2c5e] to-[#0c244d] shadow-[#0f2c5e]/20"
                  : "bg-gradient-to-br from-[#0f2c5e] to-[#0c244d] shadow-[#0f2c5e]/20"
              }`}>
                <Icon name={mode === "qr" ? "receipt_long" : "sms"} size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Введите код из SMS</h2>
              <p className="text-gray-500">Код отправлен на {phone}</p>
              {mode === "qr" && (
                <p className="text-sm text-[#0f2c5e] mt-2 font-medium">
                  После подтверждения заказ будет оформлен
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                className="text-center text-3xl tracking-[0.5em] font-bold"
                error={error || submitError || undefined}
                maxLength={4}
              />
            </div>

            <p className="text-center text-sm text-gray-400">Код придёт по SMS в течение минуты</p>

            {submitError && mode === "qr" && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                <Icon name="error" size={20} className="text-red-500" />
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleVerifyOtp}
                className="w-full"
                variant="navy"
                size="lg"
                isLoading={isLoading || isSubmitting}
                disabled={otp.length !== 4}
              >
                <Icon name={mode === "qr" ? "check_circle" : "verified"} size={20} className="mr-2 text-[#f7df00]" />
                {mode === "qr" ? "Подтвердить заказ" : "Подтвердить"}
              </Button>
              <Button onClick={() => setStep("phone")} variant="ghost" className="w-full" disabled={isSubmitting}>
                <Icon name="edit" size={18} className="mr-2" />
                Изменить номер
              </Button>
            </div>
          </div>
        )}

        {/* Details step - now includes submit */}
        {step === "details" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {mode === "delivery" && (
              <DeliveryForm
                onSubmit={handleSubmitOrder}
                onBack={handleDetailsBack}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
            {mode === "dinein" && (
              <TableNumberInput
                onSubmit={(tableNum) => handleSubmitOrder(tableNum)}
                onBack={handleDetailsBack}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
            {mode === "takeaway" && (
              <TakeawayConfirm
                onSubmit={handleSubmitOrder}
                onBack={handleDetailsBack}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
            {mode === "qr" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f2c5e] to-[#0c244d] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#0f2c5e]/20">
                    <Icon name="receipt_long" size={32} className="text-[#f7df00]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Подтвердите заказ</h2>
                </div>

                {/* Order summary for QR mode */}
                <div className="bg-white rounded-2xl p-4 space-y-3 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Icon name="shopping_bag" size={18} className="text-primary" />
                    Ваш заказ
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <span className="text-gray-600 flex-1">
                          {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                          {item.sizeName && <span className="text-gray-400"> ({item.sizeName})</span>}
                        </span>
                        <span className="text-gray-800 font-medium ml-2">{formatPrice(item.totalPrice)} TJS</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Подитог</span>
                      <span>{formatPrice(getSubtotal())} TJS</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Обслуживание (10%)</span>
                      <span>{formatPrice(getTax())} TJS</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-gray-100">
                      <span>Итого</span>
                      <span className="text-primary">{formatPrice(getTotal())} TJS</span>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className="bg-blue-50 border-blue-100 rounded-2xl p-4 border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100">
                      <Icon name="info" size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Способ оплаты</p>
                      <p className="text-sm mt-1 text-blue-600">
                        После подтверждения заказа вы сможете выбрать способ оплаты: наличными или картой DC
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Комментарий к заказу
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Например: без лука, острый соус отдельно..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm transition-all"
                    rows={2}
                  />
                </div>
                

                {submitError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                    <Icon name="error" size={20} className="text-red-500" />
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}

                <Button
                  onClick={() => handleSubmitOrder()}
                  className="w-full"
                  variant="navy"
                  size="lg"
                  isLoading={isSubmitting}
                >
                  <Icon name="check_circle" size={22} className="mr-2 text-[#f7df00]" />
                  Подтвердить заказ
                </Button>

                <Button onClick={handleDetailsBack} variant="ghost" className="w-full">
                  <Icon name="arrow_back" size={18} className="mr-2" />
                  Назад
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pause modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="pause_circle" size={40} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Приём заказов приостановлен</h2>
            <p className="text-gray-500 mb-4">
              {pauseMessage || "Ресторан временно не принимает заказы. Пожалуйста, попробуйте позже."}
            </p>
            <div className="space-y-3">
              <Button onClick={() => setShowPauseModal(false)} variant="outline" className="w-full">
                Понятно
              </Button>
              <Button onClick={() => router.push("/menu")} variant="secondary" className="w-full">
                Вернуться в меню
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
