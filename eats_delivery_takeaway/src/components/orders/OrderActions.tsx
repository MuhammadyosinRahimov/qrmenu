"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Order } from "@/types";
import { OrderStatus, normalizeOrderStatus } from "@/types/enums";
import { Button } from "@/components/ui/Button";
import { repeatOrder } from "@/lib/orderRepeat";

function buildPaymentUrl(order: Order): string | null {
  const link = order.paymentLink;
  if (!link) return null;

  const amount = Math.round(order.total ?? order.totalAmount ?? 0);
  const orderNumber = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const comment =
    order.orderType === "Delivery"
      ? `Заказ № ${orderNumber} Доставка`
      : `Заказ № ${orderNumber} Самовывоз`;
  const encodedComment = encodeURIComponent(comment);

  let final = link;
  if (final.includes("{amount}")) {
    final = final.replace("{amount}", String(amount));
  } else if (final.includes("s=&")) {
    final = final.replace("s=&", `s=${amount}&`);
  } else if (final.endsWith("s=")) {
    final = final + String(amount);
  }
  if (final.includes("{comment}")) {
    final = final.replace("{comment}", encodedComment);
  } else if (final.includes("c=&")) {
    final = final.replace("c=&", `c=${encodedComment}&`);
  } else if (final.endsWith("c=")) {
    final = final + encodedComment;
  }
  return final;
}

export function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const status = normalizeOrderStatus(order.status as unknown as number | string);

  const isFinal = status === OrderStatus.Completed || status === OrderStatus.Cancelled;
  const needsPayment = status === OrderStatus.WaitingPayment;

  const onRepeat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dest = repeatOrder(order);
    router.push(dest);
  };

  const onPay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = buildPaymentUrl(order);
    if (url) window.location.href = url;
  };

  if (needsPayment) {
    return (
      <div className="mt-3 flex gap-2">
        <Button size="sm" fullWidth onClick={onPay} disabled={!order.paymentLink}>
          Оплатить
        </Button>
      </div>
    );
  }

  if (isFinal) {
    return (
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="ghost" fullWidth onClick={onRepeat}>
          Повторить заказ
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-2">
      <Link href={`/orders/${order.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="outline" fullWidth>
          Статус заказа
        </Button>
      </Link>
    </div>
  );
}
