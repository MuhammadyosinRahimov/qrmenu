import axios from "axios";
import type {
  Category,
  Product,
  ProductDetail,
  Table,
  Order,
  AuthResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://yalla-co-menu-beckend-dev-47c9.twc1.net";

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
      if (!window.location.pathname.includes("/checkout")) {
        window.location.href = "/checkout";
      } else {
        // If already on checkout, reload to show login form
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>("/categories");
  return data;
};

// Products
export const getProducts = async (categoryId?: string): Promise<Product[]> => {
  const params = categoryId ? { categoryId } : {};
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
