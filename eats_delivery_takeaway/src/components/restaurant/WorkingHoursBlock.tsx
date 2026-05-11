"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { parseWorkingHours } from "@/lib/workingHours";
import { WorkingHoursSheet } from "./WorkingHoursSheet";

interface Props {
  workingHours?: string | null;
  acceptingOrders?: boolean;
  pauseMessage?: string | null;
}

function findTodaysCurrentEnd(parsed: ReturnType<typeof parseWorkingHours>): number | null {
  const today = new Date().getDay();
  const minutesNow = new Date().getHours() * 60 + new Date().getMinutes();
  const day = parsed.weeklySchedule.find((d) => d.dayIndex === today);
  if (!day) return null;
  for (const r of day.ranges) {
    if (minutesNow >= r.start && minutesNow < r.end) return r.end;
  }
  return null;
}

function fmt(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function WorkingHoursBlock({ workingHours, acceptingOrders = true, pauseMessage }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseWorkingHours(workingHours);
  const isOpenNow = acceptingOrders && parsed.isOpenNow;
  const todaysEnd = isOpenNow ? findTodaysCurrentEnd(parsed) : null;

  let statusText: string;
  let statusClass: string;

  if (!acceptingOrders) {
    statusText = pauseMessage || "Ресторан временно не принимает заказы";
    statusClass = "text-danger";
  } else if (isOpenNow) {
    statusText = todaysEnd != null ? `Открыто до ${fmt(todaysEnd)}` : "Открыто";
    statusClass = "text-emerald-600";
  } else {
    statusText = parsed.nextOpenLabel ? `Закрыто. ${parsed.nextOpenLabel}` : "Закрыто";
    statusClass = "text-danger";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 text-left"
      >
        <span
          className={[
            "inline-flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0",
            isOpenNow ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-danger",
          ].join(" ")}
        >
          <Icon name="clock" size={18} />
        </span>
        <span className="flex-1 min-w-0">
          <span className={`block text-sm font-semibold ${statusClass}`}>{statusText}</span>
          {workingHours && (
            <span className="block text-[11px] text-muted truncate">{workingHours}</span>
          )}
        </span>
        <Icon name="chevron-right" size={18} className="text-muted flex-shrink-0" />
      </button>

      <WorkingHoursSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        weeklySchedule={parsed.weeklySchedule}
        rawString={workingHours}
      />
    </>
  );
}
