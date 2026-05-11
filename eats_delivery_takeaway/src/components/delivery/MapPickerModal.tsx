"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { YandexMapPicker } from "@/components/maps/YandexMapPicker";
import { useGeolocationStore } from "@/stores/geolocationStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { reverseGeocode, geocodeAddress } from "@/lib/geocoding";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const DUSHANBE = { lat: 38.5598, lng: 68.787 };

export function MapPickerModal({ isOpen, onClose, onSaved }: Props) {
  const setMode = useOrderModeStore((s) => s.setMode);
  const setAddress = useOrderModeStore((s) => s.setAddress);
  const savedAddress = useOrderModeStore((s) => s.deliveryAddress);
  const savedLat = useOrderModeStore((s) => s.addressLat);
  const savedLng = useOrderModeStore((s) => s.addressLng);
  const geo = useGeolocationStore();

  const [text, setText] = useState(savedAddress ?? "");
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    savedLat && savedLng ? { lat: savedLat, lng: savedLng } : DUSHANBE
  );
  const [pinAt, setPinAt] = useState<{ lat: number; lng: number }>(center);
  const [busy, setBusy] = useState(false);
  const skipReverseRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reverse geocode whenever the pin (map center) settles
  useEffect(() => {
    if (!isOpen) return;
    if (skipReverseRef.current) {
      skipReverseRef.current = false;
      return;
    }
    let cancelled = false;
    setBusy(true);
    reverseGeocode(pinAt.lat, pinAt.lng).then((addr) => {
      if (cancelled) return;
      setBusy(false);
      if (addr) setText(addr);
    });
    return () => {
      cancelled = true;
    };
  }, [pinAt, isOpen]);

  const handleLocate = async () => {
    const pos = await geo.request();
    if (pos) {
      setCenter({ lat: pos.lat, lng: pos.lng });
      setPinAt({ lat: pos.lat, lng: pos.lng });
    }
  };

  const handleSearchEnter = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const r = await geocodeAddress(text.trim());
    setBusy(false);
    if (r) {
      skipReverseRef.current = true;
      setText(r.formattedAddress);
      setCenter({ lat: r.lat, lng: r.lng });
      setPinAt({ lat: r.lat, lng: r.lng });
    }
  };

  const handleClear = () => setText("");

  const handleConfirm = () => {
    if (!text.trim()) return;
    setMode("delivery");
    setAddress({
      deliveryAddress: text.trim(),
      lat: pinAt.lat,
      lng: pinAt.lng,
      juraAddressId: null,
    });
    onSaved?.();
    onClose();
  };

  if (typeof window === "undefined") return null;

  const tree = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">Куда доставить заказ?</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="w-9 h-9 rounded-full hover:bg-gray-100 active:scale-95 flex items-center justify-center text-muted"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Search row */}
            <div className="px-5 pt-4 pb-3 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchEnter();
                  }}
                  placeholder="Введите адрес"
                  className="w-full h-11 pl-4 pr-10 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {text && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Очистить"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-muted"
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!text.trim() || busy}
                className="h-11 px-6 rounded-full bg-cta text-cta-foreground font-bold hover:bg-cta-dark active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ок
              </button>
            </div>

            {/* Locate row */}
            <button
              type="button"
              onClick={handleLocate}
              className="px-5 pb-2 flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <Icon name="near_me" size={18} />
              <span>Определить моё местоположение</span>
            </button>

            <p className="px-5 pb-3 text-xs text-muted">
              Передвигайте карту для выбора точки доставки или введите адрес выше
            </p>

            {/* Map */}
            <div
              className="bg-gray-100"
              style={{ height: "420px", minHeight: "320px" }}
            >
              <YandexMapPicker
                center={center}
                onCenterChange={(lat, lng) => setPinAt({ lat, lng })}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(tree, document.body);
}
