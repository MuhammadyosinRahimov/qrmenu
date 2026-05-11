"use client";

import { useState } from "react";
import { sendOtp, extractApiError } from "@/lib/api";
import { formatPhone, normalizePhoneForApi, stripPhone } from "@/lib/format";

export function PhoneStep({
  initialPhone,
  onSent,
}: {
  initialPhone?: string;
  onSent: (phone: string, devCode?: string | null) => void;
}) {
  const [raw, setRaw] = useState(initialPhone ? stripPhone(initialPhone) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const display = formatPhone(raw);
  const valid = raw.length >= 9;

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const phone = normalizePhoneForApi(raw);
      const res = await sendOtp(phone);
      onSent(phone, res.devCode ?? null);
    } catch (e: unknown) {
      setError(extractApiError(e, "Ошибка отправки кода"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-8 max-w-md mx-auto">
      <div className="relative bg-white rounded-3xl shadow-md border border-border p-6 sm:p-7">
        {/* Decorative dots */}
        <span className="pointer-events-none absolute -top-2 right-12 w-4 h-4 rounded-full bg-cta" />
        <span className="pointer-events-none absolute top-2 -right-1 w-3 h-3 rounded-full bg-info" />
        <span className="pointer-events-none absolute top-16 -left-2 w-3 h-3 rounded-full bg-error/70" />
        <span className="pointer-events-none absolute top-24 right-3 w-2.5 h-2.5 rounded-full bg-primary" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <span
              className="material-symbols-rounded text-primary"
              style={{ fontSize: 40 }}
            >
              restaurant_menu
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Добро пожаловать
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Введите номер телефона, чтобы войти или создать аккаунт
          </p>
        </div>

        <label className="block text-sm font-semibold text-foreground mb-2">
          Номер телефона
        </label>
        <div
          className={[
            "flex items-center gap-2 rounded-2xl border bg-white px-3 h-14 transition",
            error ? "border-danger" : "border-border focus-within:border-primary",
          ].join(" ")}
        >
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-xs font-bold text-foreground/80">
            <span aria-hidden>🇹🇯</span>
            <span>TJ</span>
          </span>
          <span className="text-base font-semibold text-foreground">+992</span>
          <input
            inputMode="tel"
            placeholder="93 ••• •• ••"
            className="flex-1 bg-transparent border-0 outline-none text-base font-semibold tracking-wide placeholder:text-muted/70 placeholder:font-medium"
            value={display}
            onChange={(e) => setRaw(stripPhone(e.target.value).slice(0, 9))}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Мы отправим SMS с кодом подтверждения
        </p>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={!valid || loading}
          className="mt-5 w-full h-14 rounded-2xl bg-cta text-cta-foreground font-bold text-base hover:bg-cta-dark active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? "Отправляем..." : (
            <>
              Получить код
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 18 }}
              >
                arrow_forward
              </span>
            </>
          )}
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary text-xs font-semibold">
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>
              bolt
            </span>
            Быстрая регистрация
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary text-xs font-semibold">
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>
              shield
            </span>
            Безопасно
          </span>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted">
          Продолжая, вы принимаете условия сервиса
        </p>
      </div>
    </div>
  );
}
