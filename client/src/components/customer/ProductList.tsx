import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductListProps {
  title: string;
  viewAllLink?: string;
  categoryId?: number | null;
  layout?: "grid" | "horizontal" | "scroll";
  limit?: number;
  showDiscount?: boolean;
}

export function ProductList({
  title,
  viewAllLink,
  categoryId = null,
  layout = "grid",
  limit = 0,
  showDiscount = true
}: ProductListProps) {
  // Fetch products
  const queryKey = categoryId !== null 
    ? ['/api/products', `categoryId=${categoryId}`] 
    : ['/api/products'];
    
  const { data: products, isLoading, error } = useQuery({
    queryKey
  });

  // Apply limit if provided
  const displayProducts = limit > 0 && products ? products.slice(0, limit) : products;

  if (isLoading) {
    return (
      <div className="py-3">
        <div className="px-4 mb-2">
          <h2 className="font-bold text-lg">{title}</h2>
        </div>
        
        {layout === "scroll" ? (
          <div className="hide-scrollbar overflow-x-auto">
            <div className="inline-flex px-4 space-x-4">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="w-36">
                  <Skeleton className="w-full h-24 rounded-t-xl" />
                  <div className="p-2">
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index}>
                <Skeleton className="w-full h-28 rounded-t-xl" />
                <div className="p-2">
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error || !products || products.length === 0) {
    return (
      <div className="py-3 px-4">
        <div className="text-sm text-gray-500">No products available.</div>
      </div>
    );
  }

  // Horizontal scrolling layout
  if (layout === "scroll") {
    return (
      <div className="py-3">
        <div className="px-4 mb-2 flex justify-between items-center">
          <h2 className="font-bold text-lg">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-primary text-sm font-medium">
              View All
            </a>
          )}
        </div>
        <div className="hide-scrollbar overflow-x-auto">
          <div className="inline-flex px-4 space-x-4">
            {displayProducts.map((product: Product) => (
              <div key={product.id} className="w-36">
                <ProductCard product={product} showDiscount={showDiscount} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div className="py-3">
      <div className="px-4 mb-2 flex justify-between items-center">
        <h2 className="font-bold text-lg">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-primary text-sm font-medium">
            View All
          </a>
        )}
      </div>
      <div className="px-4 grid grid-cols-2 gap-4">
        {displayProducts.map((product: Product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            layout={layout}
            showDiscount={showDiscount}
          />
        ))}
      </div>
    </div>
  );
}
