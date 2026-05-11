import { JuraStatusNames, mapJuraToOrderStatus } from "@/types/jura";
import type { OrderStatus } from "@/types/enums";

export const isTrackingActive = (juraStatusId: number | null | undefined): boolean => {
  if (juraStatusId == null) return false;
  return juraStatusId >= 2 && juraStatusId <= 9;
};

export const juraStatusColor = (id: number | null | undefined): string => {
  if (id == null) return "bg-gray-100 text-gray-600";
  if (id === 10) return "bg-red-100 text-red-600";
  if (id === 9) return "bg-green-100 text-green-700";
  if (id === 7) return "bg-blue-100 text-blue-700";
  if (id >= 2) return "bg-secondary-light text-secondary-dark";
  return "bg-gray-100 text-gray-600";
};

export const juraStatusLabel = (id: number | null | undefined): string => {
  if (id == null) return "";
  return JuraStatusNames[id] ?? `Статус ${id}`;
};

export const resolveOrderStatusFromJura = (
  baseStatus: OrderStatus,
  juraStatusId: number | null | undefined
): OrderStatus => {
  if (juraStatusId == null) return baseStatus;
  return mapJuraToOrderStatus(juraStatusId) as OrderStatus;
};
