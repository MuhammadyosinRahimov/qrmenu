"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { restaurantIcon, customerIcon, driverIcon, boundsFromPoints, DEFAULT_CENTER } from "@/lib/map";

type Pt = { lat: number; lng: number; label?: string };

function FitBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    const raw: Array<[number, number]> = points.map((p) => [p[0], p[1]]);
    const bounds = boundsFromPoints(raw);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export function DriverMap({
  restaurant,
  customer,
  driver,
  className,
}: {
  restaurant?: Pt | null;
  customer?: Pt | null;
  driver?: Pt | null;
  className?: string;
}) {
  const points = useMemo(() => {
    const arr: LatLngTuple[] = [];
    if (restaurant) arr.push([restaurant.lat, restaurant.lng]);
    if (customer) arr.push([customer.lat, customer.lng]);
    if (driver) arr.push([driver.lat, driver.lng]);
    return arr;
  }, [restaurant, customer, driver]);

  const initialCenter: LatLngTuple = points[0] ?? DEFAULT_CENTER;

  return (
    <div className={className ?? "relative w-full h-72 rounded-2xl overflow-hidden border border-border"}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurant && (
          <Marker position={[restaurant.lat, restaurant.lng]} icon={restaurantIcon}>
            <Popup>{restaurant.label ?? "Ресторан"}</Popup>
          </Marker>
        )}
        {customer && (
          <Marker position={[customer.lat, customer.lng]} icon={customerIcon}>
            <Popup>{customer.label ?? "Ваш адрес"}</Popup>
          </Marker>
        )}
        {driver && (
          <Marker position={[driver.lat, driver.lng]} icon={driverIcon}>
            <Popup>{driver.label ?? "Курьер"}</Popup>
          </Marker>
        )}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
