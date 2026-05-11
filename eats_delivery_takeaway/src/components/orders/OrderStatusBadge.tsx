"use client";

import { OrderStatus, orderStatusLabel } from "@/types/enums";

const STYLES: Record<OrderStatus, string> = {
  Pending: "bg-primary-50 text-primary-700",
  Confirmed: "bg-primary-50 text-primary-700",
  Preparing: "bg-amber-50 text-amber-700",
  Cooking: "bg-amber-50 text-amber-700",
  WaitingPayment: "bg-yellow-50 text-yellow-800",
  Ready: "bg-blue-50 text-blue-700",
  DeliveryJura: "bg-blue-50 text-blue-700",
  OnRoute: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cls = STYLES[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${cls}`}>
      {orderStatusLabel(status)}
    </span>
  );
}
