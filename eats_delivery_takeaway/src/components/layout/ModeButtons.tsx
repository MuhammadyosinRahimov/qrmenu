"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";
import type { OrderMode } from "@/types/enums";

interface ModeButtonsProps {
  className?: string;
}

const MODES: Array<{ value: OrderMode; label: string; icon: string }> = [
  { value: "delivery", label: "Доставка", icon: "delivery" },
  { value: "takeaway", label: "Самовывоз", icon: "takeaway" },
];

export function ModeButtons({ className = "" }: ModeButtonsProps) {
  const mode = useOrderModeStore((s) => s.mode);
  const setMode = useOrderModeStore((s) => s.setMode);

  return (
    <div
      role="tablist"
      className={`relative w-full grid grid-cols-2 bg-gray-100 rounded-full p-1 ${className}`}
    >
      {MODES.map((m) => {
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(m.value)}
            className="relative isolate flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-white border-2 border-primary shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                transition={{
                  type: "spring",
                  stiffness: 520,
                  damping: 38,
                  mass: 0.55,
                }}
              />
            )}
            <span
              className={`inline-flex items-center gap-2 transition-colors duration-200 ${
                active ? "text-primary" : "text-foreground/70"
              }`}
            >
              <Icon name={m.icon} size={18} />
              <span>{m.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
