import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeliveryHeader } from "@/components/delivery/DeliveryHeader";
import { DeliveryItem } from "@/components/delivery/DeliveryItem";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface OrderWithItems extends Order {
  items: any[];
}

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentOrder, setCurrentOrder] = useState<OrderWithItems | null>(null);
  
  // Query all orders assigned to this delivery partner
  const { data: orders, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
    select: (data) => {
      // In a real app, we would filter by deliveryPartnerId === user.id
      // For now, just filter out_for_delivery orders
      return data.filter(order => order.status === 'out_for_delivery');
    },
    enabled: !!user
  });
  
  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      // In a real app, we would assign the order to this delivery partner
      const response = await apiRequest("PUT", `/api/orders/${orderId}`, {
        deliveryPartnerId: user?.id,
        status: "out_for_delivery"
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order accepted",
        description: "You have successfully accepted the order."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept order",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Set current order on initial load
  useEffect(() => {
    if (orders && orders.length > 0 && !currentOrder) {
      // Set the first out_for_delivery order as the current order
      const active = orders.find(order => order.status === 'out_for_delivery');
      if (active) {
        setCurrentOrder(active);
      }
    }
  }, [orders, currentOrder]);
  
  // Handle accepting a new order
  const handleAcceptOrder = (orderId: number) => {
    acceptOrderMutation.mutate(orderId);
  };
  
  // Extract pending orders (not currently being delivered)
  const pendingOrders = orders?.filter(order => {
    return order.status === 'packed' || 
           (order.status === 'out_for_delivery' && 
            currentOrder && order.id !== currentOrder.id);
  }) || [];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <DeliveryHeader />
      
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Failed to load orders. Please try again.
          </div>
        ) : (
          <>
            {/* Current Delivery */}
            {currentOrder ? (
              <DeliveryItem 
                order={currentOrder} 
                orderItems={currentOrder.items.length}
                isCurrent={true}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="10.5" r="1.5" />
                    <circle cx="15.5" cy="10.5" r="1.5" />
                    <path d="M7 16a3 3 0 0 0 5 2h.17a3 3 0 0 0 5-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No Active Deliveries</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  You don't have any active deliveries right now. Accept an order below to get started.
                </p>
              </div>
            )}
            
            {/* Next Orders */}
            {pendingOrders.length > 0 && (
              <>
                <h2 className="text-lg font-bold mb-4">Next Orders</h2>
                
                {pendingOrders.map(order => (
                  <DeliveryItem 
                    key={order.id}
                    order={order}
                    orderItems={order.items.length} 
                    onAccept={handleAcceptOrder}
                  />
                ))}
              </>
            )}
            
            {pendingOrders.length === 0 && !currentOrder && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending orders available. New orders will appear here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Delivery Partner Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="flex justify-around">
          <a href="#" className="flex flex-col items-center py-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-xs mt-1">Home</span>
          </a>
          
          <a href="#" className="flex flex-col items-center py-2 text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            <span className="text-xs mt-1">Routes</span>
          </a>
          
          <a href="#" className="flex flex-col items-center py-2 text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-xs mt-1">Earnings</span>
          </a>
          
          <a href="#" className="flex flex-col items-center py-2 text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
