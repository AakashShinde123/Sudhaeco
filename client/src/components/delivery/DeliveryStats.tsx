import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryStats } from "@shared/types";
import { API_ENDPOINTS, APP_CURRENCY } from "@shared/constants";

export default function DeliveryStatsComponent() {
  const { data: stats, isLoading, error } = useQuery<DeliveryStats>({
    queryKey: [API_ENDPOINTS.DELIVERY_DASHBOARD],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 my-6">
        {Array(2).fill(0).map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32 mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="my-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400">
        Failed to load delivery statistics. Please try again.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 my-6">
      <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Today's Earnings</p>
            <h3 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
              {APP_CURRENCY}{(stats.earningsToday / 100).toFixed(0)}
            </h3>
          </div>
          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <span className="material-icons text-primary-600 dark:text-primary-400">payments</span>
          </div>
        </div>
        <div className="mt-2 flex items-center text-secondary-600 dark:text-secondary-400 text-xs">
          <span className="material-icons text-sm mr-1">
            {stats.earningsTrend > 0 ? "trending_up" : "trending_down"}
          </span>
          <span>
            {APP_CURRENCY}{Math.abs(stats.earningsTrend / 100).toFixed(0)} {stats.earningsTrend > 0 ? "more" : "less"} than yesterday
          </span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Deliveries Today</p>
            <h3 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">{stats.deliveriesToday}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <span className="material-icons text-blue-600 dark:text-blue-400">delivery_dining</span>
          </div>
        </div>
        <div className="mt-2 flex items-center text-secondary-600 dark:text-secondary-400 text-xs">
          <span className="material-icons text-sm mr-1">history</span>
          <span>Avg. time: {stats.avgDeliveryTime.toFixed(1)} minutes</span>
        </div>
      </div>
    </div>
  );
}
