import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Star } from "lucide-react";
import { formatCurrency } from "@/utils/format";

export function DeliveryHeader() {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  
  // Mock data
  const earnings = 850;
  const deliveries = 12;
  const rating = 4.8;
  
  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Turbo <span className="text-accent-300">Delivery</span>
          </h1>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-white p-2 h-auto">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  2
                </span>
              </Button>
            </div>
            
            {/* Status Toggle */}
            <div className="flex items-center">
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
                className="mr-2"
              />
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
        
        {/* Earnings Summary */}
        <div className="mt-4 mb-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Today's Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(earnings)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Deliveries</p>
              <p className="text-2xl font-bold">{deliveries}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Rating</p>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-300 mr-1 fill-current" />
                <p className="text-2xl font-bold">{rating}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
