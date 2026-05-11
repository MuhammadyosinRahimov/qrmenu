import axios from "axios";
import type {
  AuthResponse,
  Restaurant,
  RestaurantMenu,
  Order,
  Review,
  UserAddress,
  UserPaymentCard,
  UserProfile,
  UpdateUserProfileRequest,
  TelegramAuthPayload,
  TelegramConfig,
} from "@/types";
import type { JuraAddress, JuraTariff, JuraDeliveryCalc, JuraPosition } from "@/types/jura";
import {
  normalizeOrderStatus,
  normalizeOrderType,
  normalizeItemStatus,
  type PaymentMethod,
} from "@/types/enums";

const resolveBaseUrl = (): string => {
  // Browser: always hit the same origin — Next.js rewrites /api/* and /hubs/* to
  // the backend (see next.config.ts). This avoids CORS and keeps cookies/SignalR
  // on a single host.
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  // Server (SSR / route handlers): use the internal docker hostname when
  // available, otherwise fall back to the public URL or localhost.
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5079"
  );
};

const API_BASE_URL = resolveBaseUrl();

export const getSignalRUrl = (): string => {
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${base}/hubs/orders`;
};

export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  const normalized = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${normalized}`;
  }
  return `${API_BASE_URL}${normalized}`;
};

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    // Bypass ngrok browser-warning interstitial for AJAX requests when the
    // frontend is served through an ngrok-free.app domain.
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");
      const path = window.location.pathname;
      if (!path.includes("/checkout") && !path.includes("/")) {
        // Redirect handled by caller/checkout guard
      }
    }
    return Promise.reject(error);
  }
);

// -------------------- Auth --------------------
export interface SendOtpResponse {
  message?: string;
  devCode?: string | null;
}

export const extractApiError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
  const { data } = await api.post<SendOtpResponse>("/auth/send-otp", { phone });
  return data ?? {};
};

export const verifyOtp = async (phone: string, code: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/verify-otp", { phone, code });
  return data;
};

export const getTelegramConfig = async (): Promise<TelegramConfig> => {
  const { data } = await api.get<TelegramConfig>("/auth/telegram/config");
  return data;
};

export const loginTelegram = async (payload: TelegramAuthPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/telegram", {
    id: payload.id,
    firstName: payload.first_name,
    lastName: payload.last_name,
    username: payload.username,
    photoUrl: payload.photo_url,
    authDate: payload.auth_date,
    hash: payload.hash,
  });
  return data;
};

export const linkPhoneSendOtp = async (phone: string): Promise<void> => {
  await api.post("/users/me/link-phone/send-otp", { phone });
};

export const linkPhoneVerifyOtp = async (phone: string, code: string): Promise<UserProfile> => {
  const { data } = await api.post<UserProfile>("/users/me/link-phone/verify-otp", { phone, code });
  return data;
};

// -------------------- Restaurants --------------------
// Backend (PublicRestaurantDto) sends `latitude/longitude/deliveryTimeMinMin/deliveryTimeMaxMin/cuisine`.
// The UI was written against `lat/lng/prepTimeMinutes`. Normalize on read so
// existing components keep working without a sweeping rename.
const normalizeRestaurant = (raw: any): Restaurant => {
  if (!raw || typeof raw !== "object") return raw as Restaurant;
  const lat = raw.lat ?? raw.latitude ?? undefined;
  const lng = raw.lng ?? raw.longitude ?? undefined;
  const minPrep = raw.prepTimeMinutes ?? raw.deliveryTimeMinMin ?? undefined;
  const maxPrep = raw.deliveryTimeMaxMin ?? undefined;
  return {
    ...raw,
    lat,
    lng,
    prepTimeMinutes: minPrep,
    deliveryTimeMinMin: raw.deliveryTimeMinMin ?? undefined,
    deliveryTimeMaxMin: maxPrep,
    cuisine: raw.cuisine ?? undefined,
    categories: Array.isArray(raw.categories) ? raw.categories : undefined,
  } as Restaurant;
};

export const getRestaurants = async (
  mode?: "delivery" | "takeaway",
  categoryId?: string
): Promise<Restaurant[]> => {
  const params: Record<string, string> = {};
  if (mode) params.mode = mode;
  if (categoryId) params.categoryId = categoryId;
  const { data } = await api.get<Restaurant[]>("/restaurants", { params });
  return Array.isArray(data) ? data.map(normalizeRestaurant) : [];
};

