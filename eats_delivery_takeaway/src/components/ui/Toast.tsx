"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";
import { Icon } from "./Icon";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

type ShowArg = string | { message: string; type?: ToastType };

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  show: (arg: ShowArg, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const colors: Record<ToastType, string> = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  };
  const icons: Record<ToastType, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  return (
    <ToastContext.Provider value={{
      showToast,
      show: (arg: ShowArg, type?: ToastType) => {
        if (typeof arg === "string") showToast(arg, type);
        else showToast(arg.message, arg.type);
      },
    }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${colors[t.type]} flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-slide-up pointer-events-auto min-w-[200px] max-w-[90vw]`}
            onClick={() => remove(t.id)}
          >
            <Icon name={icons[t.type]} size={20} />
            <span className="font-medium text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
