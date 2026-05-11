export const formatTJS = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) return "0 с.";
  return `${amount.toLocaleString("ru-RU")} с.`;
};

export const formatPhone = (phone: string): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("992")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  if (digits.length === 9) {
    return `+992 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  return phone;
};

export const stripPhone = (phone: string): string => phone.replace(/\D/g, "");

export const normalizePhoneForApi = (phone: string): string => {
  const digits = stripPhone(phone);
  if (digits.length === 9) return `992${digits}`;
  if (digits.length === 12 && digits.startsWith("992")) return digits;
  return digits;
};

export const formatTime = (iso: string | Date | undefined): string => {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

export const formatDateTime = (iso: string | Date | undefined): string => {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return "< 1 мин";
  if (minutes < 60) return `${Math.round(minutes)} мин`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} м`;
  return `${(meters / 1000).toFixed(1)} км`;
};
