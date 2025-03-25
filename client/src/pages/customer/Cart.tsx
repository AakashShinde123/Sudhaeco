import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, subtotal, deliveryFee, total, updateQuantity, applyPromoCode, loading } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingPromo(true);
    try {
      const result = await applyPromoCode(promoCode.trim());
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    setLocation("/checkout");
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <span className="text-gray-500">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <i className="ri-shopping-cart-line text-gray-300 text-5xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet</p>
          <Link href="/">
            <Button className="bg-primary">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center bg-white p-3 rounded-lg shadow-sm"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3">
                  {item.product.imageUrl ? (
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-shopping-basket-line text-gray-300 text-xl"></i>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.unit}</p>
                  <span className="font-bold text-sm">
                    {formatPrice(
                      (item.product.discountPrice || item.product.price) * item.quantity
                    )}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 p-0"
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={loading}
                  >
                    <i className="ri-subtract-line"></i>
                  </Button>
                  <span className="text-sm font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center p-0"
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={loading}
                  >
                    <i className="ri-add-line"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleApplyPromo}
                disabled={isApplyingPromo || !promoCode.trim()}
                className="bg-primary text-white"
              >
                {isApplyingPromo ? "Applying..." : "Apply"}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">{formatPrice(deliveryFee)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            className="w-full py-3 h-12 bg-primary text-white rounded-xl font-bold"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </div>
  );
}
