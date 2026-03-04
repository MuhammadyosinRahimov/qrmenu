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

  // Determine the effective restaurant ID
  const restaurantId = mode === "qr" ? tableRestaurantId : selectedRestaurantId;

  // Determine initial step based on mode and authentication
  const getInitialStep = (): Step => {
    if (!isAuthenticated) return "phone";
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
    if (isAuthenticated && step === "phone") {
      setStep("details");
    }
  }, [isAuthenticated, step]);

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
      setStep("details");
    } catch {
      // Error is handled in store
    }
  };

  const handleDetailsSubmit = () => {
    handleSubmitOrder();
  };

  const handleDetailsBack = () => {
    router.push("/");
  };

  // Handle payment redirect for delivery/takeaway using paymentLink
  const handlePaymentRedirect = (order: Order) => {
    if (order.paymentLink) {
      // Replace {amount} placeholder with actual total
      const finalLink = order.paymentLink.replace('{amount}', order.total.toString());
      window.location.href = finalLink;
    } else {
      // No payment link - go to orders page
      showToast("Заказ оформлен! Оплата доступна на странице заказов.", "success");
      router.push("/orders");
    }
  };

  const handleSubmitOrder = async () => {
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
      } else if (mode === "dinein" && selectedRestaurantId && modeTableNumber) {
        await createDineInOrder({
          restaurantId: selectedRestaurantId,
          tableNumber: modeTableNumber,
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

        if (activeOrder && activeOrder.status !== "Completed" && activeOrder.status !== "Cancelled") {
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
      case "otp": return "Подтверждение";
      case "details": return mode === "delivery" ? "Адрес доставки" : mode === "dinein" ? "Номер стола" : "Самовывоз";
      default: return "Оформление";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/30">
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
        {/* Steps indicator */}
        {(() => {
          const steps = ["phone", "otp", "details"];
          const currentIndex = steps.indexOf(step);

          return (
            <div className="flex items-center justify-center gap-2 py-4">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${
                    step === s
                      ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-200"
                      : i < currentIndex
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-green-200"
                      : "bg-white text-gray-400 border border-gray-200"
                  }`}>
                    {i < currentIndex ? <Icon name="check" size={18} /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-1 rounded-full ${i < currentIndex ? "bg-green-400" : "bg-gray-200"}`} />
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
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
                placeholder="+992 __ ___-__-__"
                className="text-center text-xl font-medium"
                error={error || undefined}
              />
            </div>

            <Button
              onClick={handleSendOtp}
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={phone.replace(/\D/g, "").length !== 12}
            >
              <Icon name="send" size={20} className="mr-2" />
              Получить код
            </Button>
          </div>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <Icon name="sms" size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Введите код из SMS</h2>
              <p className="text-gray-500">Код отправлен на {phone}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                className="text-center text-3xl tracking-[0.5em] font-bold"
                error={error || undefined}
                maxLength={4}
              />
            </div>

            <p className="text-center text-sm text-gray-400">Код придёт по SMS в течение минуты</p>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyOtp}
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={otp.length !== 4}
              >
                <Icon name="verified" size={20} className="mr-2" />
                Подтвердить
              </Button>
              <Button onClick={() => setStep("phone")} variant="ghost" className="w-full">
                <Icon name="edit" size={18} className="mr-2" />
                Изменить номер
              </Button>
            </div>
          </div>
        )}

        {/* Details step */}
        {step === "details" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {mode === "delivery" && <DeliveryForm onSubmit={handleDetailsSubmit} onBack={handleDetailsBack} isSubmitting={isSubmitting} submitError={submitError} />}
            {mode === "dinein" && <TableNumberInput onSubmit={handleDetailsSubmit} onBack={handleDetailsBack} isSubmitting={isSubmitting} submitError={submitError} />}
            {mode === "takeaway" && <TakeawayConfirm onSubmit={handleDetailsSubmit} onBack={handleDetailsBack} isSubmitting={isSubmitting} submitError={submitError} />}
            {mode === "qr" && <TakeawayConfirm onSubmit={handleDetailsSubmit} onBack={handleDetailsBack} isSubmitting={isSubmitting} submitError={submitError} />}
          </div>
        )}

      </div>

      {/* Pause modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="pause_circle" size={40} className="text-orange-500" />
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
