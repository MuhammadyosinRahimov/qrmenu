"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { DriverCard } from "@/components/orders/DriverCard";
import { JuraStatusBadge } from "@/components/orders/JuraStatusBadge";
import { getOrder } from "@/lib/api";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useDriverPosition } from "@/hooks/useDriverPosition";
import { useJuraStore } from "@/stores/juraStore";

const DriverMap = dynamic(() => import("@/components/orders/DriverMap").then((m) => m.DriverMap), {
  ssr: false,
  loading: () => <div className="w-full h-72 rounded-2xl bg-gray-100 animate-pulse" />,
});

export default function TrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    refetchInterval: 15000,
  });

  useOrderTracking(orderId);
  useDriverPosition(orderId, order?.juraStatusId ?? null);

  const driverLat = useJuraStore((s) => s.driverLat);
  const driverLng = useJuraStore((s) => s.driverLng);

  const restaurant = order?.restaurantLat && order?.restaurantLng
    ? { lat: order.restaurantLat, lng: order.restaurantLng, label: order.restaurantName }
    : null;
  const customer = order?.addressLat && order?.addressLng
    ? { lat: order.addressLat, lng: order.addressLng, label: "Адрес" }
    : null;

  const driverLatResolved = driverLat ?? order?.driverLat ?? null;
  const driverLngResolved = driverLng ?? order?.driverLng ?? null;
  const driver = driverLatResolved != null && driverLngResolved != null
    ? { lat: driverLatResolved, lng: driverLngResolved, label: "Курьер" }
    : null;

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <Header title="Отслеживание" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Статус доставки</span>
          <JuraStatusBadge juraStatusId={order?.juraStatusId ?? null} />
        </div>

        <DriverMap restaurant={restaurant} customer={customer} driver={driver} />

        <DriverCard name={order?.performerName} phone={order?.performerPhone} eta={order?.eta} />

        {!driver && (
          <div className="text-center text-sm text-muted py-2">
            Позиция курьера появится после назначения
          </div>
        )}
      </div>
    </div>
  );
}
