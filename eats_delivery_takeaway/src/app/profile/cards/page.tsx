"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CardEditor } from "@/components/profile/CardEditor";
import { getCustomerCards, createCustomerCard, deleteCustomerCard } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function CardsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data } = useQuery({ queryKey: ["customer-cards"], queryFn: getCustomerCards });
  const [open, setOpen] = useState(false);

  const createMut = useMutation({
    mutationFn: createCustomerCard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-cards"] });
      setOpen(false);
      toast.show({ type: "success", message: "Карта добавлена" });
    },
    onError: (e: unknown) => toast.show({ type: "error", message: e instanceof Error ? e.message : "Ошибка" }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCustomerCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-cards"] }),
  });

  return (
    <div className="min-h-dvh bg-surface pb-24">
      <Header title="Банковские карты" />

      <div className="p-4 space-y-3">
        {data?.length === 0 && (
          <div className="text-center py-12 text-sm text-muted">Карт пока нет</div>
        )}
        {data?.map((c) => (
          <div key={c.id} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-dark/10 text-primary-dark flex items-center justify-center">
              <Icon name="card" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">•••• {c.last4}</div>
              {c.expiryDate && <div className="text-xs text-muted">{c.expiryDate}</div>}
            </div>
            <button
              onClick={() => deleteMut.mutate(c.id)}
              className="text-muted hover:text-red-500 p-2"
              aria-label="Удалить"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-0 right-0 px-4">
        <Button fullWidth onClick={() => setOpen(true)}>
          <Icon name="plus" size={18} className="mr-2" />
          Добавить карту
        </Button>
      </div>

      <CardEditor
        isOpen={open}
        onClose={() => setOpen(false)}
        saving={createMut.isPending}
        onSave={(d) => createMut.mutate(d)}
      />
    </div>
  );
}
