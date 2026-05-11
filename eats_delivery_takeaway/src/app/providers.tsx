"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { SignalRProvider } from "@/components/SignalRProvider";
import { AddressModal } from "@/components/delivery/AddressModal";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 min — restaurants/categories/menus rarely change; within this window
            // navigation reuses cached data instead of re-fetching, so soft routing
            // feels instant. Queries that need fresh data (orders, statuses) opt-out
            // via their own staleTime: 0 or refetchInterval.
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SignalRProvider>
          {children}
          <AddressModal />
        </SignalRProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
