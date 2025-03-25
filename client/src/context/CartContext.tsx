import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
}

export const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  error: null,
  subtotal: 0,
  deliveryFee: 20,
  total: 0,
  
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  isInCart: () => false,
  getItemQuantity: () => 0,
  applyPromoCode: async () => ({ success: false, message: "Not implemented" }),
});

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(20);
  const [discount, setDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Calculate totals whenever cart items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + deliveryFee - discount);
  }, [items, deliveryFee, discount]);

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiRequest("GET", "/api/cart");
        const data = await response.json();
        setItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const addItem = async (productId: number, quantity: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/cart/add", { productId, quantity });
      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) {
      return removeItem(productId);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("PATCH", "/api/cart/update", { productId, quantity });
      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("DELETE", `/api/cart/remove/${productId}`);
      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item from cart");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest("DELETE", "/api/cart/clear");
      setItems([]);
      setDiscount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (productId: number): boolean => {
    return items.some(item => item.productId === productId);
  };

  const getItemQuantity = (productId: number): number => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const applyPromoCode = async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/cart/promo", { code });
      const data = await response.json();
      
      if (data.success && data.discount) {
        setDiscount(data.discount);
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to apply promo code";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    items,
    loading,
    error,
    subtotal,
    deliveryFee,
    total,
    
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isInCart,
    getItemQuantity,
    applyPromoCode,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
