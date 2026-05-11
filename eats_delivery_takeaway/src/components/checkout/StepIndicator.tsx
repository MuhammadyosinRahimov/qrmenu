"use client";

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const active = idx <= current;
        return (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              active ? "bg-primary" : "bg-gray-200"
            }`}
          />
        );
      })}
    </div>
  );
}
