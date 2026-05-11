"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/authStore";
import { linkPhoneSendOtp, linkPhoneVerifyOtp } from "@/lib/api";
import { formatPhone, normalizePhoneForApi, stripPhone } from "@/lib/format";

const OTP_LEN = 4;
type Step = "phone" | "otp";

export default function LinkPhonePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const setPhoneInStore = useAuthStore((s) => s.setPhone);

  const [step, setStep] = useState<Step>("phone");
  const [raw, setRaw] = useState("");
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resend, setResend] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!isAuth) router.replace("/login?redirect=/profile/link-phone");
  }, [isAuth, router]);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setInterval(() => setResend((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [resend]);

  useEffect(() => {
    if (step === "otp") inputsRef.current[0]?.focus();
  }, [step]);

  const display = formatPhone(raw);
  const valid = raw.length >= 9;

  const submitPhone = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const p = normalizePhoneForApi(raw);
      await linkPhoneSendOtp(p);
      setPhone(p);
      setDigits(Array(OTP_LEN).fill(""));
      setResend(30);
      setStep("otp");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? (e instanceof Error ? e.message : "Ошибка отправки кода"));
    } finally {
      setLoading(false);
    }
  };

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
      const updated = await linkPhoneVerifyOtp(phone, code);
      setPhoneInStore(updated.phone ?? phone);
      qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/profile");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? (e instanceof Error ? e.message : "Неверный код"));
      setDigits(Array(OTP_LEN).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const doResend = async () => {
    if (!phone) return;
    try {
      await linkPhoneSendOtp(phone);
      setResend(30);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка повторной отправки");
    }
  };

  return (
    <div className="min-h-dvh bg-surface">
      <Header title="Привязка телефона" showBack />
      {step === "phone" && (
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Укажите номер телефона</h2>
            <p className="text-sm text-muted mt-1">
              Нужен для оформления заказов и связи с курьером.
            </p>
          </div>
          <Input
            label="Телефон"
            placeholder="+992 xxx xx xx xx"
            inputMode="tel"
            leftIcon={<Icon name="phone" size={18} />}
            value={display}
            onChange={(e) => setRaw(stripPhone(e.target.value).slice(0, 9))}
            error={error ?? undefined}
          />
          <Button fullWidth disabled={!valid} isLoading={loading} onClick={submitPhone}>
            Получить код
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Код из SMS</h2>
            <p className="text-sm text-muted mt-1">
              Отправлен на {formatPhone(phone.replace(/^992/, ""))}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
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
                className="w-14 h-14 text-center text-2xl font-semibold bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div className="text-center text-sm">
            {resend > 0 ? (
              <span className="text-muted">Повторно через {resend}с</span>
            ) : (
              <button className="text-primary font-medium" onClick={doResend}>
                Отправить код повторно
              </button>
            )}
          </div>
          {loading && <div className="text-center text-sm text-muted">Проверка...</div>}
          <Button variant="ghost" fullWidth onClick={() => setStep("phone")}>
            Изменить номер
          </Button>
        </div>
      )}
    </div>
  );
}
