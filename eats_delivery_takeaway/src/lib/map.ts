import L from "leaflet";

export const DEFAULT_CENTER: [number, number] = [38.5598, 68.787]; // Dushanbe
export const DEFAULT_ZOOM = 13;

export const makeDivIcon = (color: string, label: string): L.DivIcon => {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      color:white;
      width:40px;height:40px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:600;font-size:18px;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      border:2px solid white;
    ">${label}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export const restaurantIcon: L.DivIcon = makeDivIcon("#bc6c25", "R");
export const customerIcon: L.DivIcon = makeDivIcon("#FC8019", "Я");
export const driverIcon: L.DivIcon = makeDivIcon("#1e88e5", "🏍");

export const boundsFromPoints = (points: Array<[number, number]>): L.LatLngBounds => {
  const valid = points.filter((p) => p && !isNaN(p[0]) && !isNaN(p[1]));
  if (valid.length === 0) {
    return L.latLngBounds([L.latLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1])]);
  }
  const bounds = L.latLngBounds(valid.map((p) => L.latLng(p[0], p[1])));
  return bounds;
};
