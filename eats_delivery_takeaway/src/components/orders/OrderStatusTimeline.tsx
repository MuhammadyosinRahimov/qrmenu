"use client";

import { OrderStatus, orderStatusLabel } from "@/types/enums";
import { Icon } from "@/components/ui/Icon";

const DELIVERY_FLOW: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Cooking,
  OrderStatus.DeliveryJura,
  OrderStatus.OnRoute,
  OrderStatus.Completed,
];

const TAKEAWAY_FLOW: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Cooking,
  OrderStatus.Ready,
  OrderStatus.Completed,
];

// Map non-flow statuses to the closest visible step on the timeline.
function mapStatusToFlow(status: OrderStatus, flow: OrderStatus[]): OrderStatus {
  if (flow.includes(status)) return status;
  switch (status) {
    case "Confirmed":
    case "WaitingPayment":
      return OrderStatus.Pending;
    case "Preparing":
      return OrderStatus.Cooking;
    default:
      return status;
  }
}

export function OrderStatusTimeline({
  current,
  mode,
}: {
  current: OrderStatus;
  mode: "delivery" | "takeaway";
}) {
  const flow = mode === "delivery" ? DELIVERY_FLOW : TAKEAWAY_FLOW;

  if (current === OrderStatus.Cancelled) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3">
        <Icon name="close" size={20} className="text-red-500" />
        <span className="text-sm font-medium text-red-600">Заказ отменён</span>
      </div>
    );
  }

  const mappedCurrent = mapStatusToFlow(current, flow);
  const currentIdx = flow.indexOf(mappedCurrent);

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <ol className="space-y-3">
        {flow.map((s, i) => {
          const done = currentIdx >= i;
          const active = currentIdx === i;
          return (
            <li key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition ${
                  done ? "bg-primary text-white" : "bg-gray-100 text-muted"
                } ${active ? "ring-4 ring-primary/20" : ""}`}
              >
                {done && !active ? (
                  <Icon name="success" size={18} />
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  active ? "font-semibold text-primary" : done ? "text-foreground" : "text-muted"
                }`}
              >
                {orderStatusLabel(s)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
