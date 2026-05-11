export type OrderMode = "delivery" | "takeaway";

export type OrderType = "DineIn" | "Delivery" | "Takeaway";

export const OrderTypeMap: Record<number, OrderType> = {
  0: "DineIn",
  1: "Delivery",
  2: "Takeaway",
};

export const normalizeOrderType = (type: number | string): OrderType => {
  if (typeof type === "number") return OrderTypeMap[type] || "DineIn";
  return type as OrderType;
};

// Matches backend QrMenu.Core/Enums/OrderStatus.cs
// Exposed as both a const object (for value usage) and a string-literal type.
export const OrderStatus = {
  Pending: "Pending",           // 0
  Confirmed: "Confirmed",       // 1
  Preparing: "Preparing",       // 2
  Cancelled: "Cancelled",       // 3
  DeliveryJura: "DeliveryJura", // 4
  Cooking: "Cooking",           // 5
  WaitingPayment: "WaitingPayment", // 6
  Ready: "Ready",               // 7
  OnRoute: "OnRoute",           // 8
  Completed: "Completed",       // 9
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const OrderStatusMap: Record<number, OrderStatus> = {
  0: "Pending",
  1: "Confirmed",
  2: "Preparing",
  3: "Cancelled",
  4: "DeliveryJura",
  5: "Cooking",
  6: "WaitingPayment",
  7: "Ready",
  8: "OnRoute",
  9: "Completed",
};

export const OrderStatusCodeMap: Record<OrderStatus, number> = {
  Pending: 0,
  Confirmed: 1,
  Preparing: 2,
  Cancelled: 3,
  DeliveryJura: 4,
  Cooking: 5,
  WaitingPayment: 6,
  Ready: 7,
  OnRoute: 8,
  Completed: 9,
};

export const normalizeOrderStatus = (status: number | string): OrderStatus => {
  if (typeof status === "number") return OrderStatusMap[status] || "Pending";
  return status as OrderStatus;
};

export const orderStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case "Pending": return "Ожидает подтверждения";
    case "Confirmed": return "Подтверждён";
    case "Preparing":
    case "Cooking": return "Готовится";
    case "WaitingPayment": return "Ожидает оплаты";
    case "Ready": return "Готов";
    case "DeliveryJura": return "Передан курьеру";
    case "OnRoute": return "В пути";
    case "Completed": return "Доставлен";
    case "Cancelled": return "Отменён";
    default: return String(status);
  }
};

export const PaymentMethod = {
  card: "card",
  cash: "cash",
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const paymentMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case "card": return "Банковская карта";
    case "cash": return "Наличные";
  }
};

export const OrderItemStatus = {
  Pending: "Pending",
  Active: "Active",
  Cancelled: "Cancelled",
} as const;
export type OrderItemStatus = typeof OrderItemStatus[keyof typeof OrderItemStatus];

export const OrderItemStatusMap: Record<number, OrderItemStatus> = {
  0: "Pending",
  1: "Active",
  2: "Cancelled",
};

export const normalizeItemStatus = (status: number | string): OrderItemStatus => {
  if (typeof status === "number") return OrderItemStatusMap[status] || "Active";
  return status as OrderItemStatus;
};
