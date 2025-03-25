import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { LowStockAlert } from "@/components/admin/LowStockAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  
  const [mapConfigured, setMapConfigured] = useState(false);
  
  const handleConfigureMap = () => {
    setMapConfigured(true);
    toast({
      title: "Map configured",
      description: "Store locations are now visible on the map"
    });
  };
  
  const handleRestock = (productId: number) => {
    toast({
      title: "Restock order placed",
      description: `Restock order for product #${productId} has been placed.`
    });
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AdminSidebar />
      
      <div className="ml-64 p-6">
        {/* Admin Header */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="p-2 rounded-lg">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
                  3
                </Badge>
              </Button>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">admin@turbogroceries.com</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Stats */}
        <DashboardStats />
        
        {/* Recent Orders */}
        <OrdersTable />
        
        {/* Store Locations Map and Low Stock Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Store Locations Map */}
          <Card>
            <CardHeader>
              <CardTitle>Store Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {mapConfigured ? (
                <div className="h-64 w-full rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15555.026457945708!2d77.61043853969608!3d12.934854628058645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1463e93da9d1%3A0x5cf7c8a327f3302d!2sKoramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1653987080866!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              ) : (
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-2 mx-auto"
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Google Maps Integration</p>
                    <Button 
                      className="mt-2" 
                      variant="outline"
                      onClick={handleConfigureMap}
                    >
                      Configure Map
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Low Stock Products */}
          <LowStockAlert onRestock={handleRestock} />
        </div>
      </div>
    </div>
  );
}
