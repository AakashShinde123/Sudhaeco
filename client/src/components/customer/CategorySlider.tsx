import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Category } from "@shared/schema";

// Icon mapping
const iconMap: Record<string, string> = {
  "ri-shopping-basket-2-line": "🍎",
  "ri-plant-line": "🥬",
  "ri-cup-line": "🥛",
  "ri-restaurant-line": "🥩",
  "ri-bread-line": "🍞",
  "ri-store-2-line": "🥫",
  "ri-ice-cream-line": "🍦",
  "ri-medicine-bottle-line": "🧹"
};

// Color mapping
const colorMap: Record<string, string> = {
  "primary": "bg-primary-100 dark:bg-primary-900 text-primary-500",
  "green": "bg-green-100 dark:bg-green-900 text-green-500",
  "blue": "bg-blue-100 dark:bg-blue-900 text-blue-500",
  "red": "bg-red-100 dark:bg-red-900 text-red-500",
  "yellow": "bg-yellow-100 dark:bg-yellow-900 text-yellow-500",
  "purple": "bg-purple-100 dark:bg-purple-900 text-purple-500",
  "pink": "bg-pink-100 dark:bg-pink-900 text-pink-500",
  "indigo": "bg-indigo-100 dark:bg-indigo-900 text-indigo-500"
};

interface CategorySliderProps {
  onSelectCategory: (categoryId: number) => void;
  selectedCategoryId?: number;
}

export function CategorySlider({ onSelectCategory, selectedCategoryId }: CategorySliderProps) {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">Categories</h2>
        <div className="flex overflow-x-auto space-x-4 pb-2 no-scrollbar">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 text-center">
              <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !categories) {
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load categories
      </div>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-4">Categories</h2>
      <div className="flex overflow-x-auto space-x-4 pb-2 no-scrollbar">
        {categories.map((category) => (
          <div key={category.id} className="flex-shrink-0 text-center">
            <Button
              variant="ghost"
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full mb-1 ${
                colorMap[category.color] || "bg-primary-100 dark:bg-primary-900 text-primary-500"
              } ${
                selectedCategoryId === category.id ? "ring-2 ring-primary" : ""
              } flex flex-col items-center justify-center`}
              onClick={() => onSelectCategory(category.id)}
            >
              <span className="text-2xl" role="img" aria-label={category.name}>
                {iconMap[category.icon] || "🛒"}
              </span>
            </Button>
            <span className="text-xs md:text-sm block">{category.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
