"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { CheckoutFooter } from "./CheckoutFooter";
import { PickupRestaurantCard } from "./PickupRestaurantCard";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { PaymentMethod } from "@/types/enums";
import { normalizePhoneForApi } from "@/lib/format";
import { useOrderModeStore } from "@/stores/orderModeStore";

type ReadyOption = "asap" | "30" | "60" | "custom";

const READY_PRESETS: Array<{ value: ReadyOption; label: string }> = [
  { value: "asap", label: "Как можно скорее" },
  { value: "30", label: "+30 мин" },
  { value: "60", label: "+1 ч" },
  { value: "custom", label: "Своё время" },
];

function offsetTime(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60 * 1000);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function TakeawayDetailsStep({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (data: {
    name: string;
    phone: string;
    comment: string;
    payment: PaymentMethod;
    readyTime?: string;
    acceptedTerms: boolean;
  }) => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const customerName = useOrderModeStore((s) => s.customerName);
  const authPhone = useAuthStore((s) => s.phone);
  const total = useCartStore((s) => s.getTotal());
  const subtotal = useCartStore((s) => s.getSubtotal());
  const restaurantId = useCartStore((s) => s.restaurantId);

  const [name, setName] = useState(customerName ?? "");
  const [phone, setPhone] = useState(authPhone ?? "");
  const [comment, setComment] = useState("");
  const [readyOption, setReadyOption] = useState<ReadyOption>("asap");
  const [readyTime, setReadyTime] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>(PaymentMethod.cash);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const phoneNormalized = normalizePhoneForApi(phone || "");
  const phoneOk = phoneNormalized.length >= 9;
  const canSubmit = name.trim().length >= 2 && phoneOk && acceptedTerms;

  const computeReadyTime = (): string | undefined => {
    if (readyOption === "asap") return undefined;
    if (readyOption === "30") return offsetTime(30);
    if (readyOption === "60") return offsetTime(60);
    if (readyOption === "custom") return readyTime.trim() || undefined;
    return undefined;
  };

  return (
    <div className="p-4 space-y-4 pb-32">
      <div>
        <h2 className="text-lg font-semibold">Детали заказа</h2>
      </div>

      {restaurantId && <PickupRestaurantCard restaurantId={restaurantId} />}

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

      <div className="space-y-2">
        <div className="text-sm font-medium">Время готовности</div>
        <div className="grid grid-cols-2 gap-2">
          {READY_PRESETS.map((opt) => {
            const active = readyOption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setReadyOption(opt.value)}
                className={`py-2 px-3 rounded-2xl text-sm font-medium border transition ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                    : "bg-white border-border hover:bg-surface"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {readyOption === "custom" && (
          <input
            type="time"
            value={readyTime}
            onChange={(e) => setReadyTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-border rounded-2xl text-sm focus:outline-none focus:border-primary"
          />
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Комментарий к заказу</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Пожелания к приготовлению"
          className="w-full min-h-[72px] px-3 py-2 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary text-sm"
          maxLength={200}
        />
      </div>

      <PaymentMethodPicker
        value={payment}
        onChange={setPayment}
        allowed={[PaymentMethod.cash, PaymentMethod.card]}
      />

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
        onSubmit={() =>
          onSubmit({
            name: name.trim(),
            phone: phoneNormalized,
            comment: comment.trim(),
            payment,
            readyTime: computeReadyTime(),
            acceptedTerms,
          })
        }
        disabled={!canSubmit}
        isLoading={submitting}
      />
    </div>
  );
}
