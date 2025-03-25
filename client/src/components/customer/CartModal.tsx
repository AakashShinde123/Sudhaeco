import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { 
    items, 
    subtotal, 
    deliveryFee, 
    total, 
    updateQuantity, 
    removeItem,
    applyPromoCode,
    loading
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { toast } = useToast();

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl p-0">
        <SheetHeader className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <SheetTitle className="font-bold text-xl">Your Cart</SheetTitle>
            <SheetClose className="text-gray-500">
              <i className="ri-close-line text-xl"></i>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="p-4 overflow-auto h-[calc(100%-180px)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <i className="ri-shopping-cart-line text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-500">Your cart is empty</p>
              <Button 
                variant="link" 
                className="mt-2 text-primary" 
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between py-3 border-b border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden mr-3">
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
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-gray-500 text-sm">{item.product.unit}</p>
                      <span className="font-bold text-sm">
                        {formatPrice(
                          item.product.discountPrice || item.product.price
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
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

              <div className="mt-4">
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
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{formatPrice(deliveryFee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4">
              <Link href="/checkout">
                <Button
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold h-auto"
                  size="lg"
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
