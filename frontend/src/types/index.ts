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
  menuId?: string;
  menuName?: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone?: string;
  onlinePaymentAvailable: boolean;
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
  note?: string;
}

export type OrderType = "DineIn" | "Delivery" | "Takeaway";

export const OrderTypeMap: Record<number, OrderType> = {
  0: "DineIn",
  1: "Delivery",
  2: "Takeaway",
};

export const normalizeOrderType = (type: number | string): OrderType => {
  if (typeof type === "number") {
    return OrderTypeMap[type] || "DineIn";
  }
  return type as OrderType;
};

export interface Order {
  id: string;
  userId: string;
  tableId: string;
  tableNumber: number;
  tableName?: string;
  tableTypeName?: string;
  restaurantId?: string;
  restaurantName?: string;
  restaurantPhone?: string;
  createdAt: string;
  status: OrderStatus;
  subtotal: number;
  serviceFee: number;
  total: number;
  specialInstructions?: string;
  items: OrderItem[];
  hasPendingItems?: boolean;
  isPaid?: boolean;
  onlinePaymentAvailable?: boolean;
  paymentLink?: string;
  // New fields for delivery/takeaway
  orderType?: OrderType;
  deliveryAddress?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryFee?: number;
}

export type OrderItemStatus = 'Pending' | 'Active' | 'Cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sizeName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedAddons?: string[];
  status: OrderItemStatus;
  createdAt?: string;
  cancelReason?: string;
  note?: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled";

// Map numeric status to string status
export const OrderStatusMap: Record<number, OrderStatus> = {
  0: "Pending",
  1: "Confirmed",
  3: "Cancelled",
};

// Map numeric item status to string status
export const OrderItemStatusMap: Record<number, OrderItemStatus> = {
  0: "Pending",
  1: "Active",
  2: "Cancelled",
};

// Helper to normalize status (handles both number and string)
export const normalizeOrderStatus = (status: number | string): OrderStatus => {
  if (typeof status === "number") {
    return OrderStatusMap[status] || "Pending";
  }
  return status as OrderStatus;
};

export const normalizeItemStatus = (status: number | string): OrderItemStatus => {
  if (typeof status === "number") {
    return OrderItemStatusMap[status] || "Active";
  }
  return status as OrderItemStatus;
};

export interface AuthResponse {
  token: string;
  userId: string;
  phone: string;
}

// Table Session types for guests
export interface GuestOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sizeName?: string;
  selectedAddons?: string[];
}

export interface GuestOrderSummary {
  orderId: string;
  subtotal: number;           // Сумма без service fee
  serviceFeeShare: number;    // Доля service fee
  total: number;              // Subtotal + ServiceFeeShare
  isPaid: boolean;
  itemCount: number;
  itemsPreview: string;
  maskedPhone?: string;       // Последние 4 цифры телефона "**1234"
  items: GuestOrderItem[];    // Детали заказа
}

export interface GuestSessionInfo {
  sessionId: string;
  guestCount: number;
  myOrderSubtotal: number;        // Сумма моих заказов (без service fee)
  myServiceFeeShare: number;      // Моя доля service fee
  myTotal: number;                // MyOrderSubtotal + MyServiceFeeShare
  tableSubtotal: number;          // Сумма всех заказов
  tableServiceFee: number;        // Service fee на весь стол
  tableTotal: number;             // TableSubtotal + TableServiceFee
  tablePaidAmount: number;
  tableUnpaidAmount: number;
  serviceFeePercent: number;      // Процент (для отображения "10%")
  myOrderIsPaid: boolean;
  canPayForTable: boolean;
  myOrders: GuestOrderSummary[];
  otherOrders: GuestOrderSummary[];
  paymentLink?: string;           // Ссылка для онлайн оплаты
  onlinePaymentAvailable?: boolean; // Доступна ли онлайн оплата
}

export interface PayForTableResponse {
  success: boolean;
  message: string;
  totalPaid: number;
  ordersPaid: number;
  paymentLink?: string;
}
