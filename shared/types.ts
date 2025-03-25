import { User, Product, Category, Order, OrderItem, Cart, CartItem } from "./schema";

export type UserRole = "customer" | "admin" | "delivery";

export type OrderStatus = "pending" | "packed" | "shipped" | "delivered" | "cancelled";

export type PaymentMethod = "cash" | "upi" | "card" | "wallet";

export type PaymentStatus = "pending" | "completed" | "failed";

export type ProductWithCategory = Product & {
  category: Category;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
  user: User;
};

export type CartWithItems = Cart & {
  items: (CartItem & { product: Product })[];
};

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export interface OTPRequest {
  phone: string;
}

export interface OTPVerifyRequest {
  phone: string;
  otp: string;
}

export interface CategoryStats {
  id: number;
  name: string;
  productCount: number;
}

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  avgDeliveryTime: number;
  activeDeliveries: number;
  trendPercentages: {
    orders: number;
    revenue: number;
    deliveryTime: number;
  };
}

export interface DeliveryStats {
  earningsToday: number;
  deliveriesToday: number;
  avgDeliveryTime: number;
  earningsTrend: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}
