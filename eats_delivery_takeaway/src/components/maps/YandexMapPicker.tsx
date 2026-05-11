"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { loadYandexMaps, type YMap } from "@/lib/yandexMapsLoader";

const DUSHANBE = { lat: 38.5598, lng: 68.787 };

interface Props {
  center?: { lat: number; lng: number };
  zoom?: number;
  onCenterChange: (lat: number, lng: number) => void;
}

export function YandexMapPicker({ center, zoom = 14, onCenterChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YMap | null>(null);
  const onCenterChangeRef = useRef(onCenterChange);
  onCenterChangeRef.current = onCenterChange;

  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const initialCenterRef = useRef(center ?? DUSHANBE);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || mapRef.current) return;

        const map = new ymaps.Map(
          el,
          {
            center: [initialCenterRef.current.lat, initialCenterRef.current.lng],
            zoom,
            controls: ["zoomControl"],
          },
          {
            suppressMapOpenBlock: true,
          }
        );

        map.events.add("actionbegin", () => setDragging(true));
        map.events.add("actionend", () => {
          setDragging(false);
          const c = map.getCenter();
          if (c) onCenterChangeRef.current(c[0], c[1]);
        });

        mapRef.current = map;
        setStatus("ready");

        // After the modal finishes its open animation the container size may
        // have changed (framer-motion scale 0.96 → 1). Yandex caches the
        // viewport at construction time and won't repaint until told to.
        // A single fitToViewport call right after animation duration covers
        // the common case without watching for resize indefinitely.
        setTimeout(() => {
          try {
            // @ts-expect-error — container.fitToViewport exists on YMaps v2
            map.container?.fitToViewport?.();
          } catch {
            /* ignore */
          }
        }, 350);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch {
          /* ignore */
        }
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External center updates (search / geolocate)
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !center) return;
    const c = mapRef.current.getCenter();
    if (
      !c ||
      Math.abs(c[0] - center.lat) > 1e-5 ||
      Math.abs(c[1] - center.lng) > 1e-5
    ) {
      mapRef.current.panTo([center.lat, center.lng], { flying: true }).catch(() => {});
    }
  }, [status, center?.lat, center?.lng]);

  const overlay = (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <motion.div
        className="relative flex flex-col items-center"
        animate={{ y: dragging ? -14 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.6 }}
        style={{ willChange: "transform" }}
      >
        <div className="relative w-11 h-11 rounded-full bg-primary flex items-center justify-center ring-[3px] ring-white shadow-[0_10px_24px_-6px_rgba(0,0,0,0.35)]">
          <span
            className="material-symbols-rounded text-white"
            style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}
          >
            place
          </span>
        </div>
        <div className="-mt-1 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]" />
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/35 blur-[3px]"
          animate={{
            width: dragging ? 14 : 18,
            height: dragging ? 4 : 6,
            opacity: dragging ? 0.3 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        />
      </motion.div>
    </div>
  );

  return (
    <div className="relative w-full h-full" style={{ minHeight: 320 }}>
      <div
        ref={containerRef}
        className="bg-gray-100"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-muted">
          Загрузка карты...
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100 text-sm text-red-600 px-6 text-center">
          <span className="font-semibold">Карта недоступна</span>
          <span className="text-xs text-muted leading-relaxed">
            Не удалось загрузить скрипт Яндекс.Карт. Проверьте интернет и NEXT_PUBLIC_YANDEX_MAPS_API_KEY.
          </span>
        </div>
      )}
      {status === "ready" && overlay}
    </div>
  );
}
