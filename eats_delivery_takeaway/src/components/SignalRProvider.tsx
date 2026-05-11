"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import { connectSignalR, disconnectSignalR } from "@/lib/signalr";

export function SignalRProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const isAuth = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuth && token && userId) {
      connectSignalR(token, userId).catch(() => { /* noop */ });
    } else {
      disconnectSignalR().catch(() => { /* noop */ });
    }
  }, [isAuth, token, userId]);

  return <>{children}</>;
}
