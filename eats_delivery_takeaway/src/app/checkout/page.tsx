"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { PhoneStep } from "@/components/checkout/PhoneStep";
import { OtpStep } from "@/components/checkout/OtpStep";
import { DeliveryDetailsStep } from "@/components/checkout/DeliveryDetailsStep";
import { TakeawayDetailsStep } from "@/components/checkout/TakeawayDetailsStep";
import { useAuthStore } from "@/stores/authStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { createDeliveryOrder, createTakeawayOrder, requestCashPayment } from "@/lib/api";
import { PaymentMethod } from "@/types/enums";
import type { Order } from "@/types";
import { useToast } from "@/components/ui/Toast";

type Step = "phone" | "otp" | "details";

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();

  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const storedPhone = useAuthStore((s) => s.phone);
  const mode = useOrderModeStore((s) => s.mode);
  // Restaurant id is tracked by the cart (set on first addItem). The
  // orderModeStore.selectedRestaurantId is never populated, so we read it
  // from the cart instead — otherwise the "Подтвердить" button silently
  // returns when submit handlers see null.
  const cartRestaurantId = useCartStore((s) => s.restaurantId);
  const orderModeRestaurantId = useOrderModeStore((s) => s.selectedRestaurantId);
  const selectedRestaurantId = cartRestaurantId ?? orderModeRestaurantId;
  const address = useOrderModeStore((s) => s.deliveryAddress);
  const juraAddressId = useOrderModeStore((s) => s.juraAddressId);
  const addressLat = useOrderModeStore((s) => s.addressLat);
  const addressLng = useOrderModeStore((s) => s.addressLng);
  const tariffId = useOrderModeStore((s) => s.tariffId);
  const deliveryFee = useOrderModeStore((s) => s.deliveryFee);
  const setCustomer = useOrderModeStore((s) => s.setCustomer);
  const clearMode = useOrderModeStore((s) => s.clear);
  const openAddressModal = useUIStore((s) => s.openAddressModal);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<Step>(isAuth ? "details" : "phone");
  const [authPhone, setAuthPhone] = useState(storedPhone ?? "");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  // If user lands here without an address in delivery mode, prompt for one
  // via the global modal instead of redirecting to a dead-end legacy page.
  useEffect(() => {
    if (mode === "delivery" && !address) {
      openAddressModal();
    }
  }, [mode, address, openAddressModal]);

  useEffect(() => {
    if (isAuth && step !== "details") setStep("details");
  }, [isAuth, step]);

  const stepNumber = step === "phone" ? 1 : step === "otp" ? 2 : 3;

  const submitDelivery = async (data: {
    name: string;
    phone: string;
    comment: string;
    payment: PaymentMethod;
    tariffId: number | null;
    acceptedTerms: boolean;
  }) => {
    if (!selectedRestaurantId || !address) return;
    setSubmitting(true);
    setError(null);
    try {
      // The contact phone entered in the form may differ from the auth
      // phone. We pass it as customerPhone on the order but never overwrite
      // the auth session.
      setCustomer(data.name, data.phone);
      const order = await createDeliveryOrder({
        restaurantId: selectedRestaurantId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          sizeId: i.sizeId,
          addonIds: i.addonIds,
          note: i.note,
        })),
        deliveryAddress: address,
        addressLat: addressLat ?? undefined,
        addressLng: addressLng ?? undefined,
        juraAddressId: juraAddressId ?? undefined,
        tariffId: data.tariffId ?? tariffId ?? undefined,
        customerName: data.name,
        customerPhone: data.phone,
        paymentMethod: data.payment,
        specialInstructions: data.comment,
        deliveryFee,
        acceptedTerms: data.acceptedTerms,
      });
      await handlePostOrder(order, data.payment);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось создать заказ");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTakeaway = async (data: {
    name: string;
    phone: string;
    comment: string;
    payment: PaymentMethod;
    readyTime?: string;
    acceptedTerms: boolean;
  }) => {
    if (!selectedRestaurantId) return;
    setSubmitting(true);
    setError(null);
    try {
      setCustomer(data.name, data.phone);
      const order = await createTakeawayOrder({
        restaurantId: selectedRestaurantId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          sizeId: i.sizeId,
          addonIds: i.addonIds,
          note: i.note,
        })),
        customerName: data.name,
        customerPhone: data.phone,
        paymentMethod: data.payment,
        specialInstructions: data.comment,
        pickupTime: data.readyTime,
        acceptedTerms: data.acceptedTerms,
      });
      await handlePostOrder(order, data.payment);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось создать заказ");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostOrder = async (order: Order, payment: PaymentMethod) => {
    if (payment === PaymentMethod.card) {
      const link = order.paymentLink;
      if (link) {
        // Берём готовую ссылку DC, сохранённую в ресторане (та же схема, что
        // и у dine-in QR-меню). Подставляем сумму и комментарий с номером
        // заказа, очищаем корзину/режим и редиректим в платёжный шлюз.
        const amount = Math.round(order.total ?? order.totalAmount ?? 0);
        const orderNumber = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();
        const comment =
          order.orderType === "Delivery"
            ? `Заказ № ${orderNumber} Доставка`
            : `Заказ № ${orderNumber} Самовывоз`;
        const encodedComment = encodeURIComponent(comment);

        // Поддерживаем три формата ссылки DC (как в dine-in QR-меню):
        //   1. С плейсхолдерами: ...s={amount}&c={comment}
        //   2. С пустыми параметрами в середине: ...s=&c=...
        //   3. С пустым параметром в конце: ...s=  / ...c=
        let finalLink = link;
        if (finalLink.includes("{amount}")) {
          finalLink = finalLink.replace("{amount}", String(amount));
        } else if (finalLink.includes("s=&")) {
          finalLink = finalLink.replace("s=&", `s=${amount}&`);
        } else if (finalLink.endsWith("s=")) {
          finalLink = finalLink + String(amount);
        }
        if (finalLink.includes("{comment}")) {
          finalLink = finalLink.replace("{comment}", encodedComment);
        } else if (finalLink.includes("c=&")) {
          finalLink = finalLink.replace("c=&", `c=${encodedComment}&`);
        } else if (finalLink.endsWith("c=")) {
          finalLink = finalLink + encodedComment;
        }

        clearCart();
        clearMode();
        toast.show("Заказ оформлен", "success");
        window.location.href = finalLink;
        return;
      }
      // Нет paymentLink у ресторана — онлайн-оплата недоступна. Не молчим:
      // показываем ошибку и оставляем заказ в pending — пользователь может
      // выбрать наличные либо оплатить позже.
      toast.show("Онлайн-оплата недоступна для этого ресторана", "error");
      clearCart();
      clearMode();
      router.replace("/orders");
      return;
    } else if (payment === PaymentMethod.cash) {
      try {
        await requestCashPayment(order.id);
      } catch {
        /* not fatal */
      }
    }

    clearCart();
    clearMode();
    toast.show("Заказ оформлен", "success");
    router.replace("/orders");
  };

  return (
    <div className="min-h-dvh bg-surface">
      <Header title="Оформление заказа" />
      <StepIndicator current={stepNumber} total={3} />

      {step === "phone" && (
        <PhoneStep
          initialPhone={authPhone}
          onSent={(p, code) => {
            setAuthPhone(p);
            setDevCode(code ?? null);
            setStep("otp");
          }}
        />
      )}

      {step === "otp" && (
        <OtpStep
          phone={authPhone}
          initialDevCode={devCode}
          onVerified={() => setStep("details")}
          onBack={() => setStep("phone")}
        />
      )}

      {step === "details" && mode === "delivery" && (
        <DeliveryDetailsStep onSubmit={submitDelivery} submitting={submitting} error={error} />
      )}

      {step === "details" && mode === "takeaway" && (
        <TakeawayDetailsStep onSubmit={submitTakeaway} submitting={submitting} error={error} />
      )}
    </div>
  );
}
