import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Cart } from "../customer/Cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();
  
  const isAdminRoute = location.startsWith("/admin");
  const isDeliveryRoute = location.startsWith("/delivery");
  
  // Don't show header on admin or delivery routes
  if (isAdminRoute || isDeliveryRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
      {/* Global notification banner */}
      <div className="bg-primary text-white text-center py-2 px-4 text-sm font-medium">
        Use code FIRST10 for ₹100 off on your first order!
        <Button variant="link" size="sm" className="ml-2 text-xs font-bold text-white h-auto p-0">
          Claim Now
        </Button>
      </div>

      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-bold text-primary">
            Sudhamrit <span className="text-accent-500">Sweetness</span>
          </h1>
        </Link>
        
        {/* Address Selector */}
        <div className="hidden md:flex items-center text-sm">
          <MapPin className="text-primary mr-1 h-4 w-4" />
          <span className="font-medium">Deliver to:</span>
          <button className="ml-1 text-primary font-semibold flex items-center">
            Koramangala, Bangalore
            <svg 
              className="ml-1 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="hidden md:block relative w-1/3">
          <Input
            type="text"
            placeholder="Search for groceries..."
            className="w-full pl-4 pr-10 rounded-lg"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6"
          >
            <Search className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Dark Mode Toggle */}
          <ThemeToggle />
          
          {/* Cart Button with Counter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-full sm:max-w-md">
              <Cart />
            </SheetContent>
          </Sheet>
          
          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">My Orders</Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "delivery" && (
                  <DropdownMenuItem asChild>
                    <Link href="/delivery">Delivery Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Login
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Address Bar */}
      <div className="md:hidden px-4 py-2 bg-gray-50 dark:bg-gray-700 flex items-center text-sm">
        <MapPin className="text-primary mr-1 h-4 w-4" />
        <button className="font-medium flex items-center">
          Koramangala, Bangalore
          <svg 
            className="ml-1 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Mobile Search (conditionally shown) */}
      {isSearchOpen && (
        <div className="md:hidden px-4 py-2 bg-white dark:bg-gray-800">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for groceries..."
              className="w-full pl-4 pr-10 rounded-lg"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
