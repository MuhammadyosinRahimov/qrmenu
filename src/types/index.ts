export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  rating: number;
  calories: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  categoryId: string;
}

export interface ProductDetail extends Product {
  sizes: ProductSize[];
  addons: ProductAddon[];
}

export interface ProductSize {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Table {
  id: string;
  number: number;
  qrCode: string;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  sizeId?: string;
  sizeName?: string;
  addonIds: string[];
  addonNames: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  tableId: string;
  tableNumber: number;
  createdAt: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  specialInstructions?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sizeName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedAddons?: string[];
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export interface AuthResponse {
  token: string;
  userId: string;
  phone: string;
}
