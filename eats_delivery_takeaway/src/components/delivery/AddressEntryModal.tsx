"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { MapPickerModal } from "@/components/delivery/MapPickerModal";
import { getCustomerAddresses, getMyOrders } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useGeolocationStore } from "@/stores/geolocationStore";
import { reverseGeocode } from "@/lib/geocoding";
import type { UserAddress } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddressEntryModal({ isOpen, onClose }: Props) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const setAddress = useOrderModeStore((s) => s.setAddress);
  const setMode = useOrderModeStore((s) => s.setMode);
  const geo = useGeolocationStore();

  const [pickerOpen, setPickerOpen] = useState(false);

  const savedQuery = useQuery({
    queryKey: ["customer-addresses"],
    queryFn: getCustomerAddresses,
    enabled: isAuth && isOpen,
  });

  const recentQuery = useQuery({
    queryKey: ["recent-order-addresses"],
    queryFn: () => getMyOrders("history"),
    enabled: isAuth && isOpen,
  });

  const recents = (recentQuery.data ?? [])
    .map((o) => ({
      address: o.deliveryAddress,
      lat: o.addressLat ?? null,
      lng: o.addressLng ?? null,
    }))
    .filter((r): r is { address: string; lat: number | null; lng: number | null } =>
      Boolean(r.address)
    )
    .filter(
      (r, i, arr) => arr.findIndex((x) => x.address === r.address) === i
    )
    .slice(0, 5);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const useSaved = (a: UserAddress) => {
    setMode("delivery");
    setAddress({
      deliveryAddress: a.address,
      lat: a.lat,
      lng: a.lng,
      juraAddressId: a.juraAddressId ?? null,
    });
    onClose();
  };

  const useRecent = (r: { address: string; lat: number | null; lng: number | null }) => {
    // If the historic order had no coordinates, send the user to the map
    // picker so they can re-select the point — otherwise Jura cannot route
    // and we'd save (0,0) which means "Gulf of Guinea".
    if (r.lat == null || r.lng == null) {
      setPickerOpen(true);
      return;
    }
    setMode("delivery");
    setAddress({
      deliveryAddress: r.address,
      lat: r.lat,
      lng: r.lng,
      juraAddressId: null,
    });
    onClose();
  };

  const useGeoLocation = async () => {
    const pos = await geo.request();
    if (!pos) return;
    const addr = await reverseGeocode(pos.lat, pos.lng);
    setMode("delivery");
    setAddress({
      deliveryAddress: addr ?? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`,
      lat: pos.lat,
      lng: pos.lng,
      juraAddressId: null,
    });
    onClose();
  };

  if (typeof window === "undefined") return null;

  const tree = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
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

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full h-12 rounded-full bg-cta text-cta-foreground font-bold hover:bg-cta-dark active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <Icon name="location" size={18} />
                <span>Выбрать адрес на карте</span>
              </button>

              <section>
                <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">
                  Мои адреса
                </div>
                {!isAuth ? (
                  <p className="text-sm text-muted">
                    Войдите, чтобы видеть сохранённые адреса
                  </p>
                ) : savedQuery.isLoading ? (
                  <p className="text-sm text-muted">Загрузка…</p>
                ) : (savedQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted">
                    Пока пусто — нажмите «Добавить адрес» ниже или сохраните в профиле
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {savedQuery.data!.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => useSaved(a)}
                          className="w-full text-left px-4 py-2.5 rounded-2xl border border-border bg-white hover:bg-gray-50 flex items-start gap-2"
                        >
                          <Icon name="location" size={18} className="text-muted mt-0.5" />
                          <div className="flex-1 min-w-0">
                            {a.label && (
                              <div className="text-sm font-semibold">{a.label}</div>
                            )}
                            <div className="text-sm truncate">{a.address}</div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  <Icon name="add" size={16} />
                  Добавить адрес
                </button>
              </section>

              <section>
                <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">
                  Недавние
                </div>
                {!isAuth ? (
                  <p className="text-sm text-muted">
                    Адреса из ваших последних заказов появятся здесь
                  </p>
                ) : recentQuery.isLoading ? (
                  <p className="text-sm text-muted">Загрузка…</p>
                ) : recents.length === 0 ? (
                  <p className="text-sm text-muted">
                    Адреса из ваших последних заказов появятся здесь
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {recents.map((r, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => useRecent(r)}
                          className="w-full text-left px-4 py-2.5 rounded-2xl border border-border bg-white hover:bg-gray-50 flex items-start gap-2"
                        >
                          <Icon name="history" size={18} className="text-muted mt-0.5" />
                          <span className="text-sm flex-1 truncate">{r.address}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <button
                type="button"
                onClick={useGeoLocation}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary py-2"
              >
                <Icon name="near_me" size={18} />
                Определить моё местоположение
              </button>
            </div>
          </motion.div>

          <MapPickerModal
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSaved={() => {
              setPickerOpen(false);
              onClose();
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(tree, document.body);
}
