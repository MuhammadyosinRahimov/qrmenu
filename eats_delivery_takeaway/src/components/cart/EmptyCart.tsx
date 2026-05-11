"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-primary-light text-primary-dark flex items-center justify-center mb-4 shadow-inner">
        <Icon name="cart" size={48} />
      </div>
      <h3 className="text-lg font-semibold">Корзина пуста</h3>
      <p className="text-sm text-muted mt-1 max-w-xs">
        Добавьте блюда из любимого ресторана, чтобы оформить заказ
      </p>
      <Link href="/orders" className="mt-6 w-full max-w-xs">
        <Button fullWidth>Мои заказы</Button>
      </Link>
    </div>
  );
}
