import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@shared/schema";
import { API_ENDPOINTS, ORDER_STATUSES } from "@shared/constants";

interface UpcomingDelivery extends Order {
  estimatedPickup: number; // in minutes
}

export default function UpcomingDeliveries() {
  // Fetch upcoming deliveries
  const { data: upcomingDeliveries, isLoading, error } = useQuery<UpcomingDelivery[]>({
    queryKey: [API_ENDPOINTS.DELIVERY_ORDERS + "/upcoming"],
  });

  if (isLoading) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-lg">Upcoming Deliveries</h2>
        </div>
        <div className="space-y-3">
          {Array(2).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-lg">Upcoming Deliveries</h2>
        </div>
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm">
          Failed to load upcoming deliveries. Please try again.
        </div>
      </div>
    );
  }

  if (!upcomingDeliveries?.length) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-lg">Upcoming Deliveries</h2>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border p-6 text-center">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            No upcoming deliveries at the moment.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins font-semibold text-lg">Upcoming Deliveries</h2>
      </div>
      
      <div className="space-y-3">
        {upcomingDeliveries.map((delivery) => {
          const status = delivery.status;
          const badgeVariant = status === "pending" ? "red" : 
                              status === "packed" ? "yellow" : "neutral";
          const badgeText = status === "pending" ? "Pending Pickup" : 
                           status === "packed" ? "Ready for Pickup" : "Being Packed";
          
          return (
            <div 
              key={delivery.id} 
              className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border p-3"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-3">
                  <span className="material-icons text-neutral-700 dark:text-neutral-400">
                    shopping_bag
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                      Order #{delivery.orderNumber}
                    </h3>
                    <Badge variant={badgeVariant}>
                      {badgeText}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Estimated pickup: {delivery.estimatedPickup} minutes
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
