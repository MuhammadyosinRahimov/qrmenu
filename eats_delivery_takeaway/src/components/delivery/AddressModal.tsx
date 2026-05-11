"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { SavedAddressList } from "./SavedAddressList";
import { TariffSelector } from "./TariffSelector";
import { DeliveryCostBox } from "./DeliveryCostBox";
import { useUIStore } from "@/stores/uiStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useAuthStore } from "@/stores/authStore";
import { useGeolocationStore } from "@/stores/geolocationStore";
import { calculateDelivery } from "@/lib/api";
import { normalizePhoneForApi } from "@/lib/format";
import type { JuraAddress } from "@/types/jura";

export function AddressModal() {
  const isOpen = useUIStore((s) => s.addressModalOpen);
  const close = useUIStore((s) => s.closeAddressModal);

  const setMode = useOrderModeStore((s) => s.setMode);
  const setAddress = useOrderModeStore((s) => s.setAddress);
  const setTariff = useOrderModeStore((s) => s.setTariff);
  const setDeliveryCalc = useOrderModeStore((s) => s.setDeliveryCalc);
  const savedTariffId = useOrderModeStore((s) => s.tariffId);
  const savedAddress = useOrderModeStore((s) => s.deliveryAddress);
  const phone = useAuthStore((s) => s.phone);

  const [text, setText] = useState(savedAddress ?? "");
  const [selected, setSelected] = useState<JuraAddress | null>(null);
  const [tariffId, setTariffId] = useState<number | null>(savedTariffId);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // Re-sync local state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setText(savedAddress ?? "");
      setTariffId(savedTariffId);
      setSelected(null);
      setPrice(null);
      setCalcError(null);
    }
  }, [isOpen, savedAddress, savedTariffId]);

  // Ensure we're in delivery mode and have a geolocation request kicked off
  useEffect(() => {
    if (!isOpen) return;
    setMode("delivery");
    const geo = useGeolocationStore.getState();
    if (!geo.lat || !geo.lng) {
      geo.request().catch(() => {});
    }
  }, [isOpen, setMode]);

  // Recalculate delivery cost
  useEffect(() => {
    if (!isOpen || !selected || !tariffId) return;
    let cancelled = false;
    const run = async () => {
      setCalcLoading(true);
      setCalcError(null);
      try {
        const res = await calculateDelivery({
          tariffId,
          phone: normalizePhoneForApi(phone ?? ""),
          toAddress: {
            lat: selected.lat,
            lng: selected.lng,
            id: selected.id,
            address: selected.name,
          },
        });
        if (cancelled) return;
        if (res.success) {
          setPrice(res.price);
          setDistance(res.distance ?? null);
          setDuration(res.duration ?? null);
        } else {
          setCalcError(res.message || "Не удалось рассчитать стоимость");
          setPrice(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setCalcError(e instanceof Error ? e.message : "Ошибка расчёта");
          setPrice(null);
        }
      } finally {
        if (!cancelled) setCalcLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [isOpen, selected, tariffId, phone]);

  const canSave = !!selected && !!tariffId && price != null;

  const onSave = () => {
    if (!selected || !tariffId || price == null) return;
    setAddress({
      deliveryAddress: selected.name,
      juraAddressId: selected.id,
      lat: selected.lat ?? 0,
      lng: selected.lng ?? 0,
    });
    setTariff(tariffId);
    setDeliveryCalc(price, distance ?? undefined, duration ?? undefined);
    close();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={close} title="Адрес доставки" maxHeight="92vh">
      <div className="p-4 pb-24 space-y-4">
        <AddressAutocomplete
          value={text}
          onChange={setText}
          onSelect={(a) => {
            setSelected(a);
            setText(a.name);
          }}
        />

        <SavedAddressList
          onSelect={(a) => {
            setText(a.address);
            if (a.juraAddressId) {
              setSelected({
                id: a.juraAddressId,
                name: a.address,
                lat: a.lat ?? undefined,
                lng: a.lng ?? undefined,
              });
            }
          }}
        />

        <TariffSelector value={tariffId} onChange={setTariffId} />

        <DeliveryCostBox
          loading={calcLoading}
          error={calcError}
          price={price}
          distance={distance}
          duration={duration}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-border">
        <Button fullWidth disabled={!canSave} onClick={onSave}>
          Сохранить
        </Button>
      </div>
    </BottomSheet>
  );
}
