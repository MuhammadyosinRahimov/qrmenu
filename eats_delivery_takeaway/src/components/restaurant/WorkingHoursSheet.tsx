"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import type { DaySchedule } from "@/lib/workingHours";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  weeklySchedule: DaySchedule[];
  rawString?: string | null;
}

function fmt(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Order: Mon ... Sun (todo: locale-aware would be nicer)
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function WorkingHoursSheet({ isOpen, onClose, weeklySchedule, rawString }: Props) {
  const today = new Date().getDay();
  const ordered = DISPLAY_ORDER
    .map((idx) => weeklySchedule.find((d) => d.dayIndex === idx))
    .filter((x): x is DaySchedule => !!x);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Часы работы" maxHeight="70vh">
      <div className="px-5 pb-6 space-y-2">
        {ordered.map((d) => {
          const isToday = d.dayIndex === today;
          const ranges =
            d.ranges.length > 0
              ? d.ranges
                  .slice()
                  .sort((a, b) => a.start - b.start)
                  .map((r) => `${fmt(r.start)} – ${fmt(r.end)}`)
                  .join(", ")
              : "Закрыто";
          return (
            <div
              key={d.dayIndex}
              className={[
                "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border",
                isToday
                  ? "bg-primary-50 border-primary/20"
                  : "bg-white border-border",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span className={isToday ? "font-semibold text-primary-dark" : "font-medium"}>
                  {d.label}
                </span>
                {isToday && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-semibold">
                    Сегодня
                  </span>
                )}
              </div>
              <span className={isToday ? "text-primary-dark font-medium" : "text-muted text-sm"}>
                {ranges}
              </span>
            </div>
          );
        })}

        {rawString && (
          <p className="text-[11px] text-muted text-center pt-2">{rawString}</p>
        )}
      </div>
    </BottomSheet>
  );
}
