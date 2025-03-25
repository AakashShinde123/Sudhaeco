import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/utils/format";

interface CartItemProps {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
}

export function CartItem({ id, name, image, price, quantity, unit }: CartItemProps) {
  const { updateCartItemQuantity, removeFromCart } = useCart();

  const handleIncrease = () => {
    updateCartItemQuantity(id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateCartItemQuantity(id, quantity - 1);
    } else {
      handleRemove();
    }
  };

  const handleRemove = () => {
    removeFromCart(id);
  };

  return (
    <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-700 pb-4">
      <img 
        src={image} 
        alt={name} 
        className="w-16 h-16 object-cover rounded-md"
      />
      <div className="flex-1">
        <h3 className="font-medium text-sm">{name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{unit}</p>
        <div className="mt-1 text-sm font-bold">{formatCurrency(price)}</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 hover:text-red-500"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded">
          <Button
            variant="ghost"
            size="icon"
            className="px-2 py-1 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={handleDecrease}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="px-2 py-1 text-sm">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="px-2 py-1 h-8 w-8 text-primary hover:text-primary/90"
            onClick={handleIncrease}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
