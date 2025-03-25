// App constants
export const APP_NAME = "QuickGrocer";
export const APP_TAGLINE = "10 min";
export const APP_CURRENCY = "₹";
export const DEFAULT_DELIVERY_TIME_MIN = 10;

// Authentication
export const OTP_EXPIRES_IN_MINUTES = 5;
export const OTP_LENGTH = 6;

// Order statuses with colors
export const ORDER_STATUSES = {
  pending: {
    label: "Pending",
    color: "red"
  },
  packed: {
    label: "Packed",
    color: "yellow"
  },
  shipped: {
    label: "Shipped",
    color: "blue"
  },
  delivered: {
    label: "Delivered",
    color: "green"
  },
  cancelled: {
    label: "Cancelled",
    color: "neutral"
  }
};

// Payment methods with labels
export const PAYMENT_METHODS = {
  cash: "Cash on Delivery",
  upi: "UPI Payment",
  card: "Credit/Debit Card",
  wallet: "Digital Wallet"
};

// Category icons with colors
export const CATEGORY_ICONS = {
  fruits: {
    icon: "shopping_basket",
    color: "#1e88e5" // primary-600
  },
  dairy: {
    icon: "egg",
    color: "#4caf50" // secondary-600
  },
  beverages: {
    icon: "local_drink",
    color: "#ff9800" // orange-600
  },
  bakery: {
    icon: "bakery_dining",
    color: "#9c27b0" // purple-600
  },
  meat: {
    icon: "restaurant",
    color: "#f44336" // red-600
  },
  frozen: {
    icon: "kitchen",
    color: "#e91e63" // pink-600
  }
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  SEND_OTP: "/api/auth/send-otp",
  VERIFY_OTP: "/api/auth/verify-otp",
  LOGOUT: "/api/auth/logout",
  
  // Products
  PRODUCTS: "/api/products",
  PRODUCT: (id: number) => `/api/products/${id}`,
  SEARCH_PRODUCTS: "/api/products/search",
  
  // Categories
  CATEGORIES: "/api/categories",
  CATEGORY: (id: number) => `/api/categories/${id}`,
  CATEGORY_PRODUCTS: (id: number) => `/api/categories/${id}/products`,
  
  // Cart
  CART: "/api/cart",
  ADD_TO_CART: "/api/cart/add",
  REMOVE_FROM_CART: "/api/cart/remove",
  UPDATE_CART_ITEM: "/api/cart/update",
  
  // Orders
  ORDERS: "/api/orders",
  ORDER: (id: number) => `/api/orders/${id}`,
  CREATE_ORDER: "/api/orders/create",
  UPDATE_ORDER_STATUS: (id: number) => `/api/orders/${id}/status`,
  
  // User
  USER_PROFILE: "/api/users/profile",
  UPDATE_PROFILE: "/api/users/profile",
  
  // Admin
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  ADMIN_ORDERS: "/api/admin/orders",
  ADMIN_PRODUCTS: "/api/admin/products",
  ADMIN_CATEGORIES: "/api/admin/categories",
  ADMIN_USERS: "/api/admin/users",
  
  // Delivery
  DELIVERY_DASHBOARD: "/api/delivery/dashboard",
  DELIVERY_ORDERS: "/api/delivery/orders",
  DELIVERY_ACTIVE_ORDER: "/api/delivery/active-order",
  DELIVERY_LOCATION_UPDATE: "/api/delivery/location",
  DELIVERY_COMPLETE_ORDER: (id: number) => `/api/delivery/orders/${id}/complete`
};

// WebSocket events
export const WS_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ORDER_STATUS_UPDATED: "order_status_updated",
  NEW_ORDER: "new_order",
  DELIVERY_LOCATION_UPDATED: "delivery_location_updated",
  ERROR: "error"
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  CART: "cart",
  THEME: "theme"
};
