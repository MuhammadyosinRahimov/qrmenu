import axios from "axios";
import type {
  Category,
  Product,
  ProductDetail,
  Table,
  Order,
  AuthResponse,
  GuestSessionInfo,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://yalla-co-menu-beckend-dev-47c9.twc1.net";

// SignalR Hub URL
export const getSignalRUrl = (): string => {
  // Убираем /api из базового URL для SignalR
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}/hubs/orders`;
};

// Helper to build full image URL from relative path
export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-logout on expired token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear expired token
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");

      // Redirect to checkout to re-authenticate
      // If already on checkout - do NOT reload to avoid infinite loop
      // Let React handle the state update
      if (!window.location.pathname.includes("/checkout")) {
        window.location.href = "/checkout";
      }
      // If already on checkout, do nothing - React will handle the auth state
    }
    return Promise.reject(error);
  }
);

// Categories
export const getCategories = async (menuId?: string): Promise<Category[]> => {
  const params = menuId ? { menuId } : {};
  const { data } = await api.get<Category[]>("/categories", { params });
  return data;
};

// Products
export const getProducts = async (categoryId?: string, menuId?: string): Promise<Product[]> => {
  const params: Record<string, string> = {};
  if (categoryId) params.categoryId = categoryId;
  if (menuId) params.menuId = menuId;
  const { data } = await api.get<Product[]>("/products", { params });
  return data;
};

export const getProduct = async (id: string): Promise<ProductDetail> => {
  const { data } = await api.get<ProductDetail>(`/products/${id}`);
  return data;
};

// Tables
export const getTableByNumber = async (number: number): Promise<Table> => {
  const { data } = await api.get<Table>(`/tables/by-number/${number}`);
  return data;
};

// Menus
export const getMenu = async (id: string): Promise<{
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
  restaurantName: string;
}> => {
  const { data } = await api.get(`/menus/${id}`);
  return data;
};

// Auth
export const sendOtp = async (phone: string): Promise<void> => {
  await api.post("/auth/send-otp", { phone });
};

export const verifyOtp = async (
  phone: string,
  code: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/verify-otp", {
    phone,
    code,
  });
  return data;
};

// Orders
export const createOrder = async (order: {
  tableId: string;
  specialInstructions?: string;
  items: {
    productId: string;
    sizeId?: string;
    quantity: number;
    addonIds?: string[];
    note?: string;
  }[];
}): Promise<Order> => {
  const { data } = await api.post<Order>("/orders", order);
  return data;
};

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<Order[]>("/orders");
  return data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
};

// Get active order for table
export const getActiveOrder = async (tableId: string): Promise<Order | null> => {
  try {
    const { data } = await api.get<Order>(`/orders/active`, { params: { tableId } });
    return data;
  } catch {
    return null;
  }
};

// Add items to existing order
export const addItemsToOrder = async (
  orderId: string,
  items: {
    productId: string;
    sizeId?: string;
    quantity: number;
    addonIds?: string[];
    note?: string;
  }[]
): Promise<Order> => {
  const { data } = await api.post<Order>(`/orders/${orderId}/items`, { items });
  return data;
};

// Cancel order item
export const cancelOrderItem = async (
  orderId: string,
  itemId: string,
  reason?: string
): Promise<Order> => {
  const { data } = await api.post<Order>(`/orders/${orderId}/items/${itemId}/cancel`, { reason });
  return data;
};

// Get restaurant status (accepting orders)
export const getRestaurantStatus = async (restaurantId: string): Promise<{
  acceptingOrders: boolean;
  pauseMessage?: string;
}> => {
  const { data } = await api.get(`/restaurants/${restaurantId}/status`);
  return data;
};

// Payments
export const createPayment = async (request: {
  orderId: string;
  approveUrl: string;
  declineUrl: string;
  cancelUrl: string;
}): Promise<{
  formUrl: string;
  provider: string;
  formFields: Record<string, string>;
}> => {
  const { data } = await api.post('/payments/create', request);
  return data;
};

export const checkPaymentStatus = async (orderId: string): Promise<{
  success: boolean;
  status: number;
  message: string;
}> => {
  const { data } = await api.get(`/payments/${orderId}/status`);
  return data;
};

// Request cash payment - notifies admin via SignalR
export const requestCashPayment = async (orderId: string): Promise<{
  success: boolean;
  message: string;
  orderId: string;
  tableNumber: number;
  amount: number;
}> => {
  const { data } = await api.post('/payments/cash', { orderId });
  return data;
};

// Table Sessions
export const getMySessionInfo = async (tableId: string): Promise<GuestSessionInfo | null> => {
  try {
    const { data } = await api.get<GuestSessionInfo>('/tablesessions/my-session', { params: { tableId } });
    return data;
  } catch {
    return null;
  }
};

export const payForTable = async (sessionId: string, paymentMethod: 'cash' | 'online'): Promise<{
  success: boolean;
  message: string;
  totalPaid: number;
  ordersPaid: number;
  paymentLink?: string;
}> => {
  const { data } = await api.post(`/tablesessions/${sessionId}/pay-table`, { paymentMethod });
  return data;
};

// Public table orders (without authentication)
export interface PublicTableOrders {
  hasActiveSession: boolean;
  guestCount: number;
  tableTotal: number;
  serviceFeePercent: number;
  orders: {
    maskedPhone?: string;
    itemCount: number;
    subtotal: number;
    isPaid: boolean;
    items: {
      productName: string;
      sizeName?: string;
      quantity: number;
      totalPrice: number;
    }[];
  }[];
}

export const getPublicTableOrders = async (tableId: string): Promise<PublicTableOrders | null> => {
  try {
    // Use axios without token for public endpoint
    const { data } = await axios.get<PublicTableOrders>(
      `${API_BASE_URL}/api/tablesessions/public/table-orders`,
      { params: { tableId } }
    );
    return data;
  } catch {
    return null;
  }
};

// Public Restaurants
export interface PublicRestaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  deliveryEnabled: boolean;
  deliveryFee: number;
  takeawayEnabled: boolean;
  onlinePaymentAvailable: boolean;
}

export const getRestaurants = async (mode?: 'delivery' | 'takeaway'): Promise<PublicRestaurant[]> => {
  const params = mode ? { mode } : {};
  const { data } = await api.get<PublicRestaurant[]>('/restaurants', { params });
  return data;
};

export const getRestaurant = async (id: string): Promise<PublicRestaurant> => {
  const { data } = await api.get<PublicRestaurant>(`/restaurants/${id}`);
  return data;
};

// Restaurant Menu
export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  products: MenuProduct[];
}

export interface MenuProduct {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  sizes: { id: string; name: string; priceModifier: number; isDefault: boolean }[];
  addons: { id: string; name: string; price: number; isAvailable: boolean }[];
}

export interface RestaurantMenu {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
}

export const getRestaurantMenu = async (restaurantId: string): Promise<RestaurantMenu> => {
  const { data } = await api.get<RestaurantMenu>(`/restaurants/${restaurantId}/menu`);
  return data;
};

// New order types
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
  customerName: string;
  customerPhone: string;
  specialInstructions?: string;
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
  specialInstructions?: string;
}

export interface CreateDineInOrderRequest {
  restaurantId: string;
  tableNumber: number;
  items: {
    productId: string;
    sizeId?: string;
    quantity: number;
    addonIds?: string[];
    note?: string;
  }[];
  specialInstructions?: string;
}

export const createDeliveryOrder = async (order: CreateDeliveryOrderRequest): Promise<Order> => {
  const { data } = await api.post<Order>('/orders/delivery', order);
  return data;
};

export const createTakeawayOrder = async (order: CreateTakeawayOrderRequest): Promise<Order> => {
  const { data } = await api.post<Order>('/orders/takeaway', order);
  return data;
};

export const createDineInOrder = async (order: CreateDineInOrderRequest): Promise<Order> => {
  const { data } = await api.post<Order>('/orders/dinein', order);
  return data;
};
