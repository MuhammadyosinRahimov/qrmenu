"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PhoneStep } from "@/components/checkout/PhoneStep";
import { OtpStep } from "@/components/checkout/OtpStep";
import { useAuthStore } from "@/stores/authStore";
import { useOrderModeStore } from "@/stores/orderModeStore";

type Step = "phone" | "otp";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const storedPhone = useAuthStore((s) => s.phone);
  const deliveryAddress = useOrderModeStore((s) => s.deliveryAddress);

  const redirectTo = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(storedPhone ?? "");
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (isAuth) {
      router.replace(redirectTo);
    }
  }, [isAuth, redirectTo, router]);

  const handleVerified = () => {
    if (!deliveryAddress && typeof window !== "undefined") {
      window.sessionStorage.setItem("openAddressOnHome", "1");
      router.replace("/");
    } else {
      router.replace(redirectTo);
    }
  };

  return (
    <div className="min-h-dvh bg-surface">
      <Header title="Вход" />
      {step === "phone" ? (
        <PhoneStep
          initialPhone={phone}
          onSent={(p, code) => {
            setPhone(p);
            setDevCode(code ?? null);
            setStep("otp");
          }}
        />
      ) : (
        <OtpStep
          phone={phone}
          initialDevCode={devCode}
          onVerified={handleVerified}
          onBack={() => setStep("phone")}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface" />}>
      <LoginInner />
    </Suspense>
  );
}
