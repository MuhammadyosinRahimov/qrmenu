"use client";

import Link from "next/link";
import type { Order } from "@/types";
import { OrderStatus, normalizeOrderStatus, orderStatusLabel } from "@/types/enums";
import { formatTJS, formatDateTime } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { OrderActions } from "./OrderActions";

type StatusStyle = {
  gradient: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  text: string;
};

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  Pending: {
    gradient: "from-primary-light to-primary-50",
    iconBg: "bg-primary-50",
    iconColor: "text-primary-dark",
    icon: "clock",
    text: "text-primary-dark",
  },
  Confirmed: {
    gradient: "from-green-50 to-emerald-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    icon: "check",
    text: "text-green-700",
  },
  Preparing: {
    gradient: "from-amber-50 to-yellow-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    icon: "clock",
    text: "text-amber-700",
  },
  Cooking: {
    gradient: "from-amber-50 to-yellow-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    icon: "clock",
    text: "text-amber-700",
  },
  WaitingPayment: {
    gradient: "from-yellow-50 to-amber-50",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-800",
    icon: "payments",
    text: "text-yellow-800",
  },
  Ready: {
    gradient: "from-blue-50 to-cyan-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    icon: "check",
    text: "text-blue-700",
  },
  DeliveryJura: {
    gradient: "from-indigo-50 to-blue-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    icon: "delivery",
    text: "text-indigo-700",
  },
  OnRoute: {
    gradient: "from-indigo-50 to-blue-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    icon: "delivery",
    text: "text-indigo-700",
  },
  Completed: {
    gradient: "from-emerald-50 to-green-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    icon: "check",
    text: "text-emerald-700",
  },
  Cancelled: {
    gradient: "from-red-50 to-rose-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
    icon: "close",
    text: "text-red-700",
  },
};

const TYPE_VISUALS: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  Delivery: { bg: "bg-purple-100", text: "text-purple-600", icon: "delivery", label: "Доставка" },
  Takeaway: { bg: "bg-emerald-100", text: "text-emerald-600", icon: "takeaway", label: "Самовывоз" },
  DineIn: { bg: "bg-primary-light", text: "text-primary", icon: "restaurant", label: "В зале" },
};

export function OrderCard({ order }: { order: Order }) {
  const status = normalizeOrderStatus(order.status as unknown as number | string);
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  const typeVisual = TYPE_VISUALS[order.orderType] ?? TYPE_VISUALS.DineIn;
  const total = order.total ?? order.totalAmount ?? 0;
  const subtotal = order.subtotal ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const itemsPreview = order.items?.slice(0, 3) ?? [];
  const moreCount = (order.items?.length ?? 0) - itemsPreview.length;
  const orderNumber = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/orders/${order.id}`} className="block">
        {/* Status header */}
        <div className={`bg-gradient-to-r ${style.gradient} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <Icon name={style.icon} size={16} className={style.iconColor} />
            </div>
            <span className={`font-medium text-sm ${style.text}`}>
              {orderStatusLabel(status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {order.juraStatusName && (
              <Badge variant="info" size="sm">
                {order.juraStatusName}
              </Badge>
            )}
            {order.isPaid && <Badge variant="success" size="sm">Оплачен</Badge>}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl ${typeVisual.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={typeVisual.icon} size={20} className={typeVisual.text} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {order.restaurantName ?? "Заказ"}
                </div>
                <div className="text-xs text-primary truncate">
                  № {orderNumber} · {typeVisual.label}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              {formatDateTime(order.createdAt)}
            </div>
          </div>

          {order.orderType === "Delivery" && order.deliveryAddress && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 rounded-lg p-2">
              <Icon name="location" size={16} className="text-purple-500 flex-shrink-0" />
              <span className="truncate">{order.deliveryAddress}</span>
            </div>
          )}

          {order.customerName && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon name="user" size={14} className="text-gray-400" />
              <span className="truncate">{order.customerName}</span>
            </div>
          )}

          {itemsPreview.length > 0 && (
            <div className="space-y-1">
              {itemsPreview.map((item) => {
                const cancelled = item.status === "Cancelled";
                return (
                  <div
                    key={item.id}
                    className={`flex justify-between text-sm ${cancelled ? "opacity-50 line-through" : ""}`}
                  >
                    <span className="text-gray-600 truncate pr-2">
                      {item.productName}{" "}
                      <span className="text-gray-400">×{item.quantity}</span>
                    </span>
                    <span className="text-gray-800 font-medium whitespace-nowrap">
                      {formatTJS(item.totalPrice)}
                    </span>
                  </div>
                );
              })}
              {moreCount > 0 && (
                <div className="text-sm text-gray-400">+{moreCount} ещё</div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 space-y-1">
            {deliveryFee > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Сумма</span>
                  <span>{formatTJS(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Доставка</span>
                    <span>{formatTJS(deliveryFee)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-gray-500">Итого</span>
              <span className="text-xl font-bold text-primary">{formatTJS(total)}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <OrderActions order={order} />
      </div>
    </div>
  );
}
