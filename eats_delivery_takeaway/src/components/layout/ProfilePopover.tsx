"use client";

import { useEffect, useRef, RefObject } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/authStore";

interface Props {
  anchorRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

export function ProfilePopover({ anchorRef, onClose }: Props) {
  const router = useRouter();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    router.replace("/");
  };

  return (
    <motion.div
      ref={popRef}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="absolute right-4 top-full mt-1.5 w-60 bg-white border border-border rounded-2xl shadow-xl py-2 z-50"
      role="menu"
    >
      <div className="px-4 pt-1.5 pb-1 text-[11px] uppercase tracking-wide text-muted font-semibold">
        {isAuth ? "Клиент" : "Гостевой режим"}
      </div>
      {!isAuth ? (
        <>
          <PopItem href="/cart" icon="cart" label="Корзина" onClose={onClose} />
          <PopItem
            href="/login"
            icon="login"
            label="Войти по SMS"
            highlight
            onClose={onClose}
          />
        </>
      ) : (
        <>
          <PopItem href="/profile" icon="profile" label="Мой профиль" onClose={onClose} />
          <PopItem href="/orders" icon="orders" label="Мои заказы" onClose={onClose} />
          <PopItem
            href="/restaurants"
            icon="restaurant"
            label="Рестораны"
            onClose={onClose}
          />
          <div className="my-1 mx-2 border-t border-border" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
            role="menuitem"
          >
            <Icon name="logout" size={18} />
            <span>Выйти</span>
          </button>
        </>
      )}
    </motion.div>
  );
}

function PopItem({
  href,
  icon,
  label,
  highlight,
  onClose,
}: {
  href: string;
  icon: string;
  label: string;
  highlight?: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 ${
        highlight ? "text-primary font-semibold" : "text-foreground"
      }`}
      role="menuitem"
    >
      <Icon name={icon} size={18} className={highlight ? "text-primary" : "text-muted"} />
      <span>{label}</span>
    </Link>
  );
}
