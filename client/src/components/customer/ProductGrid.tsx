import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@shared/schema";

interface ProductGridProps {
  title: string;
  categoryId?: number;
  limit?: number;
  isFlashDeal?: boolean;
  countdown?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function ProductGrid({ 
  title, 
  categoryId, 
  limit, 
  isFlashDeal = false, 
  countdown 
}: ProductGridProps) {
  const [time, setTime] = useState(countdown || { hours: 2, minutes: 45, seconds: 33 });

  // Update countdown timer
  useEffect(() => {
    if (!isFlashDeal) return;

    const timer = setInterval(() => {
      setTime(prevTime => {
        if (prevTime.hours === 0 && prevTime.minutes === 0 && prevTime.seconds === 0) {
          clearInterval(timer);
          return prevTime;
        }

        let newHours = prevTime.hours;
        let newMinutes = prevTime.minutes;
        let newSeconds = prevTime.seconds - 1;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFlashDeal]);

  // Format time with leading zeros
  const formatTime = (time: number) => time.toString().padStart(2, '0');

  // Query products by category if provided
  const queryKey = categoryId 
    ? ['/api/products', { categoryId }] 
    : ['/api/products'];

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey
  });

  // Limit products if specified
  const displayProducts = limit && products 
    ? products.slice(0, limit) 
    : products;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {isFlashDeal && (
          <div className="flex items-center text-primary">
            <span className="text-sm font-medium mr-1">Ends in</span>
            <div className="bg-primary text-white text-xs px-2 py-1 rounded">
              {formatTime(time.hours)}:{formatTime(time.minutes)}:{formatTime(time.seconds)}
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: limit || 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <Skeleton className="w-full h-32 md:h-40" />
              <div className="p-3">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-16 mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          Failed to load products
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayProducts?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
