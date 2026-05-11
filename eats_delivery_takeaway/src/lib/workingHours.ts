// Best-effort parser for free-form working hours strings, e.g.
//   "Пн–Пт 10:00–22:00, Сб–Вс 11:00–23:00"
//   "Mon-Fri 10:00-22:00"
//   "Ежедневно 09:00-23:00"

export interface TimeRange {
  start: number; // minutes since midnight
  end: number;
}

export interface DaySchedule {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ...
  label: string;    // localized full-day name
  ranges: TimeRange[];
}

export interface WorkingHoursInfo {
  isOpenNow: boolean;
  todayLabel?: string;
  /** "Откроется в HH:MM" или "Откроется в HH:MM завтра" */
  nextOpenLabel?: string;
  /** Schedule for all 7 days starting from Monday (or as parsed) */
  weeklySchedule: DaySchedule[];
}

const DAY_MAP: Record<string, number> = {
  // Russian abbreviations
  вс: 0, пн: 1, вт: 2, ср: 3, чт: 4, пт: 5, сб: 6,
  // English abbreviations
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

const DAY_LABELS_RU = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

const ALL_DAY_KEYWORDS = [
  /кругл/i,           // круглосуточно
  /24\s*\/\s*7/i,
  /24\s*ч/i,
  /24h/i,
];

const EVERYDAY_KEYWORDS = [
  /ежеднев/i,         // ежедневно
  /everyday/i,
  /daily/i,
];

function parseTimeRange(text: string): TimeRange | null {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*[\-–—]\s*(\d{1,2})(?::(\d{2}))?/);
  if (!m) return null;
  const start = parseInt(m[1], 10) * 60 + (m[2] ? parseInt(m[2], 10) : 0);
  let end = parseInt(m[3], 10) * 60 + (m[4] ? parseInt(m[4], 10) : 0);
  if (end === 0) end = 24 * 60;
  return { start, end };
}

function parseDayRange(text: string): number[] | null {
  const m = text.toLowerCase().match(/([а-я]{2,3}|[a-z]{3})\s*[\-–—]\s*([а-я]{2,3}|[a-z]{3})/);
  if (m) {
    const a = DAY_MAP[m[1]];
    const b = DAY_MAP[m[2]];
    if (a === undefined || b === undefined) return null;
    const out: number[] = [];
    let i = a;
    for (let c = 0; c < 7; c++) {
      out.push(i);
      if (i === b) break;
      i = (i + 1) % 7;
    }
    return out;
  }
  const single = text.toLowerCase().match(/\b([а-я]{2,3}|[a-z]{3})\b/);
  if (single) {
    const d = DAY_MAP[single[1]];
    return d === undefined ? null : [d];
  }
  return null;
}

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const ALL_DAYS_24_7: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  dayIndex: i,
  label: DAY_LABELS_RU[i],
  ranges: [{ start: 0, end: 24 * 60 }],
}));

export function parseWorkingHours(input?: string | null): WorkingHoursInfo {
  if (!input || !input.trim()) {
    return { isOpenNow: true, weeklySchedule: ALL_DAYS_24_7 };
  }
  const s = input.trim();

  if (ALL_DAY_KEYWORDS.some((re) => re.test(s))) {
    return {
      isOpenNow: true,
      todayLabel: "Круглосуточно",
      weeklySchedule: ALL_DAYS_24_7,
    };
  }

  const now = new Date();
  const today = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  // Build per-day schedule first
  const byDay: Map<number, TimeRange[]> = new Map();
  for (let i = 0; i < 7; i++) byDay.set(i, []);

  try {
    const segments = s.split(",").map((seg) => seg.trim()).filter(Boolean);
    let todayLabel: string | undefined;
    let isOpenNow = false;

    for (const seg of segments) {
      const time = parseTimeRange(seg);
      if (!time) continue;

      const everyday = EVERYDAY_KEYWORDS.some((re) => re.test(seg));
      const days = everyday ? [0, 1, 2, 3, 4, 5, 6] : parseDayRange(seg);

      const targetDays = days && days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6];

      for (const d of targetDays) {
        byDay.get(d)!.push(time);
      }

      if (targetDays.includes(today)) {
        todayLabel = seg;
        if (minutesNow >= time.start && minutesNow < time.end) {
          isOpenNow = true;
        }
      }
    }

    // Compute nextOpenLabel
    let nextOpenLabel: string | undefined;
    if (!isOpenNow) {
      const todayRanges = byDay.get(today) ?? [];
      const upcomingToday = todayRanges
        .filter((r) => r.start > minutesNow)
        .sort((a, b) => a.start - b.start)[0];

      if (upcomingToday) {
        nextOpenLabel = `Откроется в ${fmtTime(upcomingToday.start)}`;
      } else {
        // Look ahead up to 7 days
        for (let offset = 1; offset <= 7; offset++) {
          const d = (today + offset) % 7;
          const ranges = byDay.get(d) ?? [];
          const earliest = ranges.sort((a, b) => a.start - b.start)[0];
          if (earliest) {
            const suffix = offset === 1 ? "завтра" : DAY_LABELS_RU[d].toLowerCase();
            nextOpenLabel = `Откроется в ${fmtTime(earliest.start)} ${suffix}`;
            break;
          }
        }
      }
    }

    const weeklySchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
      dayIndex: i,
      label: DAY_LABELS_RU[i],
      ranges: byDay.get(i) ?? [],
    }));

    return { isOpenNow, todayLabel, nextOpenLabel, weeklySchedule };
  } catch {
    return { isOpenNow: true, weeklySchedule: ALL_DAYS_24_7 };
  }
}
