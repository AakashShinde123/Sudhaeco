import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { OrderWithItems } from "@shared/types";
import { API_ENDPOINTS, ORDER_STATUSES } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";

export default function CurrentDelivery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch current active delivery
  const { data: currentDelivery, isLoading, error } = useQuery<OrderWithItems>({
    queryKey: [API_ENDPOINTS.DELIVERY_ACTIVE_ORDER],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Mark delivery as completed mutation
  const completeDeliveryMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("PATCH", API_ENDPOINTS.DELIVERY_COMPLETE_ORDER(orderId), {
        status: "delivered"
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.DELIVERY_ACTIVE_ORDER] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.DELIVERY_DASHBOARD] });
      toast({
        title: "Delivery Completed",
        description: "You've successfully completed this delivery.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark the delivery as completed. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-lg">Current Delivery</h2>
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-lg">Current Delivery</h2>
        </div>
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm">
          Failed to load current delivery information. Please try again.
        </div>
      </div>
    );
  }

  if (!currentDelivery) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-lg">Current Delivery</h2>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border p-6 text-center">
          <div className="flex flex-col items-center">
            <span className="material-icons text-neutral-400 dark:text-neutral-500 text-5xl mb-3">
              delivery_dining
            </span>
            <h3 className="font-medium text-lg text-neutral-700 dark:text-neutral-300 mb-1">
              No Active Deliveries
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              You don't have any ongoing deliveries at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleMarkDelivered = () => {
    completeDeliveryMutation.mutate(currentDelivery.id);
  };

  // Get the status label and color for the badge
  const orderStatus = ORDER_STATUSES[currentDelivery.status as keyof typeof ORDER_STATUSES];

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins font-semibold text-lg">Current Delivery</h2>
      </div>
      
      <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border p-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-dark-border">
          <div className="flex items-center">
            <span className="material-icons text-primary-600 dark:text-primary-400 mr-2">
              local_shipping
            </span>
            <div>
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                Order #{currentDelivery.orderNumber}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {currentDelivery.user.name || currentDelivery.user.username} • ₹{(currentDelivery.total / 100).toFixed(0)}
              </p>
            </div>
          </div>
          <Badge variant={orderStatus?.color as any || "blue"}>
            {orderStatus?.label || currentDelivery.status}
          </Badge>
        </div>

        {/* Map Placeholder - In a real implementation, this would be an actual map */}
        <div className="mt-3 relative w-full h-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-icons text-neutral-400 dark:text-neutral-600 text-6xl">map</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface p-3 border-t border-neutral-200 dark:border-dark-border">
            <div className="flex items-center">
              <span className="material-icons text-primary-600 dark:text-primary-400 mr-2">navigation</span>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                ETA: <span className="font-medium">{currentDelivery.estimatedDeliveryTime || 10} minutes</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col space-y-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
              <span className="material-icons text-primary-600 dark:text-primary-400 text-sm">
                store
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Pickup</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">QuickGrocer Store, HSR Layout</p>
            </div>
            <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border">
              <span className="material-icons text-neutral-600 dark:text-neutral-400 text-sm">phone</span>
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mr-3">
              <span className="material-icons text-secondary-600 dark:text-secondary-400 text-sm">
                location_on
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Delivery</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{currentDelivery.address}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border">
              <span className="material-icons text-neutral-600 dark:text-neutral-400 text-sm">phone</span>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center justify-center">
            <span className="material-icons text-sm mr-1">info</span>
            View Details
          </Button>
          <Button 
            variant="secondary" 
            className="flex items-center justify-center"
            onClick={handleMarkDelivered}
            disabled={completeDeliveryMutation.isPending}
          >
            <span className="material-icons text-sm mr-1">verified</span>
            {completeDeliveryMutation.isPending ? "Processing..." : "Mark Delivered"}
          </Button>
        </div>
      </div>
    </div>
  );
}
