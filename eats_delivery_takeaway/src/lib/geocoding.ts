import { loadYandexMaps } from "@/lib/yandexMapsLoader";

export interface GeocodeResult {
  formattedAddress: string;
  lat: number;
  lng: number;
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const ymaps = await loadYandexMaps();
    const res = await ymaps.geocode([lat, lng], { results: 1, lang: "ru_RU" });
    const first = res.geoObjects.get(0);
    if (!first) return null;
    return first.getAddressLine() || null;
  } catch {
    return null;
  }
}

export async function geocodeAddress(
  query: string
): Promise<GeocodeResult | null> {
  try {
    const ymaps = await loadYandexMaps();
    const res = await ymaps.geocode(query, { results: 1, lang: "ru_RU" });
    const first = res.geoObjects.get(0);
    if (!first) return null;
    const coords = first.geometry.getCoordinates();
    return {
      formattedAddress: first.getAddressLine(),
      lat: coords[0],
      lng: coords[1],
    };
  } catch {
    return null;
  }
}
