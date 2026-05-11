"use client";

import { useEffect, useRef, useState } from "react";
import { sendOtp, verifyOtp, extractApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { formatPhone } from "@/lib/format";

const OTP_LEN = 4;

export function OtpStep({
  phone,
  onVerified,
  onBack,
  initialDevCode,
}: {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
  initialDevCode?: string | null;
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resend, setResend] = useState(30);
  const [devCode, setDevCode] = useState<string | null>(initialDevCode ?? null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setInterval(() => setResend((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [resend]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const onDigit = (idx: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const copy = [...digits];
    copy[idx] = d;
    setDigits(copy);
    if (d && idx < OTP_LEN - 1) inputsRef.current[idx + 1]?.focus();
    if (copy.every((x) => x)) verify(copy.join(""));
  };

  const onBackspace = (idx: number, key: string) => {
    if (key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const verify = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(phone, code);
      setAuth({ token: res.token, userId: res.userId, phone: res.phone });
      onVerified();
    } catch (e: unknown) {
      setError(extractApiError(e, "Неверный код"));
      setDigits(Array(OTP_LEN).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const doResend = async () => {
    try {
      const res = await sendOtp(phone);
      setResend(30);
      setDevCode(res.devCode ?? null);
      setError(null);
    } catch (e: unknown) {
      setError(extractApiError(e, "Ошибка повторной отправки"));
    }
  };

  return (
    <div className="px-4 pt-6 pb-8 max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-md border border-border p-6 sm:p-7">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <span
              className="material-symbols-rounded text-primary"
              style={{ fontSize: 40 }}
            >
              sms
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Код из SMS</h1>
          <p className="mt-1.5 text-sm text-muted">
            Отправлен на{" "}
            <span className="font-semibold text-foreground">
              {formatPhone(phone.replace(/^992/, ""))}
            </span>
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => onDigit(i, e.target.value)}
              onKeyDown={(e) => onBackspace(i, e.key)}
              inputMode="numeric"
              maxLength={1}
              className="w-14 h-16 text-center text-2xl font-bold bg-white border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
            />
          ))}
        </div>
        {error && (
          <p className="mt-3 text-sm text-danger text-center">{error}</p>
        )}

        {devCode && (
          <div className="mt-4 mx-auto max-w-xs rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-amber-700">
              Dev-режим
            </p>
            <p className="text-2xl font-bold tracking-widest text-amber-900">
              {devCode}
            </p>
          </div>
        )}

        <div className="mt-4 text-center text-sm">
          {resend > 0 ? (
            <span className="text-muted">Повторно через {resend}с</span>
          ) : (
            <button
              className="text-primary font-semibold"
              onClick={doResend}
            >
              Отправить код повторно
            </button>
          )}
        </div>

        {loading && (
          <div className="mt-2 text-center text-sm text-muted">Проверка...</div>
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-5 w-full h-12 rounded-2xl text-foreground/70 hover:text-foreground hover:bg-gray-50 transition font-semibold"
        >
          Изменить номер
        </button>
      </div>
    </div>
  );
}
