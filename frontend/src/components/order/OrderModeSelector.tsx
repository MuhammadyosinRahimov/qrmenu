"use client";

import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore, OrderMode } from "@/stores/orderModeStore";

interface OrderModeSelectorProps {
  onModeSelect?: (mode: OrderMode) => void;
}

const modes: { id: OrderMode; label: string; icon: string; description: string; gradient: string; shadowColor: string }[] = [
  {
    id: "delivery",
    label: "Доставка",
    icon: "delivery_dining",
    description: "Доставим к вам",
    gradient: "from-purple-500 to-indigo-600",
    shadowColor: "shadow-purple-200",
  },
  {
    id: "dinein",
    label: "В ресторане",
    icon: "restaurant",
    description: "За столиком",
    gradient: "from-orange-400 to-orange-500",
    shadowColor: "shadow-orange-200",
  },
  {
    id: "takeaway",
    label: "С собой",
    icon: "takeout_dining",
    description: "Заберу сам",
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-200",
  },
];

export function OrderModeSelector({ onModeSelect }: OrderModeSelectorProps) {
  const { mode, setMode } = useOrderModeStore();

  const handleModeSelect = (selectedMode: OrderMode) => {
    setMode(selectedMode);
    onModeSelect?.(selectedMode);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {modes.map((m) => {
          const isSelected = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${m.gradient} text-white shadow-lg ${m.shadowColor} scale-105`
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Icon name="check" size={12} className="text-green-500" />
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                isSelected
                  ? "bg-white/20"
                  : "bg-gradient-to-br from-gray-50 to-gray-100"
              }`}>
                <Icon
                  name={m.icon}
                  size={28}
                  className={isSelected ? "text-white" : "text-gray-500"}
                />
              </div>
              <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-800"}`}>
                {m.label}
              </span>
              <span className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                {m.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
