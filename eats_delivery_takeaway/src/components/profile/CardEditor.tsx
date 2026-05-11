"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CardEditor({
  isOpen,
  onClose,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: { cardNumber: string; holderName: string; expiryDate: string }) => void;
  saving?: boolean;
}) {
  const [num, setNum] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");

  const canSave = num.replace(/\D/g, "").length >= 12 && holder.length > 2 && /^\d{2}\/\d{2}$/.test(expiry);

  const formatNum = (v: string) => v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Новая карта">
      <div className="p-4 space-y-3">
        <Input
          label="Номер карты"
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          value={formatNum(num)}
          onChange={(e) => setNum(e.target.value)}
        />
        <Input label="Имя держателя" placeholder="IVAN IVANOV" value={holder} onChange={(e) => setHolder(e.target.value.toUpperCase())} />
        <Input
          label="Срок действия"
          placeholder="MM/YY"
          inputMode="numeric"
          value={formatExp(expiry)}
          onChange={(e) => setExpiry(e.target.value)}
        />
        <Button
          fullWidth
          disabled={!canSave}
          isLoading={saving}
          onClick={() =>
            onSave({ cardNumber: num.replace(/\s/g, ""), holderName: holder, expiryDate: expiry })
          }
        >
          Сохранить карту
        </Button>
        <p className="text-xs text-muted text-center">
          Данные карты передаются в защищённый платёжный шлюз
        </p>
      </div>
    </BottomSheet>
  );
}
