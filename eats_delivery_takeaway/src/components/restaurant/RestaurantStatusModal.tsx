"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function RestaurantStatusModal({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} maxHeight="40vh">
      <div className="px-6 py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-3">
          <Icon name="error" size={36} />
        </div>
        <h3 className="text-lg font-semibold">Ресторан временно не принимает заказы</h3>
        {message && <p className="text-sm text-muted mt-2">{message}</p>}
        <Button onClick={onClose} className="mt-4" fullWidth>
          Понятно
        </Button>
      </div>
    </BottomSheet>
  );
}
