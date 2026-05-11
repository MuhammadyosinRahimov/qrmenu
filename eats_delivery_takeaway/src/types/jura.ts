export interface JuraAddress {
  id: string;
  name: string;
  lat: number;
  lng: number;
  divisionId?: number;
  fullAddress?: string;
}

export interface JuraTariff {
  id: number;
  name: string;
  description?: string;
  minPrice?: number;
  basePrice?: number;
  pricePerKm?: number;
}

export interface JuraDeliveryCalc {
  success: boolean;
  price: number;
  distance: number;
  duration: number;
  tariffId?: number;
  message?: string;
}

export interface JuraPosition {
  lat: number;
  lng: number;
  at: string;
  performerName?: string;
  performerPhone?: string;
  statusId?: number;
  statusName?: string;
}

// Matches JuraStatusNames
export const JuraStatusNames: Record<number, string> = {
  1: "Поступило",
  2: "Назначен",
  4: "На месте",
  7: "Исполняется",
  9: "Выполнен",
  10: "Отменён",
};

export const juraStatusLabel = (id: number | null | undefined): string => {
  if (id == null) return "";
  return JuraStatusNames[id] ?? `Статус ${id}`;
};

/**
 * Map Jura status → user-facing order status.
 */
export const mapJuraToOrderStatus = (juraStatusId: number): string => {
  if (juraStatusId === 9) return "Completed";
  if (juraStatusId === 10) return "Cancelled";
  if (juraStatusId === 7) return "OnRoute";
  if (juraStatusId >= 1 && juraStatusId <= 4) return "DeliveryJura";
  return "DeliveryJura";
};
