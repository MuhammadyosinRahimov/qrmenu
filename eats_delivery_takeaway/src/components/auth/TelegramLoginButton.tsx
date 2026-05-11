"use client";

import { useEffect, useRef, useState } from "react";
import { getTelegramConfig } from "@/lib/api";
import type { TelegramAuthPayload } from "@/types";

interface Props {
  onAuth: (payload: TelegramAuthPayload) => void;
  size?: "large" | "medium" | "small";
  cornerRadius?: number;
  requestAccess?: boolean;
}

declare global {
  interface Window {
    __qrTelegramAuth__?: (user: TelegramAuthPayload) => void;
  }
}

export function TelegramLoginButton({
  onAuth,
  size = "large",
  cornerRadius = 12,
  requestAccess = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTelegramConfig()
      .then((cfg) => {
        if (cancelled) return;
        setEnabled(cfg.enabled);
        setBotUsername(cfg.botUsername ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setEnabled(false);
        setError("Telegram-вход недоступен");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !botUsername || !containerRef.current) return;

    // Expose global callback for the widget
    window.__qrTelegramAuth__ = (user) => {
      try {
        onAuth(user);
      } catch (e) {
        console.error("Telegram onAuth handler failed", e);
      }
    };

    // Clean any previous widget script
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", size);
    script.setAttribute("data-radius", String(cornerRadius));
    script.setAttribute("data-onauth", "__qrTelegramAuth__(user)");
    if (requestAccess) script.setAttribute("data-request-access", "write");

    containerRef.current.appendChild(script);

    return () => {
      // Don't unset window.__qrTelegramAuth__ — widget may fire after unmount
    };
  }, [enabled, botUsername, size, cornerRadius, requestAccess, onAuth]);

  if (enabled === null) {
    return <div className="h-10 w-full animate-pulse rounded-xl bg-surface-2" />;
  }
  if (!enabled) {
    return (
      <div className="text-center text-xs text-text-secondary">
        {error ?? "Telegram-вход не настроен"}
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}
