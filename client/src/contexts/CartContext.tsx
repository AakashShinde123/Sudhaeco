import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = "turboGroceries_cart";

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      // If there's an error, just start with an empty cart
      setItems([]);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  
  // Calculate total
  const total = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);
  
  // Add item to cart
  const addToCart = (product: Product, quantity = 1) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      // If stock is not available
      if (product.stock <= 0) {
        toast({
          title: "Out of stock",
          description: "Sorry, this item is currently out of stock.",
          variant: "destructive"
        });
        return prevItems;
      }
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Check if we have enough stock
        if (newQuantity > product.stock) {
          toast({
            title: "Limited stock",
            description: `Sorry, only ${product.stock} items available.`,
            variant: "destructive"
          });
          updatedItems[existingItemIndex].quantity = product.stock;
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity;
        }
        
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        // Check if we have enough stock
        if (quantity > product.stock) {
          toast({
            title: "Limited stock",
            description: `Sorry, only ${product.stock} items available.`,
            variant: "destructive"
          });
          return [...prevItems, { ...product, quantity: product.stock }];
        } else {
          return [...prevItems, { ...product, quantity }];
        }
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  // Update item quantity
  const updateCartItemQuantity = (productId: number, quantity: number) => {
    setItems(prevItems => {
      const itemIndex = prevItems.findIndex(item => item.id === productId);
      
      if (itemIndex === -1) return prevItems;
      
      // Get the current item
      const item = prevItems[itemIndex];
      
      // Check if we have enough stock
      if (quantity > item.stock) {
        toast({
          title: "Limited stock",
          description: `Sorry, only ${item.stock} items available.`,
          variant: "destructive"
        });
        
        const updatedItems = [...prevItems];
        updatedItems[itemIndex] = { ...item, quantity: item.stock };
        return updatedItems;
      }
      
      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      
      // Otherwise update the quantity
      const updatedItems = [...prevItems];
      updatedItems[itemIndex] = { ...item, quantity };
      return updatedItems;
    });
  };
  
  // Clear cart
  const clearCart = () => {
    setItems([]);
  };
  
  return (
    <CartContext.Provider
      value={{
        items,
        total,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
