"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/authStore";
import { formatPhone } from "@/lib/format";
import { getMe } from "@/lib/api";

const ROWS = [
  { href: "/profile/edit", label: "Личные данные", icon: "profile" },
  { href: "/profile/addresses", label: "Мои адреса", icon: "location" },
  { href: "/orders?tab=history", label: "История заказов", icon: "orders" },
];

export default function ProfilePage() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const phone = useAuthStore((s) => s.phone);
  const logout = useAuthStore((s) => s.logout);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuth,
  });

  if (!isAuth) {
    return (
      <div className="min-h-dvh bg-surface pb-20">
        <Header title="Профиль" />
        <div className="px-6 py-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 text-muted flex items-center justify-center mb-4">
            <Icon name="profile" size={40} />
          </div>
          <h3 className="font-semibold">Войдите в аккаунт</h3>
          <p className="text-sm text-muted mt-1">Чтобы использовать адреса и заказы</p>
          <Link href="/login" className="inline-block mt-6">
            <Button>Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = [me?.name, me?.surname].filter(Boolean).join(" ");
  const hasPhone = Boolean(me?.phone ?? phone);

  return (
    <div className="min-h-dvh bg-surface pb-20">
      <Header title="Профиль" />
      <div className="p-4 space-y-4">
        {!hasPhone && (
          <Link
            href="/profile/link-phone"
            className="block bg-warning/10 border border-warning/30 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0">
                <Icon name="phone" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Привяжите телефон</div>
                <p className="text-xs text-muted mt-0.5">
                  Без номера нельзя оформить заказ и принимать SMS-уведомления.
                </p>
              </div>
              <Icon name="chevron-right" size={18} className="text-muted shrink-0" />
            </div>
          </Link>
        )}

        <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
            {me?.photoUrl ? (
              <Image src={me.photoUrl} alt="avatar" width={56} height={56} className="object-cover w-full h-full" />
            ) : (
              <Icon name="profile" size={28} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {fullName && <div className="font-semibold truncate">{fullName}</div>}
            <div className="text-xs text-muted">Телефон</div>
            <div className="text-sm">
              {hasPhone
                ? formatPhone((me?.phone ?? phone)!.replace(/^992/, ""))
                : <span className="text-muted">Не привязан</span>}
            </div>
            {me?.telegramUsername && (
              <div className="text-xs text-muted mt-0.5">Telegram: @{me.telegramUsername}</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl divide-y divide-border">
          {ROWS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 text-muted flex items-center justify-center">
                <Icon name={r.icon} size={18} />
              </div>
              <span className="flex-1 font-medium text-sm">{r.label}</span>
              <Icon name="chevron-right" size={18} className="text-muted" />
            </Link>
          ))}
        </div>

        <Button variant="ghost" fullWidth onClick={logout}>
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}
