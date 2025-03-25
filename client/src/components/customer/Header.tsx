import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Search, Truck } from "lucide-react";

interface HeaderProps {
  onCartOpen: () => void;
  onSearchOpen?: () => void;
}

export function Header({ onCartOpen, onSearchOpen }: HeaderProps) {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [, setLocation] = useLocation();
  const [isAddressMenuOpen, setIsAddressMenuOpen] = useState(false);

  const userAddress = user?.address || "Set your location";

  const handleAddressClick = () => {
    setIsAddressMenuOpen(!isAddressMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <a className="font-bold text-xl text-primary">
              <span>Speedy</span>
            </a>
          </Link>
          <div 
            className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-sm cursor-pointer"
            onClick={handleAddressClick}
          >
            <i className="ri-map-pin-line mr-1 text-primary"></i>
            <span className="truncate max-w-[150px]">{userAddress}</span>
            <i className="ri-arrow-down-s-line ml-1"></i>
          </div>
          
          {isAddressMenuOpen && (
            <div className="absolute top-16 left-4 bg-white rounded-lg shadow-md p-3 z-50">
              <div className="text-sm font-medium mb-2">Update your address</div>
              <input 
                type="text" 
                placeholder="Enter your address"
                className="w-full p-2 border rounded-md text-sm"
                defaultValue={user?.address || ""}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Update user's address
                    setIsAddressMenuOpen(false);
                  }
                }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="text-gray-700" 
            aria-label="Search"
            onClick={onSearchOpen}
          >
            <Search className="h-5 w-5" />
          </button>
          <button 
            className="relative" 
            aria-label="Cart"
            onClick={onCartOpen}
          >
            <i className="ri-shopping-cart-line text-xl"></i>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-primary text-white p-2 text-center text-sm font-medium">
        <span>Delivery within </span>
        <span className="font-bold">10 minutes</span>
        <span> to your location</span>
      </div>
    </header>
  );
}
