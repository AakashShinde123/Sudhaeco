import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Store, 
  Users, 
  Bike, 
  Tag, 
  BarChart, 
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
  { label: "Products", icon: Store, href: "/admin/products" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  { label: "Delivery Partners", icon: Bike, href: "/admin/delivery" },
  { label: "Promotions", icon: Tag, href: "/admin/promotions" },
  { label: "Analytics", icon: BarChart, href: "/admin/analytics" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Speedy Admin</h1>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={cn(
              "flex items-center px-4 py-3",
              location === item.href 
                ? "bg-gray-800 text-white" 
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}>
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
            <span className="font-medium text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </span>
          </div>
          <div>
            <p className="font-medium">{user?.name || "Admin User"}</p>
            <p className="text-xs text-gray-400">{user?.email || "admin@speedy.com"}</p>
          </div>
          <button 
            className="ml-auto text-gray-400 hover:text-white"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
