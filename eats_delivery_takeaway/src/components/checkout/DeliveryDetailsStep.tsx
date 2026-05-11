"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { PaymentInfoLocked } from "./PaymentInfoLocked";
import { CheckoutFooter } from "./CheckoutFooter";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { PaymentMethod } from "@/types/enums";
import { formatTJS, normalizePhoneForApi } from "@/lib/format";
import { calculateDelivery, getJuraTariffs } from "@/lib/api";

export function DeliveryDetailsStep({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (data: {
    name: string;
    phone: string;
    comment: string;
    payment: PaymentMethod;
    tariffId: number | null;
    acceptedTerms: boolean;
  }) => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const address = useOrderModeStore((s) => s.deliveryAddress);
  const addressLat = useOrderModeStore((s) => s.addressLat);
  const addressLng = useOrderModeStore((s) => s.addressLng);
  const tariffId = useOrderModeStore((s) => s.tariffId);
  const deliveryFee = useOrderModeStore((s) => s.deliveryFee);
  const distanceMeters = useOrderModeStore((s) => s.distanceMeters);
  const customerName = useOrderModeStore((s) => s.customerName);
  const deliveryDetails = useOrderModeStore((s) => s.deliveryDetails);
  const setDeliveryDetails = useOrderModeStore((s) => s.setDeliveryDetails);
  const setTariff = useOrderModeStore((s) => s.setTariff);
  const setDeliveryCalc = useOrderModeStore((s) => s.setDeliveryCalc);
  const authPhone = useAuthStore((s) => s.phone);
  const openAddressModal = useUIStore((s) => s.openAddressModal);

  const total = useCartStore((s) => s.getTotal());
  const subtotal = useCartStore((s) => s.getSubtotal());

  const [name, setName] = useState(customerName ?? "");
  const [phone, setPhone] = useState(authPhone ?? "");
  const [entrance, setEntrance] = useState(deliveryDetails.entrance);
  const [floor, setFloor] = useState(deliveryDetails.floor);
  const [apartment, setApartment] = useState(deliveryDetails.apartment);
  const [intercom, setIntercom] = useState(deliveryDetails.intercom);
  const [comment, setComment] = useState("");
  // Delivery only allows online card payment.
  const payment: PaymentMethod = PaymentMethod.card;
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const phoneNormalized = normalizePhoneForApi(phone || "");
  const phoneOk = phoneNormalized.length >= 9;
  const hasCoords = addressLat != null && addressLng != null;
  const canSubmit =
    name.trim().length >= 2 &&
    phoneOk &&
    !!address &&
    hasCoords &&
    !!tariffId &&
    acceptedTerms;

  // Fetch JURA tariffs once
  const { data: tariffs, isLoading: tariffsLoading } = useQuery({
    queryKey: ["jura-tariffs"],
    queryFn: getJuraTariffs,
    staleTime: 60 * 60 * 1000,
  });

  // Auto-select first tariff if none picked yet
  useEffect(() => {
    if (!tariffId && tariffs && tariffs.length > 0) {
      setTariff(tariffs[0].id);
    }
  }, [tariffs, tariffId, setTariff]);

  // Re-calculate delivery fee whenever tariff/address/phone changes
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  useEffect(() => {
    if (!tariffId || !hasCoords || !phoneOk) {
      setCalcError(null);
      return;
    }
    let cancelled = false;
    setCalcLoading(true);
    setCalcError(null);
    calculateDelivery({
      tariffId,
      phone: phoneNormalized,
      toAddress: { lat: addressLat!, lng: addressLng!, address: address ?? undefined },
    })
      .then((res) => {
        if (cancelled) return;
        if (res.success && typeof res.price === "number") {
          setDeliveryCalc(res.price, res.distance ?? undefined, res.duration ?? undefined);
        } else {
          setCalcError(res.message || "Не удалось рассчитать доставку");
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setCalcError(e instanceof Error ? e.message : "Ошибка расчёта доставки");
      })
      .finally(() => {
        if (!cancelled) setCalcLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariffId, addressLat, addressLng, phoneNormalized]);

  const buildComment = (): string => {
    const parts: string[] = [];
    if (entrance.trim()) parts.push(`Подъезд: ${entrance.trim()}`);
    if (floor.trim()) parts.push(`Этаж: ${floor.trim()}`);
    if (apartment.trim()) parts.push(`Кв.: ${apartment.trim()}`);
    if (intercom.trim()) parts.push(`Домофон: ${intercom.trim()}`);
    if (comment.trim()) parts.push(comment.trim());
    return parts.join("; ");
  };

  const onConfirm = () => {
    setDeliveryDetails({
      entrance: entrance.trim(),
      floor: floor.trim(),
      apartment: apartment.trim(),
      intercom: intercom.trim(),
    });
    onSubmit({
      name: name.trim(),
      phone: phoneNormalized,
      comment: buildComment(),
      payment,
      tariffId,
      acceptedTerms,
    });
  };

  const distanceKm = useMemo(() => {
    if (distanceMeters == null) return null;
    return (distanceMeters / 1000).toFixed(1);
  }, [distanceMeters]);

  return (
    <div className="p-4 space-y-4 pb-32">
      <div>
        <h2 className="text-lg font-semibold">Детали заказа</h2>
      </div>

      <div className="bg-white border border-border rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <Icon name="location" size={18} className="text-primary mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted">Адрес доставки</div>
            <div className="text-sm font-medium truncate">{address ?? "Адрес не указан"}</div>
            {!hasCoords && address && (
              <div className="text-xs text-red-500 mt-1">
                Выберите адрес на карте для расчёта доставки
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={openAddressModal}
            className="text-xs text-primary font-medium hover:underline"
          >
            Изменить
          </button>
        </div>
      </div>

      {/* Тарифы JURA */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Тариф доставки</div>
        {tariffsLoading ? (
          <div className="text-sm text-muted px-4 py-3 bg-white rounded-2xl border border-border">
            Загрузка тарифов...
          </div>
        ) : !tariffs || tariffs.length === 0 ? (
          <div className="text-sm text-red-500 px-4 py-3 bg-white rounded-2xl border border-border">
            Нет доступных тарифов
          </div>
        ) : (
          <div className="grid gap-2">
            {tariffs.map((t) => {
              const active = tariffId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTariff(t.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                    active ? "border-primary bg-primary/5" : "border-border bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{t.name}</div>
                      {t.description && (
                        <div className="text-xs text-muted mt-0.5 truncate">{t.description}</div>
                      )}
                    </div>
                    {active && hasCoords && (
                      <div className="text-right">
                        {calcLoading ? (
                          <div className="text-xs text-muted">Расчёт...</div>
                        ) : (
                          <>
                            <div className="text-sm font-semibold text-primary">
                              {deliveryFee > 0 ? formatTJS(deliveryFee) : "—"}
                            </div>
                            {distanceKm && (
                              <div className="text-[11px] text-muted">{distanceKm} км</div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {calcError && (
          <div className="text-xs text-red-500 px-1">{calcError}</div>
        )}
      </div>

      <Input
        label="Имя"
        placeholder="Как к вам обращаться"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="Телефон для связи"
        placeholder="+992 XX XXX XX XX"
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className="bg-white border border-border rounded-2xl p-4 space-y-3">
        <div className="text-sm font-medium">Детали адреса</div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Подъезд"
            placeholder="—"
            value={entrance}
            onChange={(e) => setEntrance(e.target.value)}
            inputMode="numeric"
          />
          <Input
            label="Этаж"
            placeholder="—"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            inputMode="numeric"
          />
          <Input
            label="Квартира"
            placeholder="—"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />
          <Input
            label="Домофон"
            placeholder="—"
            value={intercom}
            onChange={(e) => setIntercom(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Комментарий курьеру</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Например: позвонить за 5 мин"
          className="w-full min-h-[72px] px-3 py-2 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary text-sm"
          maxLength={200}
        />
      </div>

      <PaymentInfoLocked />

      <label className="flex items-start gap-2 text-sm text-foreground select-none">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary"
        />
        <span>
          Я принимаю{" "}
          <Link href="/legal/terms" className="text-primary underline">
            публичную оферту
          </Link>{" "}
          и согласие на обработку персональных данных
        </span>
      </label>

      {error && <div className="rounded-2xl bg-red-50 border border-red-200 text-red-600 p-3 text-sm">{error}</div>}

      <CheckoutFooter
        subtotal={subtotal}
        total={total}
        onSubmit={onConfirm}
        disabled={!canSubmit}
        isLoading={submitting}
      />
    </div>
  );
}
