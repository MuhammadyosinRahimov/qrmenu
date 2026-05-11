"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AddressAutocomplete } from "@/components/delivery/AddressAutocomplete";
import type { UserAddress } from "@/types";
import type { JuraAddress } from "@/types/jura";

export function AddressEditor({
  isOpen,
  onClose,
  onSave,
  initial,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (a: Partial<UserAddress>) => void;
  initial?: UserAddress | null;
  saving?: boolean;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [entrance, setEntrance] = useState(initial?.entrance ?? "");
  const [apartment, setApartment] = useState(initial?.apartment ?? "");
  const [floor, setFloor] = useState(initial?.floor ?? "");
  const [juraAddressId, setJuraAddressId] = useState(initial?.juraAddressId ?? null);
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null);

  const onSelectJura = (a: JuraAddress) => {
    setAddress(a.name);
    setJuraAddressId(a.id);
    setLat(a.lat ?? null);
    setLng(a.lng ?? null);
  };

  const canSave = address.trim().length > 2;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={initial ? "Редактировать адрес" : "Новый адрес"}>
      <div className="p-4 space-y-3">
        <Input label="Название (например, Дом, Работа)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <AddressAutocomplete value={address} onChange={setAddress} onSelect={onSelectJura} />
        <div className="grid grid-cols-3 gap-2">
          <Input label="Подъезд" value={entrance} onChange={(e) => setEntrance(e.target.value)} />
          <Input label="Этаж" value={floor} onChange={(e) => setFloor(e.target.value)} />
          <Input label="Кв." value={apartment} onChange={(e) => setApartment(e.target.value)} />
        </div>
        <Button
          fullWidth
          disabled={!canSave}
          isLoading={saving}
          onClick={() =>
            onSave({
              id: initial?.id,
              label: label.trim() || undefined,
              address: address.trim(),
              entrance: entrance.trim() || undefined,
              apartment: apartment.trim() || undefined,
              floor: floor.trim() || undefined,
              juraAddressId: juraAddressId ?? undefined,
              lat: lat ?? undefined,
              lng: lng ?? undefined,
            })
          }
        >
          Сохранить
        </Button>
      </div>
    </BottomSheet>
  );
}