export const getRestaurant = async (id: string): Promise<Restaurant> => {
  const { data } = await api.get<Restaurant>(`/restaurants/${id}`);
  return normalizeRestaurant(data);
};

export const getRestaurantCategories = async (): Promise<import("@/types").RestaurantCategory[]> => {
  const { data } = await api.get<import("@/types").RestaurantCategory[]>(
    "/restaurant-categories"
  );
  return Array.isArray(data) ? data : [];
};

export const getRestaurantMenu = async (restaurantId: string): Promise<RestaurantMenu> => {
  const { data } = await api.get<RestaurantMenu>(`/restaurants/${restaurantId}/menu`);
  return data;
};

export const getRestaurantStatus = async (
  id: string
): Promise<{ acceptingOrders: boolean; pauseMessage?: string }> => {
  const { data } = await api.get(`/restaurants/${id}/status`);
  return data;
};

export const getRestaurantReviews = async (
  id: string,
  page = 1,
  pageSize = 20
): Promise<Review[]> => {
  const { data } = await api.get<Review[]>(`/restaurants/${id}/reviews`, {
    params: { page, pageSize },
  });
  return data;
};

// -------------------- JURA / Delivery --------------------
interface JuraAddressApiResult {
  id: string;
  address: string;
  title?: string | null;
  body?: string | null;
  lat: number;
  lng: number;
}

export const searchJuraAddress = async (
  text: string,
  divisionId = 6
): Promise<JuraAddress[]> => {
  if (!text || text.trim().length < 3) return [];
  const { data } = await api.get<JuraAddressApiResult[]>("/delivery/address/search", {
    params: { text, division_id: divisionId },
  });
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.address,
    fullAddress: r.title || r.body || undefined,
    lat: r.lat,
    lng: r.lng,
  }));
};

export interface CalculateDeliveryRequest {
  tariffId?: number;
  phone?: string;
  fromAddress?: { lat: number; lng: number; id?: string; address?: string };
  toAddress?: { lat: number; lng: number; id?: string; address?: string };
}

export const calculateDelivery = async (
  req: CalculateDeliveryRequest
): Promise<JuraDeliveryCalc> => {
  const { data } = await api.post<JuraDeliveryCalc>("/delivery/calculate", req);
  return data;
};

export const getJuraTariffs = async (): Promise<JuraTariff[]> => {
  const { data } = await api.get<JuraTariff[]>("/delivery/tariffs");
  return data;
};

// -------------------- Orders --------------------
// Backend returns enums as numbers (no JsonStringEnumConverter) and uses
// JuraPerformerName/JuraPerformerPhone instead of performerName/performerPhone.
// `total` is the canonical total — there is no `totalAmount` on the wire.
// Normalize the payload so the UI can rely on the typed Order shape.
const normalizeOrder = (raw: any): Order => {
  if (!raw || typeof raw !== "object") return raw as Order;
  const status = normalizeOrderStatus(raw.status);
  const orderType = raw.orderType !== undefined ? normalizeOrderType(raw.orderType) : raw.orderType;
  const total = typeof raw.total === "number" ? raw.total : raw.totalAmount;
  return {
    ...raw,
    status,
    orderType,
    total,
    totalAmount: total,
    performerName: raw.performerName ?? raw.juraPerformerName ?? null,
    performerPhone: raw.performerPhone ?? raw.juraPerformerPhone ?? null,
    items: Array.isArray(raw.items)
      ? raw.items.map((it: any) => ({
          ...it,
          status: it?.status !== undefined ? normalizeItemStatus(it.status) : it?.status,
        }))
      : raw.items,
  } as Order;
};

export interface CreateDeliveryOrderRequest {
  restaurantId: string;
  items: {
    productId: string;
    sizeId?: string;
    quantity: number;
    addonIds?: string[];
    note?: string;
  }[];
  deliveryAddress: string;
  addressLat?: number;
  addressLng?: number;
  juraAddressId?: string;
  tariffId?: number;
  deliveryFee?: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  tipsAmount?: number;
  specialInstructions?: string;
  acceptedTerms: boolean;
}

