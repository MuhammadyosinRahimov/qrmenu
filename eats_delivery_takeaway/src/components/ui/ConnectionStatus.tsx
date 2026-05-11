"use client";

import { useEffect, useState } from "react";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(true);
      setTimeout(() => {
        setIsReconnecting(false);
        setShowBanner(false);
      }, 2000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (!navigator.onLine) setShowBanner(true);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
          <span className="font-medium text-sm">Нет подключения к интернету</span>
        </div>
      )}
      {isOnline && isReconnecting && (
        <div className="bg-green-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
          <span className="font-medium text-sm">Подключение восстановлено</span>
        </div>
      )}
    </div>
  );
}
