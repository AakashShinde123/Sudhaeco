import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, Navigation, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/utils/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeliveryItemProps {
  order: Order;
  orderItems: number;
  isCurrent?: boolean;
  onAccept?: (orderId: number) => void;
}

export function DeliveryItem({ order, orderItems, isCurrent = false, onAccept }: DeliveryItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(65); // Mock progress percentage
  
  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/orders/${order.id}`, {
        status: "delivered"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order delivered!",
        description: "Order has been marked as delivered successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleMarkAsDelivered = () => {
    updateStatusMutation.mutate();
  };

  const handleAcceptOrder = () => {
    if (onAccept) {
      onAccept(order.id);
    }
  };

  // Format distance for display (mock value)
  const distance = order.id % 5 + 0.5;

  if (isCurrent) {
    return (
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/30 border-b border-primary-100 dark:border-primary-800">
            <h2 className="text-lg font-bold">Current Delivery</h2>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-500 mr-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">#{order.id.toString().padStart(4, '0')} - Customer #{order.userId}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{orderItems} items • {formatCurrency(order.total)}</p>
                </div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold px-2 py-1 rounded">
                In Progress
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <div className="mt-1">
                <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                <div className="w-0.5 h-10 bg-gray-300 dark:bg-gray-600 mx-auto my-1"></div>
                <div className="w-4 h-4 bg-accent-500 rounded-full"></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="mb-3">
                  <p className="text-sm font-medium">Pickup from</p>
                  <p className="text-sm">Turbo Store - Koramangala</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">80 Feet Road, 6th Block, Koramangala</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Deliver to</p>
                  <p className="text-sm">Customer #{order.userId}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.address}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Estimated delivery time</p>
                <p className="text-sm font-bold text-accent-500">
                  {order.estimatedDeliveryTime ? `${order.estimatedDeliveryTime - 5} min left` : "5 min left"}
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-accent-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center justify-center">
                <Phone className="mr-2 h-4 w-4" />
                Call Customer
              </Button>
              <Button 
                className="bg-accent-500 hover:bg-accent-600 text-white flex items-center justify-center"
                onClick={handleMarkAsDelivered}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Delivered
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-500 mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <p className="font-medium">#{order.id.toString().padStart(4, '0')} - Customer #{order.userId}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {orderItems} items • {formatCurrency(order.total)} • {distance.toFixed(1)} km
              </p>
            </div>
          </div>
          <div className="text-accent-500 font-bold text-sm">
            {order.estimatedDeliveryTime ? `${order.estimatedDeliveryTime} min` : "10 min"}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded">
            Fresh Produce
          </span>
          <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded">
            Dairy
          </span>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center"
          onClick={handleAcceptOrder}
        >
          Accept Order
        </Button>
      </CardContent>
    </Card>
  );
}