export interface CreateTakeawayOrderRequest {
  restaurantId: string;
  items: {
    productId: string;
    sizeId?: string;
    quantity: number;
    addonIds?: string[];
    note?: string;
  }[];
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  pickupTime?: string;
  specialInstructions?: string;
  acceptedTerms: boolean;
}

export const createDeliveryOrder = async (order: CreateDeliveryOrderRequest): Promise<Order> => {
  const { data } = await api.post<Order>("/orders/delivery", order);
  return normalizeOrder(data);
};

export const createTakeawayOrder = async (order: CreateTakeawayOrderRequest): Promise<Order> => {
  const { data } = await api.post<Order>("/orders/takeaway", order);
  return normalizeOrder(data);
};

export interface AddItemsToOrderRequest {
  items: {
    productId: string;
    sizeId?: string;
    quantity: number;
    addonIds?: string[];
    note?: string;
  }[];
}

export const addItemsToOrder = async (
  orderId: string,
  request: AddItemsToOrderRequest
): Promise<Order> => {
  const { data } = await api.post<Order>(`/orders/${orderId}/items`, request);
  return normalizeOrder(data);
};

export const getMyOrders = async (filter: "active" | "history" = "active"): Promise<Order[]> => {
  const { data } = await api.get<Order[]>("/orders", { params: { filter } });
  return Array.isArray(data) ? data.map(normalizeOrder) : [];
};

export const getOrder = async (id: string): Promise<Order> => {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return normalizeOrder(data);
};

export const getDriverPosition = async (orderId: string): Promise<JuraPosition | null> => {
  try {
    const { data } = await api.get<JuraPosition>(`/orders/${orderId}/driver-position`);
    return data;
  } catch {
    return null;
  }
};

export interface CreateReviewRequest {
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
  comment?: string;
  tips?: number;
}

export const createReview = async (orderId: string, review: CreateReviewRequest): Promise<Review> => {
  const { data } = await api.post<Review>(`/orders/${orderId}/review`, review);
  return data;
};

// -------------------- Payments --------------------
export const createPayment = async (req: {
  orderId: string;
  approveUrl: string;
  declineUrl: string;
  cancelUrl: string;
}): Promise<{ formUrl: string; provider: string; formFields: Record<string, string> }> => {
  const { data } = await api.post("/payments/create", req);
  return data;
};

export const requestCashPayment = async (orderId: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post("/payments/cash", { orderId });
  return data;
};

export const checkPaymentStatus = async (
  orderId: string
): Promise<{ success: boolean; status: string; message: string }> => {
  const { data } = await api.get(`/payments/${orderId}/status`);
  return data;
};

// -------------------- Customer profile (under /api/users/me/*) --------------------
export const getMe = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>("/users/me");
  return data;
};

export const updateMe = async (body: UpdateUserProfileRequest): Promise<UserProfile> => {
  const { data } = await api.put<UserProfile>("/users/me", body);
  return data;
};

export const getCustomerAddresses = async (): Promise<UserAddress[]> => {
  const { data } = await api.get<UserAddress[]>("/users/me/addresses");
  return data;
};

export const createCustomerAddress = async (
  address: Partial<UserAddress>
): Promise<UserAddress> => {
  const { data } = await api.post<UserAddress>("/users/me/addresses", address);
  return data;
};

export const updateCustomerAddress = async (
  id: string,
  address: Partial<UserAddress>
): Promise<UserAddress> => {
  const { data } = await api.put<UserAddress>(`/users/me/addresses/${id}`, address);
  return data;
};

export const deleteCustomerAddress = async (id: string): Promise<void> => {
  await api.delete(`/users/me/addresses/${id}`);
};

export const getCustomerCards = async (): Promise<UserPaymentCard[]> => {
  const { data } = await api.get<UserPaymentCard[]>("/users/me/cards");
  return data;
};

export const createCustomerCard = async (card: {
  cardNumber: string;
  holderName: string;
  expiryDate: string;
}): Promise<UserPaymentCard> => {
  const last4 = card.cardNumber.slice(-4);
  const body = {
    cardMask: last4,
    brand: null,
    tokenEncrypted: null,
  };
  const { data } = await api.post<UserPaymentCard>("/users/me/cards", body);
  return data;
};

export const deleteCustomerCard = async (id: string): Promise<void> => {
  await api.delete(`/users/me/cards/${id}`);
};

