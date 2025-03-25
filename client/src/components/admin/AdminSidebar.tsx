import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Store, 
  Tag, 
  User, 
  Bike, 
  Ticket, 
  MapPin, 
  Settings,
  LogOut
} from "lucide-react";
import { useState } from "react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

function SidebarItem({ icon, label, href, isActive }: SidebarItemProps) {
  return (
    <li>
      <Link href={href}>
        <a className={`flex items-center space-x-3 p-2 rounded-lg ${
          isActive 
            ? "text-primary bg-primary-50 dark:bg-primary-900/30" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}>
          {icon}
          <span>{label}</span>
        </a>
      </Link>
    </li>
  );
}

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300`}>
      {/* Admin Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-primary">
            Turbo <span className="text-accent-500">Admin</span>
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={isCollapsed ? "mx-auto" : ""}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          )}
        </Button>
      </div>
      
      {/* Admin Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Dashboard"} 
            href="/admin" 
            isActive={location === "/admin"} 
          />
          <SidebarItem 
            icon={<ShoppingBag className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Orders"} 
            href="/admin/orders" 
            isActive={location === "/admin/orders"} 
          />
          <SidebarItem 
            icon={<Store className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Products"} 
            href="/admin/products" 
            isActive={location === "/admin/products"} 
          />
          <SidebarItem 
            icon={<Tag className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Categories"} 
            href="/admin/categories" 
            isActive={location === "/admin/categories"} 
          />
          <SidebarItem 
            icon={<User className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Customers"} 
            href="/admin/customers" 
            isActive={location === "/admin/customers"} 
          />
          <SidebarItem 
            icon={<Bike className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Delivery Partners"} 
            href="/admin/delivery" 
            isActive={location === "/admin/delivery"} 
          />
          <SidebarItem 
            icon={<Ticket className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Promotions"} 
            href="/admin/promotions" 
            isActive={location === "/admin/promotions"} 
          />
          <SidebarItem 
            icon={<MapPin className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Store Locations"} 
            href="/admin/locations" 
            isActive={location === "/admin/locations"} 
          />
          <SidebarItem 
            icon={<Settings className="h-5 w-5" />} 
            label={isCollapsed ? "" : "Settings"} 
            href="/admin/settings" 
            isActive={location === "/admin/settings"} 
          />
          
          <li className="mt-auto pt-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
