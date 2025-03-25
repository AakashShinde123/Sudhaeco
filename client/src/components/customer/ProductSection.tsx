import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProductCard, { ProductCardSkeleton } from "@/components/customer/ProductCard";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import { API_ENDPOINTS } from "@shared/constants";

interface ProductSectionProps {
  title: string;
  categoryId?: number;
  endpoint: string;
  limit?: number;
}

export default function ProductSection({ 
  title, 
  categoryId, 
  endpoint, 
  limit = 10 
}: ProductSectionProps) {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [endpoint],
  });

  const displayedProducts = products?.slice(0, limit);

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins font-semibold text-lg">{title}</h2>
        {categoryId && (
          <Link href={`/categories/${categoryId}`}>
            <a className="text-primary-600 dark:text-primary-400 text-sm font-medium">
              See All
            </a>
          </Link>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array(limit).fill(0).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm">
          Failed to load products. Please try again.
        </div>
      ) : !displayedProducts?.length ? (
        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
