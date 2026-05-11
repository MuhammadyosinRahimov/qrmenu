"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AddressEditor } from "@/components/profile/AddressEditor";
import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/api";
import type { UserAddress } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function AddressesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data } = useQuery({ queryKey: ["customer-addresses"], queryFn: getCustomerAddresses });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<UserAddress | null>(null);

  const saveMut = useMutation({
    mutationFn: async (a: Partial<UserAddress>) => {
      if (a.id) return updateCustomerAddress(a.id, a);
      return createCustomerAddress(a);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
      setEditorOpen(false);
      setEditing(null);
      toast.show({ type: "success", message: "Адрес сохранён" });
    },
    onError: (e: unknown) => {
      toast.show({ type: "error", message: e instanceof Error ? e.message : "Ошибка" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCustomerAddress,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-addresses"] }),
  });

  return (
    <div className="min-h-dvh bg-surface pb-24">
      <Header title="Мои адреса" />

      <div className="p-4 space-y-3">
        {data?.length === 0 && (
          <div className="text-center py-12 text-sm text-muted">Адресов пока нет</div>
        )}
        {data?.map((a) => (
          <div key={a.id} className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Icon name="location" size={18} className="text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                {a.label && <div className="text-sm font-semibold">{a.label}</div>}
                <div className="text-sm">{a.address}</div>
                {(a.entrance || a.apartment || a.floor) && (
                  <div className="text-xs text-muted mt-0.5">
                    {a.entrance && `подъезд ${a.entrance} `}
                    {a.floor && `этаж ${a.floor} `}
                    {a.apartment && `кв. ${a.apartment}`}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(a);
                  setEditorOpen(true);
                }}
              >
                Редактировать
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(a.id)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-0 right-0 px-4">
        <Button
          fullWidth
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <Icon name="plus" size={18} className="mr-2" />
          Добавить адрес
        </Button>
      </div>

      <AddressEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editing}
        saving={saveMut.isPending}
        onSave={(a) => saveMut.mutate(a)}
      />
    </div>
  );
}
