"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";

// Legacy deep link — opens the address modal and sends the user to the home page.
export default function DeliveryAddressPage() {
  const router = useRouter();
  const openAddressModal = useUIStore((s) => s.openAddressModal);

  useEffect(() => {
    openAddressModal();
    router.replace("/");
  }, [openAddressModal, router]);

  return null;
}
