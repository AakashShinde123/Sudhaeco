import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Product } from "@shared/schema";

// Define low stock thresholds
const CRITICAL_THRESHOLD = 5;
const WARNING_THRESHOLD = 10;

interface LowStockAlertProps {
  onRestock?: (productId: number) => void;
}

export function LowStockAlert({ onRestock }: LowStockAlertProps) {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  const lowStockProducts = products?.filter(product => product.stock <= WARNING_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  const handleRestock = (productId: number) => {
    if (onRestock) {
      onRestock(productId);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold">Low Stock Alert</h2>
        <Button variant="link" className="text-primary hover:text-primary/90 font-medium text-sm">
          Restock All
        </Button>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Failed to load products
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {lowStockProducts?.map((product) => (
              <li key={product.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded flex items-center justify-center mr-3 ${
                    product.stock <= CRITICAL_THRESHOLD 
                      ? "bg-red-100 dark:bg-red-900 text-red-500" 
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-500"
                  }`}>
                    {product.stock <= CRITICAL_THRESHOLD ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Only {product.stock} {product.stock === 1 ? 'item' : 'items'} left
                    </p>
                  </div>
                </div>
                <Button 
                  variant="link" 
                  className="text-sm text-primary hover:text-primary/90 font-medium"
                  onClick={() => handleRestock(product.id)}
                >
                  Order
                </Button>
              </li>
            ))}
            {(!lowStockProducts || lowStockProducts.length === 0) && (
              <li className="py-6 text-center text-gray-500">
                All products are well-stocked
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
