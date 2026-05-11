"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getMe, updateMe } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import { useAuthStore } from "@/stores/authStore";

const GENDERS = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
  { value: "other", label: "Не указано" },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const phone = useAuthStore((s) => s.phone);

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuth,
  });

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? "");
    setSurname(me.surname ?? "");
    setGender(me.gender ?? "");
    setBirthDate(me.birthDate ? me.birthDate.slice(0, 10) : "");
    setEmail(me.email ?? "");
  }, [me]);

  const mutation = useMutation({
    mutationFn: () =>
      updateMe({
        name: name.trim() || null,
        surname: surname.trim() || null,
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        email: email.trim() || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.show("Профиль сохранён", "success");
      router.back();
    },
    onError: () => toast.show("Не удалось сохранить", "error"),
  });

  if (!isAuth) {
    return (
      <div className="min-h-dvh bg-surface">
        <Header title="Личные данные" />
        <div className="p-6 text-center text-sm text-muted">Войдите в аккаунт</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface pb-32">
      <Header title="Личные данные" />
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-sm text-muted py-8">Загрузка...</div>
        ) : (
          <>
            <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Фамилия" value={surname} onChange={(e) => setSurname(e.target.value)} />

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Пол</label>
              <div className="flex gap-2">
                {GENDERS.map((g) => {
                  const active = gender === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGender(g.value)}
                      className={`flex-1 py-2 rounded-full text-sm font-medium border transition ${
                        active ? "bg-primary text-white border-primary" : "bg-white border-border"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted">Дата рождения</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-border rounded-2xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <Input
              label="Телефон"
              value={phone ? formatPhone(phone.replace(/^992/, "")) : ""}
              readOnly
              disabled
            />

            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
            />
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4">
        <Button fullWidth isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
