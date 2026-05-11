// Yandex Maps JS API v2.1 loader (singleton).
// Inject the script once, then resolve with the ymaps namespace.

interface YGeoObjectCollection {
  get(index: number): YGeoObject | null;
  getLength(): number;
}

interface YGeoObject {
  geometry: { getCoordinates(): [number, number] };
  getAddressLine(): string;
}

interface YGeocodeResult {
  geoObjects: YGeoObjectCollection;
}

interface YMapEvents {
  add(event: string, handler: () => void): void;
  remove(event: string, handler: () => void): void;
}

export interface YMap {
  getCenter(): [number, number];
  setCenter(coords: [number, number], zoom?: number): void;
  panTo(coords: [number, number], options?: Record<string, unknown>): Promise<void>;
  destroy(): void;
  events: YMapEvents;
}

export interface YMaps {
  ready(callback: () => void): void;
  Map: new (
    element: HTMLElement | string,
    state: { center: [number, number]; zoom: number; controls?: string[] },
    options?: Record<string, unknown>
  ) => YMap;
  geocode(
    request: string | [number, number],
    options?: { results?: number; lang?: string; kind?: string }
  ): Promise<YGeocodeResult>;
}

declare global {
  interface Window {
    ymaps?: YMaps;
  }
}

const SCRIPT_ID = "6ec5c7c3-c5a8-4f19-b8db-f4cce1b66def";
let cached: Promise<YMaps> | null = null;

export function loadYandexMaps(): Promise<YMaps> {
  if (cached) return cached;
  cached = new Promise<YMaps>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Yandex Maps cannot load on the server"));
      return;
    }
    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps as YMaps));
      return;
    }
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        window.ymaps?.ready(() => resolve(window.ymaps as YMaps));
      });
      existing.addEventListener("error", () => reject(new Error("Yandex Maps script failed to load")));
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "";
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error("Yandex Maps loaded but ymaps is undefined"));
        return;
      }
      window.ymaps.ready(() => resolve(window.ymaps as YMaps));
    };
    script.onerror = () => reject(new Error("Failed to load Yandex Maps script"));
    document.head.appendChild(script);
  }).catch((err) => {
    cached = null;
    throw err;
  });
  return cached;
}
