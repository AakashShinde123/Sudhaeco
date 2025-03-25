import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/format";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export function Cart() {
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for validating promo code
  const validatePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/promo-codes/validate", {
        code,
        total
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Promo code applied!",
          description: `You saved ${formatCurrency(data.promoCode.calculatedDiscount)}`,
        });
        // In a full implementation, we would store the applied promo code
        // and use it for checkout
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to apply promo code",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsApplyingPromo(false);
    }
  });

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingPromo(true);
    validatePromoMutation.mutate(promoCode);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to log in before checkout",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    navigate("/checkout");
  };

  // Calculate summary
  const subtotal = total;
  const deliveryFee = 30;
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  const grandTotal = subtotal + deliveryFee + taxes;

  return (
    <>
      <SheetHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-lg">Your Cart ({items.length} items)</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>
      
      {items.length > 0 ? (
        <>
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.image}
                price={(item.discountPrice || item.price) * item.quantity}
                quantity={item.quantity}
                unit={item.unit}
              />
            ))}
          </div>
          
          {/* Promo Code */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleApplyPromo}
                disabled={isApplyingPromo}
              >
                Apply
              </Button>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                <span className="font-medium">{formatCurrency(taxes)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-accent-500 hover:bg-accent-600 text-white"
              onClick={handleCheckout}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Proceed to Checkout
            </Button>
            
            <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="inline mr-1 h-3 w-3" />
              Delivery in 10 minutes or less!
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <SheetClose asChild>
            <Button>Start Shopping</Button>
          </SheetClose>
        </div>
      )}
    </>
  );
}
