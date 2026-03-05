"use client";

import { useOrderModeStore, OrderMode } from "@/stores/orderModeStore";

interface OrderModeSelectorProps {
  onModeSelect?: (mode: OrderMode) => void;
}

const modes: { value: OrderMode; label: string }[] = [
  { value: "delivery", label: "Доставка" },
  { value: "dinein", label: "В ресторане" },
  { value: "takeaway", label: "С собой" },
];

export function OrderModeSelector({ onModeSelect }: OrderModeSelectorProps) {
  const { mode, setMode } = useOrderModeStore();

  // Если mode === "qr", показываем "dinein" как активный по умолчанию
  const displayMode = mode === "qr" ? "dinein" : mode;

  const handleModeSelect = (selectedMode: OrderMode) => {
    setMode(selectedMode);
    onModeSelect?.(selectedMode);
  };

  const activeIndex = modes.findIndex((m) => m.value === displayMode);

  return (
    <div className="flex justify-center">
      {/* Контейнер с border и rounded-2xl */}
      <div className="relative flex border border-gray-200 rounded-2xl p-1 bg-gray-50/50">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 bottom-1 bg-primary rounded-xl transition-all duration-300 ease-out"
          style={{
            width: `calc(${100 / modes.length}% - 4px)`,
            left: `calc(${(activeIndex * 100) / modes.length}% + 2px)`,
          }}
        />

        {/* Кнопки */}
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => handleModeSelect(m.value)}
            className={`relative z-10 flex-1 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
              displayMode === m.value
                ? "text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
