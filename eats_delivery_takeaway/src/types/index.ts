export * from "./enums";
export * from "./jura";

import type { OrderStatus, OrderType, OrderItemStatus, PaymentMethod } from "./enums";

export interface RestaurantCategory {
  id: string;
  name: string;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  lat?: number;
  lng?: number;
  deliveryEnabled: boolean;
  deliveryFee?: number;
  takeawayEnabled: boolean;
  bookingEnabled?: boolean;
  dineInEnabled?: boolean;
  onlinePaymentAvailable?: boolean;
  acceptingOrders?: boolean;
  pauseMessage?: string;
  rating?: number;
  reviewsCount?: number;
  workingHours?: string;
  prepTimeMinutes?: number;
  deliveryTimeMinMin?: number;
  deliveryTimeMaxMin?: number;
  cuisine?: string;
  categories?: RestaurantCategory[];
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  iconUrl?: string;
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
  categoryId?: string;
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

export interface RestaurantMenu {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
}

export interface CartItem {
  id: string;
  productId: string;
  restaurantId: string;
  productName: string;
  imageUrl?: string;
  sizeId?: string;
  sizeName?: string;
  addonIds: string[];
  addonNames: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
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
  status: OrderItemStatus;
  createdAt?: string;
  cancelReason?: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderType: OrderType;
  restaurantId?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantLat?: number;
  restaurantLng?: number;
  createdAt: string;
  status: OrderStatus;
  subtotal: number;
  serviceFee?: number;
  deliveryFee?: number;
  tipsAmount?: number;
  total: number;
  totalAmount: number;
  specialInstructions?: string;
  cancelReason?: string;
  items: OrderItem[];
  isPaid?: boolean;
  paymentMethod?: PaymentMethod;
  onlinePaymentAvailable?: boolean;
  paymentLink?: string;
  // Delivery fields
  deliveryAddress?: string;
  addressLat?: number;
  addressLng?: number;
  juraAddressId?: string;
  customerName?: string;
  customerPhone?: string;
  // JURA state
  juraOrderId?: string;
  juraStatusId?: number;
  juraStatusName?: string;
  performerName?: string;
  performerPhone?: string;
  driverLat?: number;
  driverLng?: number;
  eta?: number;
  // Takeaway
  pickupTime?: string;
  // Review
  rating?: number;
  reviewComment?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  phone: string | null;
}

export interface TelegramAuthPayload {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramConfig {
  enabled: boolean;
  botUsername?: string | null;
}

export interface Review {
  id: string;
  orderId: string;
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
  comment?: string;
  tips?: number;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  label?: string;
  address: string;
  fullAddress?: string;
  lat: number;
  lng: number;
  juraAddressId?: string;
  entrance?: string;
  apartment?: string;
  floor?: string;
  note?: string;
  isDefault?: boolean;
}

export interface UserPaymentCard {
  id: string;
  brand?: string;
  last4: string;
  holderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  expiryDate?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  phone: string | null;
  name?: string | null;
  surname?: string | null;
  photoUrl?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  email?: string | null;
  language?: string | null;
  currency?: string | null;
  createdAt: string;
  telegramUserId?: number | null;
  telegramUsername?: string | null;
}

export interface UpdateUserProfileRequest {
  name?: string | null;
  surname?: string | null;
  photoUrl?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  email?: string | null;
  language?: string | null;
  currency?: string | null;
}

